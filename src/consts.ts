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
 * giscus 评论配置
 * https://giscus.app/zh-CN — 填入你的仓库信息后即可启用
 * 仓库需开启 Discussions，且为公开仓库
 */
export const GISCUS = {
  repo: 'your-username/your-username.github.io',
  repoId: 'R_xxxxxxxx',
  category: 'Announcements',
  categoryId: 'DIC_xxxxxxxx',
  mapping: 'pathname',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
  loading: 'lazy',
} as const;
