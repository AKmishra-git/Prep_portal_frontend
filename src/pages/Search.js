import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { getSubjectMeta, youtubeIdFromUrl } from "@/lib/subjects";
import { Loader2, PlayCircle, Search as SearchIcon, ExternalLink } from "lucide-react";

function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const runSearch = useMemo(
    () =>
      debounce(async (query) => {
        if (!query.trim()) {
          setResults([]);
          setLoading(false);
          return;
        }
        try {
          setError("");
          const res = await api.get(`/api/prep/search`, { params: { q: query } });
          if (res.data?.success) setResults(res.data.data || []);
          else setError("Search failed");
        } catch (e) {
          setError(e?.response?.data?.message || "Search failed");
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    setTouched(true);
    setLoading(!!q.trim());
    runSearch(q);
  }, [q, runSearch]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10" data-testid="search-page">
      <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-400 mb-2">find</div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-6">
        Search the library
      </h1>

      <div className="relative">
        <SearchIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
          strokeWidth={1.75}
        />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, topic or subject…"
          data-testid="search-input"
          className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 rounded-lg pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-all"
        />
      </div>

      {error && (
        <div
          data-testid="search-error"
          className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md px-4 py-3"
        >
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12" data-testid="search-loading">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : !q.trim() ? (
          <div className="text-white/40 text-sm py-12 text-center">
            Try &quot;arrays&quot;, &quot;deadlock&quot;, &quot;tcp&quot; or &quot;inheritance&quot;.
          </div>
        ) : results.length === 0 && touched ? (
          <div className="text-white/40 text-sm py-12 text-center" data-testid="search-no-results">
            No results for &quot;{q}&quot;.
          </div>
        ) : (
          <ul className="space-y-3" data-testid="search-results-list">
            {results.map((v) => {
              const meta = getSubjectMeta(v.subject);
              const ytId = youtubeIdFromUrl(v.videoUrl);
              return (
                <li
                  key={v._id}
                  data-testid={`search-result-${v._id}`}
                  className={`rounded-xl bg-[#121212] border border-white/10 border-l-4 ${meta.border} p-4 hover:border-white/30 transition-all flex items-center gap-4`}
                >
                  <div className={`h-10 w-10 rounded-md bg-white/5 border ${meta.border} border-opacity-50 grid place-items-center`}>
                    <PlayCircle className={`h-4 w-4 ${meta.text}`} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">{v.title}</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/40 mt-0.5">
                      <span className={meta.text}>{meta.label}</span>
                      <span className="text-white/30"> · {v.topic}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ytId && (
                      <a
                        href={v.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-white/50 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/30 inline-flex items-center gap-1"
                      >
                        watch <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <Link
                      to={`/subject/${v.subject}/${encodeURIComponent(v.topic)}`}
                      data-testid={`search-result-open-${v._id}`}
                      className="text-xs bg-white text-black hover:bg-cyan-400 px-3 py-1.5 rounded font-medium"
                    >
                      open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
