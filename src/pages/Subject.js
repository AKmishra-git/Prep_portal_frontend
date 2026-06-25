import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { getSubjectMeta } from "@/lib/subjects";
import { ArrowLeft, ArrowUpRight, BookOpen, Loader2 } from "lucide-react";

export default function Subject() {
  const { subject } = useParams();
  const sKey = (subject || "").toLowerCase();
  const meta = getSubjectMeta(sKey);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.get(`/api/prep/topics/${sKey}`),
      api.get(`/api/prep/progress/${sKey}`).catch(() => ({ data: null })),
    ])
      .then(([tRes, pRes]) => {
        if (!alive) return;
        if (tRes.data?.success) setTopics(tRes.data.data || []);
        if (pRes.data?.success) setProgress(pRes.data);
      })
      .catch((e) => alive && setError(e?.response?.data?.message || "Failed to load subject"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [sKey]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="subject-loading">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="subject-page">
      <Link
        to="/dashboard"
        data-testid="subject-back-link"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> dashboard
      </Link>

      <div
        className={`rounded-xl bg-card border border-border border-l-4 ${meta.border} p-6 mb-8`}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className={`text-[10px] uppercase tracking-[0.22em] ${meta.text} mb-2`}>
              {meta.label}
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              {meta.full}
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              {topics.length} topic{topics.length === 1 ? "" : "s"} to crush.
            </p>
          </div>
          {progress && (
            <div className="min-w-[240px]">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>
                  {progress.watchedVideos} / {progress.totalVideos} videos
                </span>
                <span className={meta.text}>{progress.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  data-testid="subject-progress-bar"
                  className={`h-full rounded-full ${meta.bg}`}
                  style={{ width: `${progress.percent || 0}%`, transition: "width 700ms ease" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          data-testid="subject-error"
          className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md px-4 py-3 mb-6"
        >
          {error}
        </div>
      )}

      {topics.length === 0 ? (
        <div className="text-center text-muted-foreground py-16" data-testid="subject-empty">
          No topics found for this subject yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="subject-topic-grid">
          {topics.map((t) => (
            <Link
              key={t}
              to={`/subject/${sKey}/${encodeURIComponent(t)}`}
              data-testid={`subject-topic-card-${t}`}
              className={`group rounded-xl bg-card border border-border hover:border-border/60 p-5 transition-all hover:-translate-y-0.5 ${meta.glow} hover:shadow-[0_0_60px_-12px_rgba(255,255,255,0.15)]`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-md bg-muted border ${meta.border} border-opacity-50 grid place-items-center`}>
                  <BookOpen className={`h-4 w-4 ${meta.text}`} strokeWidth={1.75} />
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  strokeWidth={1.75}
                />
              </div>
              <div className="mt-4 text-foreground text-base font-medium tracking-tight capitalize">
                {t}
              </div>
              <div className={`text-[10px] uppercase tracking-[0.22em] mt-1 ${meta.text}`}>
                open topic
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}