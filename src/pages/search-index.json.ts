// 构建期生成搜索索引，供客户端 Fuse.js 使用
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const index = posts.map((post) => {
    // 提取纯文本内容用于全文搜索（去掉 markdown 标记）
    const raw = post.body ?? '';
    const text = raw
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/[#>*_~\-\![\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000);

    return {
      id: post.id,
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      pubDate: post.data.pubDate.toISOString(),
      url: `/blog/${post.id}/`,
      content: text,
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
