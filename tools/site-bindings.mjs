/**
 * 构建期定稿：把 content/site.json 里的确定性信息写进 HTML。
 *
 * 同一份实现被 tools/build.mjs（产出 _site）和 tools/workbench-server.mjs（本机预览）使用，
 * 因此本地预览与线上页面完全一致，且抓取工具、分享卡片、无 JS 环境都能拿到正确内容。
 */

const HEAD_BLOCK_START = '<!-- site-meta -->';
const HEAD_BLOCK_END = '<!-- /site-meta -->';
const HEAD_BLOCK_PATTERN = /<!-- site-meta -->[\s\S]*?<!-- \/site-meta -->/;
const TOKEN_PATTERN = /__SITE_[A-Z_]+__/g;

const DEFAULT_OG_IMAGE = 'assets/ustc-emblem.jpg';

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

export function siteBaseUrl(data) {
  return text(data?.meta?.url).replace(/\/+$/, '');
}

function absoluteUrl(base, value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return base ? `${base}/${value.replace(/^\.?\//, '')}` : value;
}

/**
 * 计算某一页的标题、摘要、语言、规范地址等元数据。
 * 双语站点在构建期只能选一个默认语言：学术页用英文，服务页用中文，
 * 与 assets/site.js 里 DEFAULT_LANGUAGE 的设定保持一致。
 */
export function pageMetadata(data, page = 'academic') {
  const isWork = page === 'work';
  const base = siteBaseUrl(data);
  const language = isWork ? 'zh-CN' : (text(data?.meta?.lang) || 'en');
  const siteTitle = text(data?.meta?.siteTitle) || 'GarryLee';
  const title = isWork
    ? (text(data?.ui?.zh?.workPageTitle) || siteTitle)
    : (text(data?.meta?.siteTitleEn) || siteTitle);
  const description = isWork
    ? (text(data?.meta?.description) || text(data?.meta?.descriptionEn))
    : (text(data?.meta?.descriptionEn) || text(data?.meta?.description));
  const pathname = isWork ? '/work.html' : '/';
  return {
    page,
    language,
    title,
    description,
    pathname,
    url: base ? `${base}${pathname}` : '',
    image: absoluteUrl(base, text(data?.meta?.ogImage) || DEFAULT_OG_IMAGE)
  };
}

export function personJsonLd(data) {
  const base = siteBaseUrl(data);
  const sameAs = [text(data?.contact?.github), text(data?.contact?.researchgate)].filter(Boolean);
  const affiliation = text(data?.sidebar?.affiliation);
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: text(data?.profile?.name) || 'GarryLee'
  };
  if (affiliation) payload.affiliation = { '@type': 'Organization', name: affiliation };
  if (text(data?.profile?.eyebrow)) payload.jobTitle = text(data.profile.eyebrow);
  if (base) payload.url = `${base}/`;
  if (sameAs.length) payload.sameAs = sameAs;
  if (Array.isArray(data?.focus) && data.focus.length) payload.knowsAbout = data.focus.filter((item) => typeof item === 'string');
  if (text(data?.contact?.email)) payload.email = text(data.contact.email);
  return payload;
}

export function headTags(data, meta) {
  const tags = [
    `<meta property="og:type" content="${meta.page === 'work' ? 'website' : 'profile'}">`,
    `<meta property="og:site_name" content="${escapeHtml(text(data?.profile?.name) || 'GarryLee')}">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`
  ];
  if (meta.url) tags.push(`<meta property="og:url" content="${escapeHtml(meta.url)}">`);
  if (meta.image) tags.push(`<meta property="og:image" content="${escapeHtml(meta.image)}">`);
  tags.push('<meta name="twitter:card" content="summary_large_image">');
  tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.title)}">`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.description)}">`);
  if (meta.url) tags.push(`<link rel="canonical" href="${escapeHtml(meta.url)}">`);
  if (meta.page !== 'work') {
    const json = JSON.stringify(personJsonLd(data), null, 2).replaceAll('<', '\\u003c');
    tags.push(`<script type="application/ld+json">\n${json}\n</script>`);
  }
  return tags.join('\n');
}

export function siteTokens(data) {
  const github = text(data?.contact?.github);
  const githubLabel = github.split('/').filter(Boolean).pop() || 'GitHub';
  return {
    __SITE_NAME__: text(data?.profile?.name),
    __SITE_EMAIL__: text(data?.contact?.email),
    __SITE_WECHAT__: text(data?.contact?.wechat),
    __SITE_GITHUB_URL__: github,
    __SITE_GITHUB_LABEL__: githubLabel,
    __SITE_RESEARCHGATE_URL__: text(data?.contact?.researchgate),
    __SITE_RESUME_URL__: text(data?.contact?.resume)
  };
}

/**
 * 把数据写进 HTML：语言、标题、摘要、head 元数据块、联系方式占位符。
 * 占位符没被完全替换时会抛错，避免把 "__SITE_EMAIL__" 这类残留发到线上。
 */
export function applySiteBindings(html, data, page = 'academic') {
  if (typeof html !== 'string') throw new Error('页面内容必须是文本');
  const meta = pageMetadata(data, page);
  let output = html;

  output = output.replace(/<html\s+lang="[^"]*"/i, `<html lang="${escapeHtml(meta.language)}"`);
  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  output = output.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}">`
  );

  const block = `${HEAD_BLOCK_START}\n${headTags(data, meta)}\n${HEAD_BLOCK_END}`;
  output = HEAD_BLOCK_PATTERN.test(output)
    ? output.replace(HEAD_BLOCK_PATTERN, block)
    : output.replace('</head>', `${block}\n</head>`);

  Object.entries(siteTokens(data)).forEach(([token, value]) => {
    output = output.split(token).join(escapeHtml(value));
  });

  const leftover = output.match(TOKEN_PATTERN);
  if (leftover) throw new Error(`页面中存在未解析的占位符：${leftover[0]}`);
  return output;
}

export function buildSitemap(data, { lastModified = new Date() } = {}) {
  const base = siteBaseUrl(data);
  if (!base) return '';
  const lastmod = lastModified.toISOString().slice(0, 10);
  const urls = [`${base}/`, `${base}/work.html`];
  const entries = urls.map((url) => `  <url>\n    <loc>${escapeHtml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');
}

export function buildRobots(data) {
  const base = siteBaseUrl(data);
  const lines = ['User-agent: *', 'Allow: /'];
  if (base) lines.push(`Sitemap: ${base}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}
