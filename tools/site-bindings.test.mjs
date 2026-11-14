import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  applySiteBindings,
  buildRobots,
  buildSitemap,
  escapeHtml,
  pageMetadata,
  siteTokens
} from './site-bindings.mjs';

const projectRoot = new URL('../', import.meta.url);
const site = JSON.parse(await readFile(new URL('content/site.json', projectRoot), 'utf8'));
const indexHtml = await readFile(new URL('index.html', projectRoot), 'utf8');
const workHtml = await readFile(new URL('work.html', projectRoot), 'utf8');

test('学术页注入英文元数据与规范地址', () => {
  const meta = pageMetadata(site, 'academic');
  assert.equal(meta.language, 'en');
  assert.equal(meta.title, site.meta.siteTitleEn);
  assert.equal(meta.url, `${site.meta.url}/`);

  const html = applySiteBindings(indexHtml, site, 'academic');
  assert.match(html, /<html lang="en"/);
  assert.ok(html.includes(`<title>${escapeHtml(site.meta.siteTitleEn)}</title>`));
  assert.ok(html.includes(site.meta.descriptionEn));
  assert.ok(html.includes(`<link rel="canonical" href="${site.meta.url}/">`));
  assert.ok(html.includes('application/ld+json'));
});

test('服务页注入中文元数据', () => {
  const html = applySiteBindings(workHtml, site, 'work');
  assert.match(html, /<html lang="zh-CN"/);
  assert.ok(html.includes(site.meta.description));
  assert.ok(!html.includes('application/ld+json'));
});

test('联系方式占位符全部被替换，且不残留标记', () => {
  const html = applySiteBindings(indexHtml, site, 'academic');
  assert.ok(!html.includes('__SITE_'));
  assert.ok(html.includes(`mailto:${site.contact.email}`));
  assert.ok(html.includes(site.contact.github));
});

test('HTML 里不再硬编码联系方式，只能来自内容文件', () => {
  // 显示姓名允许以首屏兜底的形式留在 HTML 里，其余联系方式必须完全由构建期注入
  const tokens = siteTokens(site);
  delete tokens.__SITE_NAME__;
  Object.values(tokens).filter(Boolean).forEach((value) => {
    if (value.length < 6) return;
    assert.ok(!indexHtml.includes(value), `index.html 不应硬编码 ${value}`);
  });
});

test('重复应用是幂等的，不会叠加元数据块', () => {
  const once = applySiteBindings(indexHtml, site, 'academic');
  const twice = applySiteBindings(once, site, 'academic');
  assert.equal(twice, once);
  assert.equal(once.match(/<!-- site-meta -->/g).length, 1);
});

test('残留占位符会让构建直接失败', () => {
  assert.throws(
    () => applySiteBindings('<html lang="en"><head><title>t</title></head><body>__SITE_UNKNOWN__</body></html>', site),
    /未解析的占位符/
  );
});

test('站点域名缺失时不产出绝对地址', () => {
  const withoutUrl = structuredClone(site);
  delete withoutUrl.meta.url;
  const html = applySiteBindings(indexHtml, withoutUrl, 'academic');
  assert.ok(!html.includes('rel="canonical"'));
  assert.equal(buildSitemap(withoutUrl), '');
  assert.ok(!buildRobots(withoutUrl).includes('Sitemap:'));
});

test('sitemap 与 robots 指向配置的域名', () => {
  const sitemap = buildSitemap(site, { lastModified: new Date('2026-11-13T00:00:00Z') });
  assert.ok(sitemap.includes(`<loc>${site.meta.url}/</loc>`));
  assert.ok(sitemap.includes(`<loc>${site.meta.url}/work.html</loc>`));
  assert.ok(sitemap.includes('<lastmod>2026-11-13</lastmod>'));
  assert.ok(buildRobots(site).includes(`Sitemap: ${site.meta.url}/sitemap.xml`));
});
