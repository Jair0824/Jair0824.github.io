import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateContent } from './validate-content.mjs';

const contentFile = new URL('../content/site.json', import.meta.url);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const site = JSON.parse(await readFile(contentFile, 'utf8'));

function clone(data = site) {
  return structuredClone(data);
}

test('content/site.json 通过校验', () => {
  assert.doesNotThrow(() => validateContent(clone()));
});

test('缺少主页标题时给出可定位的报错', () => {
  const broken = clone();
  broken.profile.headline = '   ';
  assert.throws(() => validateContent(broken), /首页主标题不能为空/);
});

test('联系方式缺少邮箱时报错', () => {
  const broken = clone();
  broken.contact.email = '';
  assert.throws(() => validateContent(broken), /邮箱不能为空/);
});

test('出版物缺少标题时报错并带序号', () => {
  const broken = clone();
  broken.publications = { enabled: true, items: [{ title: 'ok' }, { title: '' }] };
  assert.throws(() => validateContent(broken), /出版物 2标题不能为空/);
});

test('出版物链接只接受网址或本地资源路径', () => {
  const broken = clone();
  broken.publications = { enabled: true, items: [{ title: 'ok', links: { paper: 'not a url' } }] };
  assert.throws(() => validateContent(broken), /的 paper 链接无效/);

  const fine = clone();
  fine.publications = {
    enabled: true,
    items: [{ title: 'ok', links: { paper: 'https://doi.org/10.1/x', pdf: 'assets/papers/x.pdf' } }]
  };
  assert.doesNotThrow(() => validateContent(fine));
});

test('出版物 id 不可重复，类型需在白名单内', () => {
  const duplicated = clone();
  duplicated.publications = {
    enabled: true,
    items: [{ title: 'a', id: 'same-id' }, { title: 'b', id: 'SAME-ID' }]
  };
  assert.throws(() => validateContent(duplicated), /id 与其他出版物重复/);

  const badType = clone();
  badType.publications = { enabled: true, items: [{ title: 'a', venueType: 'blog' }] };
  assert.throws(() => validateContent(badType), /类型请使用/);
});

test('动态需要时间与内容', () => {
  const broken = clone();
  broken.news = { enabled: true, items: [{ date: '2026.11', text: '' }] };
  assert.throws(() => validateContent(broken), /动态 1的内容不能为空/);
});

test('界面文字必须是字符串且按语言分组', () => {
  const broken = clone();
  broken.ui = { zh: { aboutTitle: 42 } };
  assert.throws(() => validateContent(broken), /aboutTitle（zh）必须是文本/);
});

test('空的出版物与动态列表是合法状态', () => {
  const empty = clone();
  empty.publications = { enabled: false, items: [] };
  empty.news = { enabled: false, items: [] };
  assert.doesNotThrow(() => validateContent(empty));
});

test('章节开关只接受已知章节与布尔值', () => {
  const unknown = clone();
  unknown.sections = { shop: { enabled: true } };
  assert.throws(() => validateContent(unknown), /不是已知章节/);

  const notBoolean = clone();
  notBoolean.sections = { about: { enabled: 'yes' } };
  assert.throws(() => validateContent(notBoolean), /必须是开关值/);
});

test('中英界面文案的键集合必须一致', () => {
  const broken = clone();
  delete broken.ui.en.aboutTitle;
  assert.throws(() => validateContent(broken), /英文缺：aboutTitle/);
});

test('关注方向与方向说明数量必须一一对应', () => {
  const broken = clone();
  broken.focusDetails = broken.focusDetails.slice(0, 2);
  assert.throws(() => validateContent(broken), /数量不一致/);
});

test('传入 assetRoot 时，缺失的本地资源会让校验失败', () => {
  const broken = clone();
  broken.contact.resume = 'assets/not-exists.pdf';
  assert.throws(
    () => validateContent(broken, { assetRoot: projectRoot }),
    /指向的文件不存在/
  );

  const brokenIcon = clone();
  brokenIcon.icons.email = 'assets/icons/not-exists.svg';
  assert.throws(
    () => validateContent(brokenIcon, { assetRoot: projectRoot }),
    /图标 email 指向的文件不存在/
  );
});

test('现有的简历与图标文件能通过资源存在性校验', () => {
  assert.doesNotThrow(() => validateContent(clone(), { assetRoot: projectRoot }));
});

test('不传 assetRoot 时不做文件存在性检查（测试与快速校验不受影响）', () => {
  const virtual = clone();
  virtual.contact.resume = 'assets/not-exists.pdf';
  assert.doesNotThrow(() => validateContent(virtual));
});
