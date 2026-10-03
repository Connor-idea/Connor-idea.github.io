---
title: "用 Three.js 做一个首页 Hero 场景"
description: "分享首页背后那个 3D 场景的实现思路：粒子星空、线框多面体与鼠标视差。"
pubDate: 2026-01-15
tags: ["Three.js", "React"]
---

首页顶部的 Hero 使用了一个轻量的 Three.js 场景，整体思路很直接：

## 场景组成

1. **线框多面体** — 使用 `IcosahedronGeometry` 配合 `wireframe` 材质
2. **星空粒子** — 随机分布在空间中的 `Points`
3. **鼠标视差** — 相机位置跟随指针做平滑插值

## 性能细节

- 限制 `devicePixelRatio` 最高为 2
- 在组件卸载时释放几何体、材质和渲染器
- 使用 `requestAnimationFrame` 驱动渲染循环

这样既保证了视觉效果，又不会给页面带来太大负担。
