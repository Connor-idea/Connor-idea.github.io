export const SITE = {
  title: 'My Blog',
  description: '记录技术、思考与生活的个人博客',
  author: 'Connor',
  url: 'https://connor.zone',
  locale: 'zh-CN',
};

/** 每页文章数 */
export const PAGE_SIZE = 5;

/**
 * giscus 评论配置 — 基于 GitHub Discussions
 * https://giscus.app/zh-CN
 * 仓库已开启 Discussions，使用 General 分类
 */
export const GISCUS = {
  repo: 'Connor-idea/Connor-idea.github.io',
  repoId: 'R_kgDOGSTLYw',
  category: 'General',
  categoryId: 'DIC_kwDOGSTLY84DG-Fi',
  mapping: 'pathname',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
  loading: 'lazy',
} as const;
