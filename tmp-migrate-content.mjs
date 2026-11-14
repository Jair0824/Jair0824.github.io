import { readFile, writeFile } from 'node:fs/promises';

const file = 'content/site.json';
const data = JSON.parse(await readFile(file, 'utf8'));

// 1. 章节开关：只覆盖原本写死在 DOM 里的章节
const sections = {};
for (const key of ['about', 'research', 'publications', 'news', 'education', 'contributions', 'workstation']) {
  sections[key] = { enabled: true };
}

// 2. 删除数据双轨（credentials 只有工作台在写，渲染器从不读取）
delete data.credentials;
delete data.credentialsEn;

// 3. 清掉界面文案里的空串占位（空串已由 activeCopy 兜底，但留着会误导人）
for (const lang of ['zh', 'en']) {
  if (data.ui?.[lang] && data.ui[lang].homepageLabel === '') delete data.ui[lang].homepageLabel;
}

// 4. 按固定顺序重建，保证 sections 落在 githubContributions 之后
const order = [
  '$schema', 'meta', 'visual', 'githubContributions', 'sections', 'profile',
  'focus', 'focusEn', 'focusDetails', 'focusDetailsEn',
  'publications', 'news', 'education', 'educationEn',
  'projects', 'services', 'contact', 'footer', 'footerEn',
  'note', 'sidebar', 'ui', 'icons'
];
const rebuilt = {};
for (const key of order) {
  if (key === 'sections') rebuilt.sections = sections;
  else if (key in data) rebuilt[key] = data[key];
}
for (const key of Object.keys(data)) {
  if (!(key in rebuilt)) {
    console.warn(`未在顺序表中出现，追加到末尾：${key}`);
    rebuilt[key] = data[key];
  }
}

await writeFile(file, `${JSON.stringify(rebuilt, null, 2)}\n`, 'utf8');
console.log('keys:', Object.keys(rebuilt).join(', '));
console.log('has credentials:', 'credentials' in rebuilt, '| has sections:', 'sections' in rebuilt);
