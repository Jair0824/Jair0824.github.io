import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySiteBindings, buildRobots, buildSitemap } from './site-bindings.mjs';
import { validateContent } from './validate-content.mjs';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolsDirectory, '..');
const output = path.join(projectRoot, '_site');
const contentFile = path.join(projectRoot, 'content', 'site.json');

const pages = [
  { file: 'index.html', page: 'academic' },
  { file: 'work.html', page: 'work' }
];

const data = JSON.parse(await readFile(contentFile, 'utf8'));
try {
  validateContent(data, { assetRoot: projectRoot });
} catch (error) {
  throw new Error(`内容校验失败，已停止构建：${error.message}`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const { file, page } of pages) {
  const html = await readFile(path.join(projectRoot, file), 'utf8');
  await writeFile(path.join(output, file), applySiteBindings(html, data, page), 'utf8');
}

await cp(path.join(projectRoot, 'assets'), path.join(output, 'assets'), { recursive: true });
await cp(path.join(projectRoot, 'content'), path.join(output, 'content'), { recursive: true });
await writeFile(path.join(output, '.nojekyll'), '', 'utf8');

const sitemap = buildSitemap(data);
if (sitemap) await writeFile(path.join(output, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(path.join(output, 'robots.txt'), buildRobots(data), 'utf8');

console.log(`Built public site at ${output}`);
