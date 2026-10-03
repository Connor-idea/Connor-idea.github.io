---
title: "个人博客的部署选择：为什么用 GitHub Pages"
description: "对比 Vercel、Cloudflare Pages 与 GitHub Pages：个人博客的部署决策，以及自定义域名与 HTTPS 的坑。"
pubDate: 2026-03-01
tags: ["部署", "GitHub"]
---

博客写完只是第一步，**部署方式决定了你以后愿不愿意继续写**。如果每次发布都要登录后台、点构建、等进度条，热情会被慢慢磨掉。

## 候选方案对比

| | GitHub Pages | Vercel | Cloudflare Pages |
|---|---|---|---|
| 价格 | 免费（公开仓库） | 免费额度够用 | 免费额度够用 |
| 发布方式 | `git push` 自动构建 | `git push` 自动构建 | `git push` 自动构建 |
| 自定义域名 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| HTTPS | 自动签发 Let's Encrypt | 自动 | 自动 |
| 大陆可访问性 | 一般 | 一般 | 较好 |
| 构建速度 | 中等 | 快 | 快 |

三家对个人博客都「够用」。我选 GitHub Pages 的理由很朴素：

1. **仓库和站点在一起** —— 代码、Actions、Pages 在同一个地方，心智最简
2. **没有第三方账号** —— 少一个需要续费、限流、改协议的服务
3. **Actions 是通用技能** —— 配置一次 CI，以后迁移平台也能带走

## 实际踩过的坑

### 1. CNAME 与自定义域名

用自定义域名（比如 `connor.zone`）时，注意两点：

- `public/CNAME` 文件内容是域名本体，会被拷进构建产物
- 仓库 Settings → Pages 里也要填同一个域名

DNS 记录按 GitHub 官方文档配：根域名用 4 条 A 记录指向 `185.199.108–111.153`，`www` 用 CNAME 指向 `username.github.io`。

### 2. HTTPS 证书要等

DNS 验证通过后，Let's Encrypt 签发**最长需要 24 小时**。在证书就绪前：

- `https://` 会报证书错误（正常）
- Settings 里的 Enforce HTTPS 是灰色（正常）

**文档里有个容易漏掉的操作**：如果你改过 DNS 设置，需要**移除并重新添加**自定义域名，才会重新触发证书签发流程。我就是卡在这里半天。

### 3. 阿里云 DNS 的缓存

配好 DNS 后如果本地还是 404，先别怀疑配置——很可能只是解析缓存：

```bash
# 对比公共 DNS 与本地解析
dig +short connor.zone @8.8.8.8
dig +short connor.zone
```

不一致就是缓存问题，改本地 DNS 为 `8.8.8.8` 或重启路由器即可。

## 我的 GitHub Actions 配置

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

推送即发布，整个过程 1–2 分钟。

## 什么时候不该用 GitHub Pages

- **需要 SSR / API** —— 用 Vercel / Cloudflare
- **仓库必须私有** —— Pages 免费版要求公开仓库
- **对大陆访问要求高** —— 考虑 Cloudflare Pages 或国内托管

对纯静态的个人博客，GitHub Pages 是「无聊但可靠」的选择。而无聊可靠，恰恰是博客最需要的特质。
