import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const REMOTE_URL_PATTERN = /^(?:https?:\/\/|mailto:)[^\s]+$/i;
const LOCAL_ASSET_PATTERN = /^(?:\.{0,2}\/|assets\/)[^\s]+$/i;
const PUBLICATION_LINK_KEYS = ['paper', 'pdf', 'code', 'doi', 'data'];
const PUBLICATION_VENUE_TYPES = ['journal', 'conference', 'preprint', 'thesis', 'book', 'other'];
// 章节开关只覆盖"一直写死在 DOM 里"的章节；publications / news / contributions 另有自己的 enabled
const SECTION_KEYS = ['about', 'research', 'publications', 'news', 'education', 'contributions', 'workstation'];

function fail(message) {
  throw new Error(message);
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`${label}不能为空`);
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label}格式无效`);
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) fail(`${label}格式无效`);
  return value;
}

function requireUrl(value, label) {
  try {
    new URL(value);
  } catch {
    fail(`${label}无效`);
  }
}

function optionalBoolean(value, label) {
  if (value === undefined) return;
  if (typeof value !== 'boolean') fail(`${label}必须是开关值`);
}

function validateTextLines(value, label) {
  if (value === undefined) return;
  requireArray(value, label).forEach((line, index) => {
    if (typeof line !== 'string') fail(`${label}第 ${index + 1} 项必须是文本`);
  });
}

function validateSections(sections) {
  if (sections === undefined) return;
  requireObject(sections, '章节开关');
  Object.entries(sections).forEach(([key, value]) => {
    if (!SECTION_KEYS.includes(key)) fail(`章节开关 ${key} 不是已知章节（可用：${SECTION_KEYS.join(' / ')}）`);
    requireObject(value, `章节开关 ${key}`);
    optionalBoolean(value.enabled, `章节开关 ${key}`);
  });
}

/**
 * 本地资源必须真的存在：让构建期失败，好过线上 404。
 * 只有显式传入 assetRoot 时才检查，测试可以继续使用虚构路径。
 */
function validateLocalAsset(value, label, assetRoot) {
  const url = text(value);
  if (!url || !assetRoot || !LOCAL_ASSET_PATTERN.test(url)) return;
  const root = path.resolve(assetRoot);
  const target = path.resolve(root, url.replace(/^\.?\//, ''));
  if (!target.startsWith(root)) fail(`${label} 指向了项目外部：${url}`);
  if (!existsSync(target)) fail(`${label} 指向的文件不存在：${url}`);
}

function validatePublications(publications, assetRoot) {
  if (publications === undefined) return;
  requireObject(publications, '出版物');
  optionalBoolean(publications.enabled, '出版物');
  const items = publications.items === undefined ? [] : requireArray(publications.items, '出版物列表');
  const seenIds = new Set();
  items.forEach((item, index) => {
    const label = `出版物 ${index + 1}`;
    requireObject(item, label);
    requireString(item.title, `${label}标题`);
    const id = text(item.id);
    if (id) {
      if (!/^[a-z\d][a-z\d-]*$/i.test(id)) fail(`${label}的 id 只能包含字母、数字和连字符`);
      if (seenIds.has(id.toLowerCase())) fail(`${label}的 id 与其他出版物重复`);
      seenIds.add(id.toLowerCase());
    }
    if (item.year !== undefined && typeof item.year !== 'string' && typeof item.year !== 'number') {
      fail(`${label}年份格式无效`);
    }
    const venueType = text(item.venueType);
    if (venueType && !PUBLICATION_VENUE_TYPES.includes(venueType)) {
      fail(`${label}的类型请使用 ${PUBLICATION_VENUE_TYPES.join(' / ')}`);
    }
    validateTextLines(item.tags, `${label}的标签`);
    if (item.links === undefined) return;
    requireObject(item.links, `${label}的链接`);
    Object.entries(item.links).forEach(([key, value]) => {
      if (!PUBLICATION_LINK_KEYS.includes(key)) fail(`${label}的链接字段 ${key} 不受支持`);
      const url = text(value);
      if (!url) return;
      if (!REMOTE_URL_PATTERN.test(url) && !LOCAL_ASSET_PATTERN.test(url)) fail(`${label}的 ${key} 链接无效`);
      validateLocalAsset(url, `${label}的 ${key} 链接`, assetRoot);
    });
  });
}

function validateNews(news) {
  if (news === undefined) return;
  requireObject(news, '动态');
  optionalBoolean(news.enabled, '动态');
  const items = news.items === undefined ? [] : requireArray(news.items, '动态列表');
  items.forEach((item, index) => {
    const label = `动态 ${index + 1}`;
    requireObject(item, label);
    requireString(item.date, `${label}的时间`);
    requireString(item.text, `${label}的内容`);
    const url = text(item.url);
    if (url && !REMOTE_URL_PATTERN.test(url)) fail(`${label}的链接无效`);
  });
}

function validateInterfaceCopy(ui) {
  if (ui === undefined) return;
  requireObject(ui, '界面文字');
  ['zh', 'en'].forEach((language) => {
    if (ui[language] === undefined) return;
    requireObject(ui[language], `界面文字（${language}）`);
    Object.entries(ui[language]).forEach(([key, value]) => {
      if (typeof value !== 'string') fail(`界面文字 ${key}（${language}）必须是文本`);
    });
  });

  // 中英键集合必须一致：少一个键的后果是"切到英文后某段文字变空"，很难靠肉眼发现
  if (ui.zh && ui.en) {
    const zhKeys = Object.keys(ui.zh).sort();
    const enKeys = Object.keys(ui.en).sort();
    const missingInEn = zhKeys.filter((key) => !enKeys.includes(key));
    const missingInZh = enKeys.filter((key) => !zhKeys.includes(key));
    if (missingInEn.length) fail(`界面文字中文有、英文缺：${missingInEn.join(', ')}`);
    if (missingInZh.length) fail(`界面文字英文有、中文缺：${missingInZh.join(', ')}`);
  }
}

function validateFocusParity(data) {
  [['focus', 'focusDetails'], ['focusEn', 'focusDetailsEn']].forEach(([titleKey, detailKey]) => {
    const titles = Array.isArray(data[titleKey]) ? data[titleKey] : [];
    const details = Array.isArray(data[detailKey]) ? data[detailKey] : [];
    if (!titles.length || !details.length) return;
    if (titles.length !== details.length) {
      fail(`关注方向与方向说明数量不一致（${titleKey} ${titles.length} 条 / ${detailKey} ${details.length} 条）`);
    }
  });
}

/**
 * 校验 content/site.json。规则与工作台、构建脚本、测试共用同一份实现，
 * 校验失败时抛出带定位信息的 Error。
 */
export function validateContent(data, { assetRoot = '' } = {}) {
  requireObject(data, '网站内容');

  const meta = requireObject(data.meta, '网站信息');
  requireString(meta.siteTitle, '浏览器标题');
  requireString(meta.siteTitleEn, '英文浏览器标题');
  requireString(meta.description, '搜索摘要');
  requireString(meta.descriptionEn, '英文搜索摘要');
  if (!COLOR_PATTERN.test(meta.accent || '')) fail('主题色格式无效');
  if (text(meta.url)) requireUrl(text(meta.url), '网站地址');

  if (data.visual !== undefined) {
    requireObject(data.visual, '动态视觉');
    const density = data.visual.particleDensity;
    if (!Number.isFinite(density) || density < 30 || density > 500) fail('粒子密度超出范围');
    const speed = data.visual.flowSpeed;
    if (!Number.isFinite(speed) || speed <= 0 || speed > 2) fail('流动速度超出范围');
    if (!COLOR_PATTERN.test(data.visual.primaryColor || '') || !COLOR_PATTERN.test(data.visual.secondaryColor || '')) {
      fail('流场颜色格式无效');
    }
  }

  const githubUsername = text(data.githubContributions?.username);
  optionalBoolean(data.githubContributions?.enabled, 'GitHub 贡献图');
  if (data.githubContributions?.enabled !== false && githubUsername && !GITHUB_USERNAME_PATTERN.test(githubUsername)) {
    fail('GitHub 用户名格式无效');
  }

  const profile = requireObject(data.profile, '个人信息');
  requireString(profile.name, '显示姓名');
  requireString(profile.headline, '首页主标题');
  requireString(profile.headlineEn, '英文首页主标题');
  requireString(profile.introduction, '个人简介');
  requireString(profile.introductionEn, '英文个人简介');

  validateTextLines(data.focus, '关注方向');
  validateTextLines(data.focusEn, '关注方向（英文）');
  validateTextLines(data.focusDetails, '方向说明');
  validateTextLines(data.focusDetailsEn, '方向说明（英文）');

  validateInterfaceCopy(data.ui);
  validateFocusParity(data);
  validateSections(data.sections);

  [...(Array.isArray(data.education) ? data.education : []), ...(Array.isArray(data.educationEn) ? data.educationEn : [])]
    .forEach((item, index) => {
      const url = text(item?.advisorUrl);
      if (url) requireUrl(url, `教育经历 ${index + 1} 导师链接`);
    });

  const projects = requireArray(data.projects, '项目列表');
  const services = requireArray(data.services, '服务列表');
  projects.forEach((project, index) => {
    requireString(project?.title, `项目 ${index + 1} 名称`);
    requireString(project?.summary, `项目 ${index + 1} 说明`);
    requireUrl(project?.url, `项目 ${index + 1} 网址`);
  });
  services.forEach((service, index) => {
    requireString(service?.title, `服务 ${index + 1} 标题`);
    requireString(service?.description, `服务 ${index + 1} 说明`);
  });

  validatePublications(data.publications, assetRoot);
  validateNews(data.news);

  if (data.icons !== undefined) {
    requireObject(data.icons, '图标设置');
    Object.entries(data.icons).forEach(([key, value]) => {
      if (typeof value !== 'string') fail(`图标 ${key} 必须是文本`);
      validateLocalAsset(value, `图标 ${key}`, assetRoot);
    });
  }

  const contact = requireObject(data.contact, '联系方式');
  requireString(contact.email, '邮箱');
  requireUrl(contact.github, 'GitHub 主页地址');
  const researchgate = text(contact.researchgate);
  if (researchgate) requireUrl(researchgate, 'ResearchGate 主页地址');
  const resume = text(contact.resume);
  if (resume && !LOCAL_ASSET_PATTERN.test(resume) && !REMOTE_URL_PATTERN.test(resume)) fail('个人简历地址无效');
  validateLocalAsset(resume, '个人简历地址', assetRoot);
}

const isDirectRun = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const contentFile = path.join(projectRoot, 'content', 'site.json');
  try {
    validateContent(JSON.parse(await readFile(contentFile, 'utf8')), { assetRoot: projectRoot });
    console.log(`内容校验通过：${path.relative(projectRoot, contentFile)}`);
  } catch (error) {
    console.error(`内容校验失败：${error.message}`);
    process.exitCode = 1;
  }
}
