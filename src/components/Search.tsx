import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  pubDate: string;
  url: string;
  content: string;
}

export default function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 懒加载搜索索引
  useEffect(() => {
    if (!open || loaded) return;
    fetch('/search-index.json')
      .then((res) => res.json())
      .then((data: SearchItem[]) => {
        setItems(data);
        setLoaded(true);
      })
      .catch(console.error);
  }, [open, loaded]);

  // 快捷键：Ctrl/Cmd + K 打开，Esc 关闭
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 打开后聚焦输入框
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
    }
  }, [open]);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.25 },
          { name: 'tags', weight: 0.15 },
          { name: 'content', weight: 0.2 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        includeScore: true,
      }),
    [items]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim(), { limit: 10 }).map((r) => r.item);
  }, [fuse, query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink/10 px-3 text-sm text-ink/60 hover:text-ink hover:border-ink/20 transition-colors"
        aria-label="搜索文章"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-ink/10 bg-ink/5 px-1.5 text-[10px] text-ink/50">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
          role="dialog"
          aria-modal="true"
          aria-label="搜索"
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-xl">
            <div className="flex items-center gap-2 border-b border-ink/10 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-ink/40"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索文章标题、描述或内容…"
                className="w-full bg-transparent py-4 text-ink outline-none placeholder:text-ink/40"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded border border-ink/10 px-1.5 text-xs text-ink/50 hover:text-ink"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {!loaded && query.trim() && (
                <p className="px-3 py-6 text-center text-sm text-ink/50">加载中…</p>
              )}

              {loaded && query.trim() && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-ink/50">
                  没有找到「{query}」相关文章
                </p>
              )}

              {!query.trim() && (
                <p className="px-3 py-6 text-center text-sm text-ink/50">
                  输入关键词开始搜索
                </p>
              )}

              <ul>
                {results.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ink">{item.title}</h3>
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-ink/60">
                        {item.description}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
