import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { getSubjectMeta, youtubeIdFromUrl } from "@/lib/subjects";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Save,
  Code2,
  StickyNote,
} from "lucide-react";

function VideoCard({ video, subject, onMarkWatched, isWatched }) {
  const [note, setNote] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [marking, setMarking] = useState(false);
  const meta = getSubjectMeta(subject);
  const ytId = useMemo(() => youtubeIdFromUrl(video.videoUrl), [video.videoUrl]);

  useEffect(() => {
    let alive = true;
    api
      .get(`/api/notes/${video._id}`)
      .then((res) => {
        if (alive && res.data?.success) setNote(res.data.note || "");
      })
      .catch(() => {})
      .finally(() => alive && setNoteLoaded(true));
    return () => { alive = false; };
  }, [video._id]);

  const saveNote = async () => {
    setSaving(true);
    try {
      await api.post(`/api/notes/${video._id}`, { note });
      setSavedAt(new Date());
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const markWatched = async () => {
    if (isWatched || marking) return;
    setMarking(true);
    try {
      await api.post(`/api/prep/progress`, { videoId: video._id, subject });
      onMarkWatched(video._id);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div
      data-testid={`video-card-${video._id}`}
      className="rounded-xl bg-card border border-border overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Player */}
        <div className="lg:col-span-8 p-5 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <h3 className="text-foreground text-base sm:text-lg font-medium tracking-tight">
                {video.title}
              </h3>
              <div className={`text-[10px] uppercase tracking-[0.22em] mt-1 ${meta.text}`}>
                {meta.label} · {video.topic}
              </div>
            </div>
            <button
              onClick={markWatched}
              disabled={isWatched || marking}
              data-testid={`video-mark-watched-${video._id}`}
              className={`shrink-0 inline-flex items-center gap-2 h-9 px-3 rounded-md text-xs font-medium transition-all border ${
                isWatched
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 cursor-default"
                  : "bg-muted border-border hover:border-emerald-400/40 hover:text-emerald-500 text-muted-foreground"
              }`}
            >
              {marking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isWatched ? "Watched" : "Mark watched"}
            </button>
          </div>

          {ytId ? (
            <div className="aspect-video rounded-md overflow-hidden bg-black border border-border">
              <iframe
                title={video.title}
                src={`https://www.youtube.com/embed/${ytId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md border border-border p-4 text-sm text-muted-foreground hover:bg-muted"
            >
              Open video <ExternalLink className="inline h-3.5 w-3.5 ml-1" />
            </a>
          )}

          {video.leetcodeUrl && (
            <a
              href={video.leetcodeUrl}
              target="_blank"
              rel="noreferrer"
              data-testid={`video-leetcode-link-${video._id}`}
              className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/15"
            >
              <Code2 className="h-3.5 w-3.5" />
              Practice on LeetCode
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Notes */}
        <div className="lg:col-span-4 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-purple-500" strokeWidth={1.75} />
              <div className="text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                notes
              </div>
            </div>
            {savedAt && (
              <span className="text-[10px] text-emerald-500">saved ✓</span>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSavedAt(null);
            }}
            disabled={!noteLoaded}
            placeholder={noteLoaded ? "Jot down key insights, edge cases, complexity…" : "Loading…"}
            data-testid={`video-notes-textarea-${video._id}`}
            className="flex-1 min-h-[180px] bg-muted border border-border focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all font-mono leading-relaxed resize-none"
          />
          <button
            onClick={saveNote}
            disabled={saving || !noteLoaded}
            data-testid={`video-save-note-${video._id}`}
            className="mt-3 inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Topic() {
  const { subject, topic } = useParams();
  const sKey = (subject || "").toLowerCase();
  const tDecoded = decodeURIComponent(topic || "");
  const meta = getSubjectMeta(sKey);
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState(null);
  const [watchedSet, setWatchedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProgress = async () => {
    try {
      const res = await api.get(`/api/prep/progress/${sKey}`);
      if (res.data?.success) setProgress(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api
      .get(`/api/prep/videos/${sKey}/${encodeURIComponent(tDecoded)}`)
      .then((res) => {
        if (!alive) return;
        if (res.data?.success) setVideos(res.data.data || []);
        else setError("Could not load videos");
      })
      .catch((e) => alive && setError(e?.response?.data?.message || "Failed to load videos"))
      .finally(() => alive && setLoading(false));
    refreshProgress();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sKey, tDecoded]);

  const handleMarkWatched = (id) => {
    setWatchedSet((prev) => {
      const n = new Set(prev);
      n.add(id);
      return n;
    });
    refreshProgress();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="topic-loading">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="topic-page">
      <Link
        to={`/subject/${sKey}`}
        data-testid="topic-back-link"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {meta.full}
      </Link>

      <div className={`rounded-xl bg-card border border-border border-l-4 ${meta.border} p-6 mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className={`text-[10px] uppercase tracking-[0.22em] ${meta.text} mb-2`}>
              {meta.label} / topic
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground capitalize">
              {tDecoded}
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              {videos.length} video{videos.length === 1 ? "" : "s"} in this topic.
            </p>
          </div>
          {progress && (
            <div className="min-w-[240px]">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{progress.watchedVideos} / {progress.totalVideos} videos</span>
                <span className={meta.text}>{progress.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
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
          data-testid="topic-error"
          className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md px-4 py-3 mb-6"
        >
          {error}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center text-muted-foreground py-16" data-testid="topic-empty">
          No videos found for this topic yet.
        </div>
      ) : (
        <div className="space-y-6">
          {videos.map((v) => (
            <VideoCard
              key={v._id}
              video={v}
              subject={sKey}
              onMarkWatched={handleMarkWatched}
              isWatched={watchedSet.has(v._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}