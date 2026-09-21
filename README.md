# GarryLee Personal Website

这是 GarryLee 的双语个人学术主页、个人工作站与本地内容工作台。公开网站由 GitHub Pages 托管，工作台只在本机运行。

## 使用工作台

1. 双击 `start-workbench.cmd`。
2. 浏览器会打开 `http://127.0.0.1:4310/workbench/`。
3. 在左侧编辑内容，右侧查看预览。
4. 点击“保存并预览”把内容写入 `content/site.json`。
5. 点击“发布到 GitHub”提交并推送到远程仓库。

工作台依赖 Node.js 20 或更高版本。脚本会优先使用系统 Node.js；未安装时会尝试使用 Codex 自带的 Node.js。

## GitHub Pages

`.github/workflows/pages.yml` 会在 `main` 分支更新后构建并部署公开站点。它只发布以下内容：

- `index.html`
- `work.html`
- `assets/`
- `content/`

`workbench/` 与 `tools/` 不会部署到公开网站。

首次使用时，在仓库 `Settings > Pages` 中把 Source 设置为 `GitHub Actions`。部署完成后，网站地址为：

`https://jair0824.github.io`

## 命令行

```powershell
npm start
npm run build
```

项目没有第三方运行时依赖，不需要执行 `npm install`。
