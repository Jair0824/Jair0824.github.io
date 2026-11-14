# GarryLee 个人主页 · 架构解剖与 Anleeno Academic 借鉴清单

> 审阅对象：`E:\Personal Web`（`Jair0824/Jair0824.github.io`，main 分支，含工作区未提交改动）
> 对照对象：[Anleeno/anleeno-academic](https://github.com/Anleeno/anleeno-academic)（React 19 + Vite 7 学术主页模板，MIT 代码 / 内容单独授权）
> 审阅日期：2026-11-13
> 核对方式：逐文件阅读全部源文件 + 直接执行 `validate-content.test.mjs` / `site-bindings.test.mjs`；Anleeno 一侧的证据来自其 raw 源码与 GitHub Trees API（非二手描述）

---

## 0. 结论速览

| 维度 | 你的现状 | Anleeno 的做法 | 结论 |
| --- | --- | --- | --- |
| 技术栈 | 零依赖：原生 HTML/CSS/JS + JSON + Node 脚本 | React 19 + Vite 7，必须 `npm ci` | **保留零依赖**，这是最大的结构性优势 |
| 内容维护 | 本机工作台：表单 + 实时预览 + 一键发布 | 手改 `config/*.json` 后重新构建 | **保留工作台**，这是你真正领先的部分 |
| 内容校验 | 已有 `validate-content.mjs`，构建/保存/测试三处共用 | `predev`/`prebuild` 钩子 + JSON Schema | 已对齐，但 **CI 未接入**（见 P1-1） |
| 构建期定稿 | 已有 `site-bindings.mjs`：title/OG/JSON-LD/sitemap/robots 全部写死进 HTML | `%SITE_TITLE%` 占位符替换 | 已对齐，且 **你比它多做了 OG/JSON-LD/sitemap** |
| 学术本体 | Publications + News 骨架已就位，但论文列表为空 | Publications / News / Awards / 预览 / PDF 阅读器 | 差 **真实内容** 与 **章节开关体系** |
| 主题 | 颜色有 3 个来源且互相打架（见 P0-1） | `theme.jsonc` 12 个令牌，运行时统一注入 | 需要收敛成单一来源 |
| 发布门禁 | 17 个用例全绿，CI 已接入 `validate` + `test`（本轮修复） | lint → test → build 全绿才部署 | 已对齐 |
| 可爬性 | 有 OG/JSON-LD/sitemap，但正文仍靠运行时 fetch | 仅 title/description/lang | **你已经超过它** |

一句话：**你现在缺的已经不是"架构"（那部分你比 Anleeno 更省、更可维护），门禁也已在本轮修好并接入 CI；剩下的是三件事：把颜色收敛成一个来源、把 Publications/News 填上真实内容并做成可开关的章节体系、把首屏正文做成可爬的。**

---

## 1. 你现在的系统（事实层）

### 1.1 一句话架构

一个 **零依赖的双语静态站点**（`index.html` 学术页 + `work.html` 服务页）＋ 一个 **只在本机运行的 Node 内容工作台**（`127.0.0.1:4310`，既是静态服务器又是写内容/推代码的 API）＋ 一条 **GitHub Actions → Pages** 的自动部署链。

没有 `node_modules`，没有 bundler，浏览器端只有 `assets/site.js` 一个 ES2022 脚本。唯一的外部依赖是 Node 本身。

### 1.2 目录与职责

| 路径 | 职责 | 是否发布 |
| --- | --- | --- |
| `index.html` / `work.html` | 页面骨架；正文文案兜底；联系方式写成 `__SITE_*__` 占位符 | ✅ |
| `assets/styles.css` | 全部样式，1958 行，**含两套主题**（1–1632 浅色基线 + 1647–1958 极光夜覆盖层） | ✅ |
| `assets/site.js` | 运行时渲染器：读 `content/site.json` → 建 DOM；i18n；两块 canvas；滚动高亮 | ✅ |
| `content/site.json` | **唯一内容源**：meta / visual / profile / focus / **sections** / publications / news / education / projects / services / contact / sidebar / ui / icons / note / footer | ✅ |
| `content/site.schema.json` | 编辑器补全与内联提示（draft-07），不参与运行时 | ✅ |
| `assets/github-contributions.svg` | 贡献热力图，CI 每次重新生成（**不回写仓库**） | ✅ |
| `assets/Jiarui_Li_English_Resume.pdf` | 简历（36 KB） | ✅ |
| `workbench/` | 编辑界面：表单 + iframe 预览 + 发布对话框 | ❌ |
| `tools/build.mjs` | 校验 → 注入元数据 → 产出 `_site/` → 写 sitemap/robots | 构建脚本 |
| `tools/site-bindings.mjs` | 构建期注入的**唯一实现**（构建与工作台共用） | 构建脚本 |
| `tools/validate-content.mjs` | 内容校验器的**唯一实现**（构建/保存/测试共用） | 构建脚本 |
| `tools/workbench-server.mjs` | 静态服务 + `/api/content`(GET/PUT) + `/api/status` + `/api/publish` | ❌ |
| `tools/update-contributions.mjs` | GitHub GraphQL → 生成热力图 SVG | 构建脚本 |
| `tools/*.test.mjs` | `node --test` 用例（内容校验 9 个，构建注入 8 个） | ❌ |
| `.github/workflows/pages.yml` | push main / 每日 cron / 手动 → 生成 SVG → 构建 → 部署 | — |
| `.worktrees/github-contributions/` | 历史遗留 worktree，已在 `.gitignore` 中 | ⚠️ 已忽略 |
| `docs/` | 本文件 | ❌ |

### 1.3 三条数据链

**① 运行时渲染链（浏览器）**

```
index.html（骨架，<html lang="en"> 由构建期改写，静态 title/description 同理）
  └─ <script defer src=assets/site.js>
       └─ loadSite()                                    site.js:1106
            ├─ fetch('content/site.json?v=Date.now()', {cache:'no-store'})
            ├─ renderSite(data)                        site.js:765
            │    ├─ applyInterfaceLanguage()           site.js:375  ← activeCopy():225
            │    ├─ renderSidebar()                     site.js:309
            │    ├─ renderAcademic() / renderWorkstation()
            │    │    ├─ renderPublications()  site.js:567  ← setSectionVisibility() 434
            │    │    ├─ renderNews()          site.js:576  ← 同一套显隐
            │    │    ├─ renderContributions() site.js:391
            │    │    └─ applySectionSwitches()             ← sections 开关 + 导航联动
            │    └─ renderContact()
            ├─ initializePlasmaBackground(visual)       site.js:908  ← 全屏：星点 + 7 条磁力线 + 粒子流场
            ├─ initializeProfileOrb(visual)             site.js:793  ← 圆形：球面粒子 + 纬向环
            └─ initializeNavigation()                   site.js:1086 ← IntersectionObserver 滚动高亮
```

关键约定：**英文字段 = 中文字段 + `En` 后缀**（`localized()` 自动找 `titleEn`），数组同理（`focus` / `focusEn`）。缺英文时回落中文，缺中文时回落内置文案。

**② 编辑与发布链（本机）**

```
start-workbench.cmd（优先系统 node，回落 Codex 自带 node）
  └─ node tools/workbench-server.mjs        ← 绑 127.0.0.1:4310，自动开浏览器
       ├─ GET  /api/content   → 读 site.json
       ├─ PUT  /api/content   → validateContent() → 写 site.json.tmp → rename（原子替换）
       ├─ GET  /api/status    → git status --short + git remote get-url origin
       └─ POST /api/publish   → [有改动时] git add --all → git commit -m <说明>
                              → git fetch origin main
                                └─ origin/main 是 HEAD 祖先？→ 跳过
                                   否则有共同祖先 → merge origin/main --no-edit
                                        无共同祖先 → merge --allow-unrelated-histories -X ours
                                   失败 → merge --abort，回报友好错误
                              → rev-list --count origin/main..HEAD == 0 ? "已是最新"
                              → git push --set-upstream origin HEAD:main
```

所有 git 调用都带 `-c safe.directory=<root> -c http.sslBackend=openssl -c http.version=HTTP/1.1`（Windows 兼容补丁），超时 180s；错误经 `friendlyGitError()` 映射成五类人话提示：非快进 / 认证失败 / 网络不通 / 冲突 / 其他。

**③ 自动更新链（GitHub）**

```
push main │ cron "17 2 * * *"（UTC 02:17 = 北京 10:17）│ workflow_dispatch
  └─ checkout → setup-node 22
       ├─ node tools/update-contributions.mjs
       │    需要 PERSONAL_GITHUB_TOKEN（本人账号，read:user）
       │    三道防线：Actions 内缺 token 直接失败 / token 的 viewer.login 必须等于配置的 username / 结果只落 SVG 产物
       ├─ npm run validate → validateContent()
       ├─ npm test → 17 个用例（内容校验 + 构建注入）
       ├─ node tools/build.mjs → applySiteBindings() → _site/
       ├─ configure-pages@v5 → upload-pages-artifact@v4(_site)
       └─ deploy-pages@v4 → github-pages environment
```

并发组 `pages`，`cancel-in-progress: true`。

### 1.4 构建期定稿（这一层是本轮新增的关键设计）

`tools/site-bindings.mjs` 是**唯一实现**，被 `build.mjs` 与 `workbench-server.mjs` 同时 `import`，因此"本机预览 = 线上页面"：

| 能力 | 实现位置 | 机制 |
| --- | --- | --- |
| 语言 / 标题 / 摘要 | `applySiteBindings()` site-bindings.mjs:123 | 正则替换 `<html lang>`、`<title>`、`meta[name=description]` |
| OG / Twitter / canonical | `headTags()` :85 | 生成 `<!-- site-meta -->…<!-- /site-meta -->` 块，幂等替换 |
| JSON-LD Person | `personJsonLd()` :67 | 含 `affiliation` / `jobTitle` / `knowsAbout` / `sameAs` / `email` |
| 联系方式去硬编码 | `siteTokens()` :105 | `__SITE_EMAIL__ / __SITE_GITHUB_URL__ / __SITE_WECHAT__ / __SITE_RESUME_URL__ …` |
| 残留占位符即失败 | :144 | 替换不完直接 `throw`，避免把 `__SITE_EMAIL__` 发到线上 |
| sitemap / robots | `buildSitemap()` :149 / `buildRobots()` :164 | 站点域名缺失时**不产出**绝对地址 |

这一层解决的是"**爬虫、分享卡、无 JS 首屏**拿不到真实内容"的问题，比 Anleeno 只做 title/description/language 三个占位符更完整。

### 1.5 设计思想（我读出来的 9 条）

1. **双层身份，语言默认值刻意反转**：学术页默认 `en`（国际同行），服务页默认 `zh`（本地客户）。`DEFAULT_LANGUAGE = pageType === 'academic' ? 'en' : 'zh'` 是"同一个人的两种读者"的显式表达。
2. **内容即数据，代码即渲染器**：连图标（`icons.*`）、界面文案（`ui.*`）、页脚、导师链接都是 JSON 字段；`site.js` 里没有一句硬编码的介绍文字。目标很明确——**改内容不需要改代码**。
3. **减法美学**：夜主题里 `.identity-panel / .content-panel` 的边框、背景、阴影、`backdrop-filter` 全部置空（CSS 注释原话：*content stays open while the color field carries the depth*）。层次由背景色场承担，不是由卡片承担。
4. **学术排版而非 SaaS 排版**：`Times New Roman + STZhongsong/宋体` 衬线；`strong/h1/h2/h3` 一律 `font-weight: 400`（拒绝加粗）；`line-height: 1.78`；17px 基准字号。整体气质是"期刊/单行本"，不是"落地页"。
5. **物理隐喻贯穿**：等离子体 → 全屏粒子流场 + 磁力线 + 流星 + 极光色团；侧栏头像位置换成**球面粒子环**（等离子体约束的抽象）。视觉不是装饰，是本专业能读懂的暗号。
6. **离线优先的工作台**：本机 HTTP 服务直接充当 CMS；"保存并预览"两步合一；发布是**显式、可撤销失败**的动作（本地提交永远保留）。
7. **渐进增强与无构建**：`<noscript>` 兜底、`prefers-reduced-motion` 全面尊重、`ResizeObserver`/`visibilitychange` 暂停动画、DPR 上限 2、移动端粒子 ×0.55。
8. **可核验的发布**：提交信息可自定义、失败分类提示、`_site` 白名单（`workbench/`、`tools/`、`docs/` 永不外泄）。
9. **构建期定稿、运行期只填**（新增）：能确定的（元数据、联系方式、sitemap）在构建时就写死进 HTML，浏览器只负责"随语言切换而变"的部分。这条是 §1.4 的思想来源，也是 C1 预渲染的前奏。

### 1.6 推送机制的边界（必须知道的事实）

- Pages 的 Source 必须是 **GitHub Actions**（不是 branch）；部署产物是 `_site/`，不是仓库根。
- `update-contributions.mjs` 生成的 SVG **不回写仓库**：线上每天新鲜，本地 `assets/github-contributions.svg` 会逐渐过期（本地预览看到旧数据属正常现象，但容易被误判为 bug）。
- 未配置 `PERSONAL_GITHUB_TOKEN` 时**故意让部署失败**，以保住上一次成功的页面——"宁可不更新，也不静默降级"。
- 贡献热力图默认只统计公开贡献；私有贡献要 token 属于本人且个人主页设置了公开私有贡献数。
- `npm test` **尚未接入 CI**：`pages.yml` 里只有 `update-contributions → build → deploy`，没有测试与校验步骤（`build.mjs` 内部会校验，所以内容校验算间接生效，但测试不生效）。
- `git add --all` 是发布动作的一部分：**任何未跟踪文件都会进提交**。当前 `.dsh-acl-recovery/` 未被忽略（见 P0-2）。

---

## 2. Anleeno Academic 的设计思想（源码核实）

### 2.1 它是什么

- 单个学者（Shubo Xu）的学术主页**模板**，派生自 [LucyLing24/longling](https://github.com/LucyLing24/longling)，MIT（代码）/ `CONTENT-LICENSE.md`（内容与媒体不授权）。
- 卖点不是"好看"，而是**四个学术主页特有的重交互**：论文预览弹层（5 种模板）、内置 PDF 阅读器 + 批注、Related Papers、Daily Papers。
- 目录分层：`config/`（内容 + `schemas/`）→ `src/components/`（一区块一组件）→ `src/css/`（一组件一样式表）→ `src/hooks/` → `src/utils/`；`scripts/` 里是校验、12 个 `*.test.js`、arXiv 代理 worker。
- 依赖清单（`package.json` 实证）：`react@19.1.1`、`vite@7.1.7`、`react-pdf@11`、`jsonc-parser`、`ajv`、`sharp`、`lucide-react`、`react-icons`、`@fontsource-variable/newsreader`。

### 2.2 五个真正可迁移的原则

**P1｜配置即内容 + Schema 校验前置**
`config/*.json` 是唯一内容源；`config/schemas/site.schema.json`（10.7 KB）给编辑器补全与内联报错；`package.json` 里 `predev` 与 `prebuild` 都挂 `validate:config`，**开发、构建、CI 三处自动生效**（CI 跑 `npm run build` 即触发 `prebuild`）。校验内容包括必填字段、类型、**资源路径是否存在**、出版物 id 唯一性、预览引用是否指向已存在的论文。

> 对比你：校验器已有且质量不差（`validate-content.mjs` 205 行，规则覆盖到出版物链接白名单、id 去重、颜色格式），`build`/`PUT` 两处生效——**但 CI 不跑测试、测试自身还是红的**。

**P2｜构建期定稿（fail-fast 的元数据注入）**
`scripts/site-metadata.js`（348 B）只做一件事：把 `%SITE_TITLE% / %SITE_DESCRIPTION% / %SITE_LANGUAGE%` 换掉并 `escapeHtml`；`src/siteConfig.js` 用 `import.meta.glob('./assets/**/*')` 解析所有资源引用，**引用到不存在的资源直接 throw**，构建失败而不是线上 404。

> 对比你：`site-bindings.mjs` 做的是超集（还生成 OG/JSON-LD/sitemap/robots，并检查残留占位符）；但**资源存在性没有校验**——`contact.resume` 指向不存在的 PDF 时，构建不会失败。

**P3｜章节可见性由数据决定**
`src/utils/sectionVisibility.js` 只有 197 字节：`section.enabled === true && items.length > 0`；`education` / `awards` / Daily Papers 各有独立开关，**导航项跟着一起隐藏**。删内容不用改组件，改开关不用删数据。

> 对比你：`publications` / `news` / `githubContributions` 已有 `enabled` + 空列表隐藏（`sectionItems()` site.js:429、`setSectionVisibility()` :434），**但 About / Research / Education / Contributions / 站点入口还没有开关**，仍是写死的 DOM。

**P4｜主题令牌集中**
`config/theme.jsonc`（1.3 KB，带注释）定义 12 个 `--theme-*` 变量：主色、文字色、悬停、柔色、浅色、边框、三种 surface、半透明、按钮色、按钮悬停；`applyTheme()` 一次性 `setProperty` 到 `:root`，组件里只引用变量。换肤 = 改一个文件。

> 对比你：`--accent` 可以由工作台改，**但 `styles.css` 的夜主题又把它重定义为另一个绿、`--accent-dark/--coral/--gold` 硬编码、JS 里 canvas 的 `palette` 数组再硬编码一份**——同一个"主色"有 4 个来源，且运行时互相覆盖（见 P0-1）。

**P5｜发布门禁**
`deploy-pages.yml` 分成 `build` 与 `deploy` 两个 job，`deploy` 用 `needs: build`；`build` 内顺序是 `npm ci → lint → test → build`，**任何一步红就不部署**。测试是 `node:test` 风格（12 个文件），覆盖配置校验、元数据注入、PDF 图片裁剪布局、弹层焦点管理等纯函数逻辑——不测"外观"，测**会静默出错的数据与几何**。

> 对比你：`tools/*.test.mjs` 已有 17 个用例，思路完全正确（测校验器、测注入幂等、测残留占位符即失败），但 `pages.yml` 里**没有 test 步骤**，且当前 2 个用例失败（见 P0-3）。

### 2.3 它有你没有的（按"学术主页含金量"排序）

| 能力 | 说明 | 对你的价值 |
| --- | --- | --- |
| **Publications 内容模型** | venue 标签 + 类型、作者本人高亮、tags、Paper/PDF/Code 按钮、**一键复制引用**、Google Scholar 引用数 | ★★★★★ 模型已经抄进 `site.json`，**缺真实条目** |
| **News** | 带时间的动态流（接收/录用/获奖/开课） | ★★★★★ 成本最低的"站点还活着"信号；你已有 1 条 |
| **Selected Awards** | 独立可开关的获奖节 | ★★★★ 你有可写入的内容（奖学金、竞赛） |
| **论文预览弹层** | 5 个模板（basic/narrative/comparison/budget/challenge） | ★★★ 做 1 个 `basic` 就够 |
| **PDF 阅读器 + 批注** | 页导航、缩放、文本高亮、手绘、形状、文字批注，存 localStorage | ★★ 包体大（`react-pdf`），用 `<dialog>`+`<iframe>` 即可覆盖 90% 需求 |
| **Related / Daily Papers** | 按 tags 实时检索 arXiv / HF Papers，经自建 Cloudflare Worker 代理 | ★ 依赖外部服务，稳定性与隐私都要自己扛 |
| **项目卡片** | 图片/视频自适应原始比例、hover 播放、统一栅格 | ★★★★ 你的 `project-preview` 目前是纯 CSS 假截图，可换成真图 |
| 细节 | glass 导航、悬浮回顶、章节色反射、`prefers-reduced-motion` | ★★★ 你缺"回顶"与 `aria-current` |

### 2.4 它的代价（不要照抄，数字已核实）

- **为了几个交互引入整个 React 19 + Vite 7 + 10 个运行时依赖**：对一篇"内容几天才改一次"的学术主页，构建链本身就是负担（`package-lock.json` 135 KB）。
- **仓库里躺着约 98 MiB 的 `ex.mp4`**（102,536,508 B / 97.8 MiB）和 3–4.5 MB 的单张 PNG（`doris.png` 4.5 MB、`demo3.png` 2.9 MB、`anleeno-home-profile.png` 3.1 MB）：`git clone` 成本极高，Pages 流量与 LCP 都受伤。
- **运行时抓第三方 API**（arXiv、HuggingFace、Google Scholar）：必须自带 Worker 代理绕过 CORS，还随时可能被限流/改版打死；Google Scholar 抓取尤其脆弱。
- **PDF 阅读器 + 批注**是它最重的模块（`PdfAnnotations.jsx` 13 KB、`PdfPreview.jsx` 9 KB、`PdfDocument.jsx` 3.6 KB + `ResumePreview.css` 10.7 KB），而"看简历"这个场景只需要在页面里弹一个 PDF。
- **单语**（`site.json` 里 `language` 只控制 `lang` 属性）：**这一点你比它强**，你是真双语。

---

## 3. 借鉴清单（按"投入 / 收益"分级，全部适配零依赖栈）

### 已完成（本轮核对确认）

| 项 | 状态 | 证据 |
| --- | --- | --- |
| A1 共享校验器 + JSON Schema | ✅ | `tools/validate-content.mjs` + `content/site.schema.json`；`build.mjs:19`、`workbench-server.mjs:151` 共用 |
| A2 构建期元数据注入 | ✅ | `tools/site-bindings.mjs`；被 build 与 workbench-server 同时调用 |
| A3 章节可见性 | ✅ | `sections` 覆盖 about/research/education/workstation；publications/news/contributions 沿用各自 `enabled` + 内容判断 |
| A4 Publications | 🟡 | 渲染器 + 校验 + 工作台表单齐全，`items` 为空 |
| A5 News | 🟡 | 渲染器 + 校验 + 工作台表单齐全，有 1 条 |
| A7 元数据补全 | 🟡 | OG/Twitter/canonical/JSON-LD/sitemap/robots 已有；**缺 favicon.ico / apple-touch-icon / 404.html / OG 专用图** |
| A8 空串覆盖 bug | ✅ | `activeCopy()` site.js:224-234 对空串回落 |
| P0-2 `.worktrees/` 未忽略 | ✅ | `.gitignore:2` |
| P0-3 联系方式双源 | ✅ | HTML 改为 `__SITE_*__` 占位符，构建期注入 |
| **A-a 门禁接入 CI** | ✅ 本轮 | `pages.yml:36-45` 现为 `validate → test → build`；17 个用例全绿；`upload-pages-artifact@v4` |
| **A-c 画布配色跟随内容** | ✅ 本轮 | `site.js:797` `auroraPalette(config)`，两块 canvas 共用 `visual.primaryColor/secondaryColor` |
| **A-b accent 单源（主体）** | ✅ 本轮 | `styles.css:1654` 回落值同步为内容值；`--line-strong`、`.project-preview` 边框、`.profile-visual` 环改为 accent 色 |
| **A-d 章节开关** | ✅ 本轮 | `sections` + `sectionEnabled()` + `applySectionSwitches()`；工作台 7 个复选框；校验器白名单 |
| **A-f 三个小修** | ✅ 本轮 | 语言 key 跨页共享（兼容旧 key）；`aria-current="location"`；`new URL` 加兜底 |
| **B2 资源存在性校验** | ✅ 本轮 | `validateContent(data, { assetRoot })` 检查 resume / icons / 论文附件；构建与工作台均启用 |
| **P1-5 数据双轨** | ✅ 本轮 | `credentials*` 已从 `site.json` 删除，工作台不再写回 |

### A 级｜剩余项：零依赖、1–2 小时/项

**A-a 让门禁真的成立 —— ✅ 本轮已完成**
原先 `pages.yml` 只有 `update-contributions → build → deploy`；现在 `Build public files` 之前会跑 `npm run validate` 与 `npm test`，artifact 升到 `@v4`，两个红灯用例按 P0-3 的根因修好（不是放宽断言，而是补掉了 HTML 里真正的硬编码）。

**A-b 颜色收敛成单一来源（借 P4）—— 🟡 主体已完成，剩"浅色基线"未删**
- ✅ `--accent` 现在只有一个来源：`site.json.meta.accent`（inline 注入），`styles.css` 只留同步过的回落值；
- ✅ 与 accent 同源的 UI 令牌（`--line-strong`、项目卡边框、头像环）已改为 accent 色；
- ✅ canvas 调色板不再硬编码（见 A-c）；
- ⏳ 仍保留：`--coral` / `--gold`（柠檬黄）是**高亮**语义、不是 accent，故意独立；极光色团（`rgb(73 219 163)` 等）是插画层，也故意独立；1–1632 行的浅色基线仍被夜主题整段覆盖，**删除它属于一次视觉重构，需要你确认后单独做**。

**A-c 让 `visual.primaryColor / secondaryColor` 真的生效 —— ✅ 本轮已完成**
原先 `validate-content.mjs:137` 校验这两个字段、工作台也让用户选色，但 canvas 只读 `particleDensity` / `flowSpeed` / `motionEnabled`，**颜色是死字段**。
现在 `auroraPalette(config)`（site.js:797）以这两个颜色为基色、再混出两种辅助色调，两块 canvas 共用。
> 副作用需知：改之前画布是硬编码的极光绿（emerald/ice/mint/lemon），而 `site.json` 里写的是蓝（`#6f9db5` / `#4f7f99`）。现在**内容说了算**，所以画布从绿变成了蓝，与 accent 一致。想回到极光绿，只需在工作台把"主题强调色"设为 `#7ee2c0`、"主流颜色" `#7ee2c0`、"次流颜色" `#66d5e6`，不用改代码。

**A-d 补 `sections` 开关（借 P3，补齐 A3）—— ✅ 已完成**
`site.json` 新增 `sections`：`about / research / publications / news / education / contributions / workstation` 各一个 `enabled`。
渲染端 `sectionEnabled()`（site.js）把开关作为**额外的 AND 条件**叠加到原有规则上：`applySectionSwitches()` 管 about/research/education/workstation（education 还要求有教育经历），publications/news/contributions 则与各自的 `enabled` + 内容判断合并。**未配置的章节默认可见**，所以老内容不需要迁移。
工作台新增"章节开关"栏（7 个复选框），关掉后该节与导航项一起消失。校验器只接受这 7 个键，写错键名会直接报错。

**A-e 元数据收尾（这一项你已经领先，补完就是完整）**
`favicon.ico`（32×32）+ `apple-touch-icon`（180×180 PNG，别再用 12 KB 的 jpg）+ 专用 OG 图（1200×630）+ `404.html`（返回学术页）+ `sitemap.xml` 里加 `lastmod` 来自内容文件 mtime。

**A-f 顺手修的小问题 —— ✅ 已完成**
- 语言偏好改用单一 key `garrylee-language`（读取时兼容旧的 `-academic` / `-workstation`），换页不再丢；
- `initializeNavigation()` 现在同时设置 `aria-current="location"`；
- `new URL(project.url)` 加了 try/catch，网址写错只让那一行留空，不再中断整页渲染。

### B 级｜值得做：半天到一天

**B1 填 Publications（成本最低的"学术主页"升级）**
模型已经在 `site.json:60-63` 与 `site.schema.json:176-221` 里定义好了，缺的只是条目。填入后 `setSectionVisibility()` 会自动把 `#publications` 与导航项放出来——**渲染器、校验器、工作台表单、样式（`styles.css:851-1001`）都已就绪**。

**B2 资源存在性校验（借 P2 的 fail-fast）—— ✅ 已完成**
`validateContent(data, { assetRoot })` 现在会检查 `contact.resume`、`icons.*`、出版物 `links.pdf/data` 指向的本地文件是否真的存在，并拦截逃出项目目录的路径。构建与工作台都会传 `assetRoot`，**构建期失败而不是线上 404**；不传 `assetRoot` 时跳过检查，测试可继续用虚构路径。

**B3 项目卡片换成真实截图（借 Anleeno 的项目卡）**
`project-preview` 现在是纯 CSS 画的三段式"伪截图"（`visualLabel/visualMeta/visualTitle`）。加可选 `image` 字段：有图用图（`aspect-ratio: 16/10; object-fit: cover`），没图回落 CSS 版。**绝不要把大视频放进仓库**（Anleeno 的 98 MiB `ex.mp4` 是反面教材），视频只走外链或 `<iframe>`。

**B4 论文预览弹层（只做 1 个模板）**
原生 `<dialog>` + 摘要 + 1 张关键图 + "为什么重要/怎么做/结果"三行。借 `basic` 模板的思想，不借 5 模板体系。

**B5 简历体验**
`<dialog>` 内嵌 `<iframe src="assets/Jiarui_Li_English_Resume.pdf">` + 下载按钮 + 移动端降级为新窗口。别上 PDF.js。

**B6 工作台质量（这三项 Anleeno 都没有，是你反超它的地方）**
未保存离开提醒（`beforeunload`）、`localStorage` 自动草稿、发布前 diff 摘要（"本次改动：profile.introduction、services[1]"）、图片上传（写进 `assets/uploads/` 并回填路径）。

**B7 悬浮回顶 + 移动端导航抽屉**
现在 760px 断点下 `.site-nav` 与 `.language-switch` 挤在一行；学术页 4 个导航 + 语言切换在窄屏会折行。

### C 级｜要动架构，谨慎评估

**C1 构建期预渲染（最正确的方向）**
`build.mjs` 里用 `site.js` 同一个渲染函数产出静态 HTML 片段（把 DOM 渲染改成"返回字符串"的纯函数，Node 与浏览器共用）。收益：首屏无闪烁、可爬、可被 `curl` 读到、断网也有内容。成本：渲染器要重构成无 DOM 依赖 + 一次模板分叉。**做完 A-b/B2 之后再做这个**，它们在同一条演进线上。

**C2 文献元数据半自动同步**
手填 `doi`，本地脚本按 DOI 拉 Crossref 生成 title/authors/venue/citation（**只在本地跑，不进 CI**）。Anleeno 选择在浏览器里实时抓 Scholar——脆弱；把抓取放在"维护者本机的一次性脚本"里更稳。

**C3 Related / Daily Papers**
不建议现在做：需要代理服务、外部 API 稳定性、隐私说明。等有博客/笔记流之后再说。

### D 级｜明确不做

- React/Vite/组件库全覆盖（丢掉零依赖优势，`npm ci` 成为新故障点）；
- PDF.js 标注器（包体 + 维护成本远超收益）；
- 把大视频/大图提交进 git（98 MiB 的 `ex.mp4` 是反面教材）；
- 5 套论文预览模板（1 套够用）；
- 运行时抓第三方学术 API。

---

## 4. 路线与验收标准

| 周 | 任务 | 验收 |
| --- | --- | --- |
| W1 | A-a 门禁 · A-b 颜色收敛 · A-c 死字段 | `npm test` 全绿；CI 在 build 前跑 validate+test；故意写坏 `site.json`（比如删掉 `profile.headline`）→ 本地 `npm run build` 失败、CI 失败、线上保持旧版；改 `meta.accent` 后页面颜色**整体**跟着变 |
| W2 | A-d 章节开关 · A-e 元数据收尾 · B2 资源校验 | 关掉 `sections.research` 后该节与导航项一起消失；删掉 `assets/Jiarui_Li_English_Resume.pdf` 后构建失败；`curl https://jair0824.github.io` 有正确 OG/JSON-LD |
| W3 | B1 填论文 · B3 项目真图 · B4 预览弹层 · B6 工作台增强 | 工作台能增删论文与动态并一键发布；导航随开关联动；引用可一键复制；论文弹层可开可关（Esc / 焦点回退） |

**长期守则**：任何新内容类型都走"JSON 字段 → Schema → 工作台表单 → 校验器 → 渲染器"五步，绝不在 HTML 里写死第二份数据。

---

## 5. 体检报告：现存问题（按严重度，均已在代码中核对）

### P0（线上可见 / 会污染仓库 / 门禁失效）

**P0-1 主色分散在 4 处，运行时互相覆盖 —— ✅ 本轮已修（主体）**
原状：`styles.css:7` 浅色 `--accent: #6f9db5`；`styles.css:1654` 夜主题改成绿 `#7ee2c0` / `--accent-dark: #5bb8a0`；`site.js:773` 又用 inline style 写回内容的蓝；两块 canvas 的 `palette` 再硬编码 emerald/ice/mint/lemon。inline 优先级最高，于是导航下划线是蓝、hover 是绿、强调点是柠檬黄、粒子是绿松石。
现在：`site.json.meta.accent` 是 accent 的唯一真源（inline 注入），CSS 只保留同步过的回落值；`--line-strong`、`.project-preview` 边框、`.profile-visual` 外环改为 accent 色；canvas 改为读内容配置（见 A-c）。
仍有意保留的独立色：`--coral` / `--gold`（柠檬黄，**高亮**语义）与极光色团（插画层）。

**P0-2 仓库污染 —— 已修一半**
- ✅ `.dsh-acl-recovery/`（ACL 恢复备份，约 100 KB）已加入 `.gitignore`，`git status` 中不再出现；
- ⚠️ `docs/.write-test`（5 B，内容 `test`）**仍然存在，且无法用命令行删除**：`Remove-Item` / `Set-Content` 在 `docs/` 下均返回"对路径的访问被拒绝"，而对仓库根目录的同类操作正常；`Get-Acl docs` 显示的却是 `Authenticated Users: Modify`，即 **ACL 看起来允许但实际写入被拒**——这是一个环境异常，不是本项目的设计问题。
  处理方式：在工作台外手动删除，或先修 `docs/` 的 ACL（本机有 `diagnose-windows-sandbox-acl` 流程可用）。
  风险等级：只要不点"发布到 GitHub"，它不会进仓库；一旦发布，`git add --all` 会带上它。

**P0-3 `npm test` 曾经全红 —— ✅ 本轮已修，17/17 通过**
表面上是两个断言写错，但**第二个其实是真 bug**，所以没有放宽断言：

1. `学术页注入英文元数据与规范地址`：断言 `<title>${siteTitleEn}</title>` 原文出现，而 `siteTitleEn` 含 `&`，`applySiteBindings()` 正确转义成 `&amp;`。**是测试写错**（HTML 里 `&amp;` 才对）→ 断言改用导出的 `escapeHtml()`。
2. `HTML 里不再硬编码联系方式，只能来自内容文件`：先命中的是 `__SITE_NAME__` 的值 `GarryLee`（首屏兜底，合法）→ 测试排除姓名 token；排除后又命中 `Jair0824`，这次是**真的硬编码**：`index.html` 里 `@Jair0824`（贡献图署名）与两处 `href="https://github.com/Jair0824"` 都没走占位符 → 已改为 `@__SITE_GITHUB_LABEL__` 与 `href="__SITE_GITHUB_URL__"`。

修复后核对：`lang`/`title`/`og:image`/`canonical`/`JSON-LD` 全部正确注入，两块页面均无残留 `__SITE_*__`，`meta` 块仍为 1 份（幂等），坏数据（删掉 `profile.headline`）会被校验器拦下。

### P1（结构性问题，影响可维护性）

1. ~~**测试未接入 CI**~~ → ✅ 已接入：`pages.yml` 现在 `validate → test → build` 三步齐全。
2. **首屏正文仍不可爬**：`title/description/OG/JSON-LD` 已构建期定稿（✅），但**正文**（简介、研究兴趣、教育、论文）仍 100% 由 `fetch('content/site.json')` 运行时渲染；无 JS 时只有 `index.html` 里那几段中文兜底，且**英文访问者看到的是中文兜底**（`lang="en"`）。→ C1。
3. **CSS 双主题叠加**：1–1632 行是浅色基线，1647–1958 行用"极光夜"整体重定义 `:root` 并覆盖组件；`.skip-link`、`.site-header`、`.language-switch` 被改了两遍；`--surface/--panel/--panel-strong` 中的 `--panel/--panel-strong` 在夜主题里是 `transparent`，实际已无意义。→ A-b。
4. **文案三源（部分收口）**：`index.html` 的 `data-i18n` 文本、`assets/site.js` 的 `interfaceCopy`、`site.json` 的 `ui.*` 仍同时存在。本轮已把 `ui.zh` / `ui.en` 的**键集合一致性**纳入校验（缺键会构建失败），并删掉了空串占位；但三份文本本身还没合并。
5. ~~**数据双轨**~~ → ✅ 已删除 `credentials*`：`site.json` 只剩 `education` 对象数组，工作台 `collectContent()` 不再写第二份。
6. ~~**语言选择不跨页**~~ → ✅ 已改为单一 `garrylee-language` key（读取兼容旧 key）。

### P2（体验 / 性能 / 健壮性）

7. **头像圆盘仍是浅色**：`initializeProfileOrb()` site.js:832 用 `#f8fafc` 填一个近白色实心圆，而夜主题下 `.profile-visual` 背景是 `rgb(3 12 14 / 0.24)`（styles.css:1908-1911）。结果是深色页面里一个白盘**（疑似浅色主题残留）**。
8. **贡献 SVG 本地过期**：只在 CI 产物里重新生成，不回写仓库，本地预览会看到旧数据；`img` 上写死 `width="790"`（index.html:142），与生成器算法（`42 + 53*14 + 6 = 790`）耦合。
9. **背景性能**：全屏 fixed canvas + `mix-blend-mode: screen` + 每帧 `shadowBlur`（磁力线）+ 4 个 `blur(60px)` 色团 + 8 个流星 + 最多 280 粒子。移动端已 ×0.55，但低端机仍可能掉帧。建议按 `navigator.deviceMemory / hardwareConcurrency` 分档，并加"区块不在视口就暂停"。
10. ~~**`aria-current` 缺失**~~ → ✅ 已补 `aria-current="location"`。
11. **本地服务无 Origin/Host 校验**：绑 `127.0.0.1` 已挡住外网，`resolveStaticPath()` 也有路径逃逸防护（`startsWith(projectRoot)`），但 DNS rebinding 理论上可绕过；加一行 `Host`/`Origin` 白名单成本极低。
12. **工作台无未保存提醒 / 无草稿 / 无图片上传**（见 B6）。
13. ~~**`upload-pages-artifact@v3`**~~ → ✅ 已升至 `@v4`（与 Anleeno 对齐）。
14. ~~**`renderWorkstation()` 的 `new URL(project.url)` 无保护**~~ → ✅ 已加 try/catch，坏网址只让 hostname 那一行留空。
15. ~~**`visual.primaryColor/secondaryColor` 是死字段**~~ → ✅ 已改为 canvas 配色来源（见 A-c）。

---

## 6. 附：可直接落地的最小改动清单（按文件）

| 文件 | 改动 | 对应 | 状态 |
| --- | --- | --- | --- |
| `.gitignore` | + `.dsh-acl-recovery/` | P0-2 | ✅ 已做 |
| `docs/.write-test` | 删除（写入测试残留） | P0-2 | ⚠️ 需手动：`docs/` 下命令行写入被 ACL 拒绝 |
| `.github/workflows/pages.yml` | `build` 前加 `npm run validate` + `npm test`；artifact 升 `@v4` | P1-1、P2-13 | ✅ 已做 |
| `tools/site-bindings.test.mjs` | 标题断言用 `escapeHtml`；硬编码检查排除 `__SITE_NAME__` | P0-3 | ✅ 已做 |
| `index.html` | `@Jair0824` → `@__SITE_GITHUB_LABEL__`；两处贡献图 `href` → `__SITE_GITHUB_URL__` | P0-3 | ✅ 已做 |
| `assets/site.js` | canvas 配色改 `auroraPalette(config)`，两块共用 | A-c | ✅ 已做 |
| `assets/site.js` | 语言 key 去 `pageType`；`new URL` 加兜底；`aria-current` | P1-6、P2-10、P2-14 | ✅ 已做 |
| `assets/site.js` | `sectionEnabled()` + `applySectionSwitches()` | A-d | ✅ 已做 |
| `assets/styles.css` | accent 回落值同步；`--line-strong`/项目卡边框/头像环改 accent 色 | P0-1 | ✅ 已做 |
| `content/site.json` | 删 `credentials*`；加 `sections`；清 `ui.*` 空串 | P1-5、A-d | ✅ 已做 |
| `content/site.schema.json` | 加 `sections` 与 `sectionSwitch` 定义 | A-d | ✅ 已做 |
| `tools/validate-content.mjs` | 资源存在性校验（resume/icons/pdf）；ui 键集合一致；focus 数量一致；sections 白名单 | B2、P1-4、A-d | ✅ 已做 |
| `tools/build.mjs` / `workbench-server.mjs` | 校验时传入 `assetRoot` | B2 | ✅ 已做 |
| `workbench/index.html` + `workbench.js` | 章节开关 7 个复选框；不再写回 `credentials` | A-d、P1-5 | ✅ 已做 |
| `content/site.json` | 填 `publications.items`（真实论文） | B1 | ⏳ 待你提供内容 |
| `assets/styles.css` | 删除 1–1632 行浅色基线；补 `back-to-top` | P1-3、B7 | ⏳ 需视觉确认 |
| `tools/build.mjs` | 404.html；favicon/OG 图 | A-e | ⏳ 待做 |
| `tools/workbench-server.mjs` | Host/Origin 白名单 | P2-11 | ⏳ 待做 |
| `workbench/*` | 未保存提醒、草稿、图片上传、发布 diff 摘要 | B6 | ⏳ 待做 |
| `assets/icons/` | 32×32 `.ico` + 180×180 `apple-touch-icon` | A-e | ⏳ 待做 |
