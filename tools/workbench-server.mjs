import http from 'node:http';
import { execFile } from 'node:child_process';
import { readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolsDirectory, '..');
const contentFile = path.join(projectRoot, 'content', 'site.json');
const port = Number(process.env.PORT || 4310);
const host = '127.0.0.1';

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon']
]);

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(text);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error('请求内容超过 1 MB 限制');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}不能为空`);
}

function validateContent(data) {
  if (!data || typeof data !== 'object') throw new Error('网站内容格式无效');
  requireString(data.meta?.siteTitle, '浏览器标题');
  requireString(data.meta?.description, '搜索摘要');
  if (!/^#[0-9a-f]{6}$/i.test(data.meta?.accent || '')) throw new Error('主题色格式无效');
  if (data.visual) {
    if (!Number.isFinite(data.visual.particleDensity) || data.visual.particleDensity < 30 || data.visual.particleDensity > 500) throw new Error('粒子密度超出范围');
    if (!Number.isFinite(data.visual.flowSpeed) || data.visual.flowSpeed <= 0 || data.visual.flowSpeed > 2) throw new Error('流动速度超出范围');
    if (!/^#[0-9a-f]{6}$/i.test(data.visual.primaryColor || '') || !/^#[0-9a-f]{6}$/i.test(data.visual.secondaryColor || '')) throw new Error('流场颜色格式无效');
  }
  requireString(data.profile?.name, '显示姓名');
  requireString(data.profile?.headline, '首页主标题');
  requireString(data.profile?.introduction, '个人简介');
  if (!Array.isArray(data.focus) || !Array.isArray(data.credentials)) throw new Error('关注方向或能力概览格式无效');
  if (!Array.isArray(data.projects) || data.projects.length === 0) throw new Error('至少需要一个代表项目');
  if (!Array.isArray(data.services) || data.services.length === 0) throw new Error('至少需要一个合作服务');
  data.projects.forEach((project, index) => {
    requireString(project.title, `项目 ${index + 1} 名称`);
    requireString(project.summary, `项目 ${index + 1} 说明`);
    try { new URL(project.url); } catch { throw new Error(`项目 ${index + 1} 网址无效`); }
  });
  data.services.forEach((service, index) => {
    requireString(service.title, `服务 ${index + 1} 标题`);
    requireString(service.description, `服务 ${index + 1} 说明`);
  });
  requireString(data.contact?.email, '邮箱');
  requireString(data.contact?.wechat, '微信');
  try { new URL(data.contact?.github); } catch { throw new Error('GitHub 主页地址无效'); }
}

async function runGit(args) {
  const safeDirectory = projectRoot.replaceAll('\\', '/');
  return execFileAsync('git', [
    '-c', `safe.directory=${safeDirectory}`,
    '-c', 'http.sslBackend=openssl',
    '-c', 'http.version=HTTP/1.1',
    ...args
  ], { cwd: projectRoot, windowsHide: true, timeout: 180_000 });
}

async function gitSucceeds(args) {
  try {
    await runGit(args);
    return true;
  } catch {
    return false;
  }
}

function friendlyGitError(error) {
  const details = `${error?.stderr || ''}\n${error?.stdout || ''}\n${error?.message || ''}`;
  if (/non-fast-forward|fetch first|rejected/i.test(details)) return '远程仓库有更新，自动合并没有完成。请重试发布；若仍失败，请在工作台外检查远程更改。';
  if (/Authentication failed|could not read Username|403|Permission denied/i.test(details)) return 'GitHub 身份验证失败。请先在这台电脑上登录 GitHub，然后重试发布。';
  if (/Failed to connect|Could not resolve host|Connection.*closed|timed out/i.test(details)) return '暂时无法连接 GitHub。你的更改已经保存在本地，请检查网络后重试发布。';
  if (/CONFLICT|Automatic merge failed/i.test(details)) return '远程文件与本地文件发生冲突，已取消自动合并，本地内容没有丢失。';
  return 'GitHub 发布失败。本地内容和提交均已保留，请稍后重试。';
}

async function synchronizeRemote() {
  await runGit(['fetch', 'origin', 'main']);
  if (!await gitSucceeds(['rev-parse', '--verify', 'origin/main'])) return;
  if (await gitSucceeds(['merge-base', '--is-ancestor', 'origin/main', 'HEAD'])) return;

  const related = await gitSucceeds(['merge-base', 'HEAD', 'origin/main']);
  const mergeArgs = related
    ? ['merge', 'origin/main', '--no-edit']
    : ['merge', 'origin/main', '--allow-unrelated-histories', '--no-edit', '-X', 'ours'];

  try {
    await runGit(mergeArgs);
  } catch (error) {
    await runGit(['merge', '--abort']).catch(() => {});
    throw error;
  }
}

function resolveStaticPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  if (cleanPath === '/') return path.join(projectRoot, 'index.html');
  if (cleanPath === '/workbench' || cleanPath === '/workbench/') return path.join(projectRoot, 'workbench', 'index.html');
  const allowed = ['/assets/', '/content/', '/workbench/'];
  if (!allowed.some((prefix) => cleanPath.startsWith(prefix))) return null;
  const filePath = path.resolve(projectRoot, `.${cleanPath}`);
  return filePath.startsWith(projectRoot) ? filePath : null;
}

async function serveStatic(urlPath, response) {
  const filePath = resolveStaticPath(urlPath);
  if (!filePath) return sendText(response, 404, 'Not found');
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return sendText(response, 404, 'Not found');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
      'Cache-Control': filePath.endsWith('site.json') ? 'no-store' : 'no-cache'
    });
    response.end(body);
  } catch {
    sendText(response, 404, 'Not found');
  }
}

async function handleApi(request, response, url) {
  if (url.pathname === '/api/content' && request.method === 'GET') {
    return sendJson(response, 200, JSON.parse(await readFile(contentFile, 'utf8')));
  }

  if (url.pathname === '/api/content' && request.method === 'PUT') {
    const data = await readJsonBody(request);
    validateContent(data);
    const temporaryFile = `${contentFile}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await rename(temporaryFile, contentFile);
    return sendJson(response, 200, { message: '内容已保存' });
  }

  if (url.pathname === '/api/status' && request.method === 'GET') {
    const [{ stdout: statusOutput }, { stdout: remoteOutput }] = await Promise.all([
      runGit(['status', '--short']),
      runGit(['remote', 'get-url', 'origin'])
    ]);
    return sendJson(response, 200, { dirty: Boolean(statusOutput.trim()), remote: remoteOutput.trim() });
  }

  if (url.pathname === '/api/publish' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const message = String(body.message || 'Update personal website').trim().slice(0, 120);
    requireString(message, '提交说明');
    try {
      const { stdout: before } = await runGit(['status', '--porcelain']);
      if (before.trim()) {
        await runGit(['add', '--all']);
        await runGit(['commit', '-m', message]);
      }
      await synchronizeRemote();
      const { stdout: ahead } = await runGit(['rev-list', '--count', 'origin/main..HEAD']);
      if (Number(ahead.trim()) === 0) return sendJson(response, 200, { message: 'GitHub 已经是最新版本' });
      await runGit(['push', '--set-upstream', 'origin', 'HEAD:main']);
      return sendJson(response, 200, { message: '已推送到 GitHub，正在自动部署' });
    } catch (error) {
      console.error(error);
      return sendJson(response, 502, { error: friendlyGitError(error) });
    }
  }

  sendJson(response, 404, { error: '接口不存在' });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(request, response, url);
    await serveStatic(url.pathname, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: error.message || '服务器错误' });
  }
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}/workbench/`;
  console.log(`GarryLee 网站工作台：${url}`);
  if (process.env.NO_OPEN !== '1' && !process.argv.includes('--no-open')) {
    const command = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['open', [url]];
    execFile(command[0], command[1], { windowsHide: true }, () => {});
  }
});
