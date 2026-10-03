import { useEffect, useMemo, useRef, useState } from 'react';

interface SearchResult {
  id: string;
  url: string;
  excerpt: string;
  meta: { title?: string };
}

/** Pagefind 懒加载搜索：中文按 Unicode 分词，构建期建索引，无外部服务 */
export default function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // @ts-expect-error pagefind 是构建产物里的动态模块，无类型
  const pagefindRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function ensurePagefind() {
    if (pagefindRef.current) return pagefindRef.current;
    // Pagefind 在 astro build 后由 CLI 生成到 /pagefind/
    // 用变量绕开 Vite 静态分析，保持运行时解析
    const pfUrl = '/pagefind/pagefind.js';
    const pf = await import(/* @vite-ignore */ pfUrl);
    await pf.options({ excerptLength: 30 });
    pagefindRef.current = pf;
    setReady(true);
    return pf;
  }

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

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      ensurePagefind().catch(() => setError('搜索索引未加载，请先执行 npm run build'));
    } else {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [open]);

  // 防抖查询
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    // 换查询词时立刻清空旧结果，避免残留
    setResults([]);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const pf = await ensurePagefind();
        const search = await pf.search(q);
        const top = await Promise.all(
          search.results.slice(0, 8).map(async (r: { data: () => Promise<SearchResult> }) => {
            const data = await r.data();
            return {
              id: data.url,
              url: data.url,
              excerpt: data.excerpt,
              meta: { title: (data.meta?.title ?? data.url).trim() },
            };
          })
        );
        setResults(top);
        setError(null);
      } catch {
        setError('搜索失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, ready]);

  const hasQuery = useMemo(() => query.trim().length > 0, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 px-1 text-sm text-ink/50 hover:text-accent transition-colors"
        aria-label="搜索文章"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-ink/35 tracking-wide">
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
            className="absolute inset-0 bg-ink/35 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-paper shadow-2xl">
            <div className="flex items-center gap-2 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
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
                className="shrink-0 px-1.5 text-xs text-ink/35 hover:text-ink transition-colors"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto px-2 pb-2">
              {error && (
                <p className="px-3 py-6 text-center text-sm text-ink/50">{error}</p>
              )}

              {!error && !hasQuery && (
                <p className="px-3 py-6 text-center text-sm text-ink/50">
                  输入关键词开始搜索
                </p>
              )}

              {!error && hasQuery && loading && (
                <p className="px-3 py-6 text-center text-sm text-ink/50">搜索中…</p>
              )}

              {!error && hasQuery && !loading && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-ink/50">
                  没有找到「{query.trim()}」相关文章
                </p>
              )}

              <ul>
                {results.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 hover:bg-accent/[0.07] transition-colors"
                    >
                      <h3 className="font-medium text-ink">{item.meta.title}</h3>
                      <p
                        className="mt-1 text-sm text-ink/55 leading-relaxed [&_mark]:bg-accent/20 [&_mark]:text-inherit"
                        dangerouslySetInnerHTML={{ __html: item.excerpt }}
                      />
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
