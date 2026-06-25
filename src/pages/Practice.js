import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { SUBJECTS, getSubjectMeta } from "@/lib/subjects";
import {
  Code2,
  ExternalLink,
  Loader2,
  Search,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Auto-generate LeetCode URL from video title (DSA only)
function toLeetCodeUrl(title) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `https://leetcode.com/problems/${slug}/`;
}

// LeetCode search fallback (DSA only)
function toLeetCodeSearch(title) {
  return `https://leetcode.com/problemset/?search=${encodeURIComponent(title)}`;
}

// Difficulty badge color
const DIFFICULTY_COLORS = {
  Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  Hard: "text-rose-500 bg-rose-500/10 border-rose-500/30",
};

// Guess difficulty from title keywords
function guessDifficulty(title) {
  const t = title.toLowerCase();
  const hardKeywords = ["lru", "lfu", "median", "serialize", "alien", "word ladder", "trapping", "burst", "minimum window", "edit distance", "regular expression", "wildcard", "n-queens", "sudoku"];
  const easyKeywords = ["two sum", "reverse string", "fibonacci", "palindrome", "factorial", "valid parentheses", "merge sorted", "climbing stairs", "binary search", "first bad", "single number", "missing number", "majority element", "best time to buy"];
  if (hardKeywords.some((k) => t.includes(k))) return "Hard";
  if (easyKeywords.some((k) => t.includes(k))) return "Easy";
  return "Medium";
}

export default function Practice() {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("all");
  const [expandedTopics, setExpandedTopics] = useState({});
  const [solvedSet, setSolvedSet] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("prephub-solved") || "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const subjectRes = await api.get("/api/prep/subjects");
        const subjects = subjectRes.data?.data || [];
        const allFetched = [];

        await Promise.all(
          subjects.map(async (subject) => {
            try {
              const topicRes = await api.get(`/api/prep/topics/${subject}`);
              const topics = topicRes.data?.data || [];
              await Promise.all(
                topics.map(async (topic) => {
                  try {
                    const videoRes = await api.get(
                      `/api/prep/videos/${subject}/${encodeURIComponent(topic)}`
                    );
                    const videos = videoRes.data?.data || [];
                    videos.forEach((v) => {
                      allFetched.push({
                        ...v,
                        subject,
                        topic,
                        // LeetCode fields only for DSA
                        resolvedLeetcodeUrl:
                          subject === "dsa"
                            ? v.leetcodeUrl && v.leetcodeUrl.trim()
                              ? v.leetcodeUrl
                              : toLeetCodeUrl(v.title)
                            : null,
                        isAutoUrl:
                          subject === "dsa"
                            ? !v.leetcodeUrl || !v.leetcodeUrl.trim()
                            : false,
                        difficulty: guessDifficulty(v.title),
                      });
                    });
                  } catch { /* skip */ }
                })
              );
            } catch { /* skip */ }
          })
        );

        if (alive) {
          setAllVideos(allFetched);
          setLoading(false);
        }
      } catch (e) {
        if (alive) {
          setError(e?.response?.data?.message || "Failed to load problems");
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  const toggleTopic = (key) => {
    setExpandedTopics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSolved = (id) => {
    setSolvedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("prephub-solved", JSON.stringify([...next]));
      return next;
    });
  };

  // Filter
  const filtered = allVideos.filter((v) => {
    const matchSubject = activeSubject === "all" || v.subject === activeSubject;
    const matchSearch =
      !search ||
      v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.topic?.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  // Group by subject → topic
  const grouped = {};
  filtered.forEach((v) => {
    if (!grouped[v.subject]) grouped[v.subject] = {};
    if (!grouped[v.subject][v.topic]) grouped[v.subject][v.topic] = [];
    grouped[v.subject][v.topic].push(v);
  });

  const totalProblems = filtered.length;
  const solvedCount = filtered.filter((v) => solvedSet.has(v._id)).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Loading practice problems…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md px-4 py-3">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-2">
            practice arena
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Solve Problems
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every video has a linked problem. Watch → understand → solve.
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-sm font-semibold">
              {solvedCount} / {totalProblems} solved
            </span>
          </div>
          {totalProblems > 0 && (
            <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.round((solvedCount / totalProblems) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Search + Subject Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search problems or topics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubject("all")}
            className={`px-3 py-2 rounded-md text-xs font-medium uppercase tracking-[0.15em] transition-all border ${
              activeSubject === "all"
                ? "bg-foreground text-background border-foreground"
                : "bg-muted border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSubject(s.key)}
              className={`px-3 py-2 rounded-md text-xs font-medium uppercase tracking-[0.15em] transition-all border ${
                activeSubject === s.key
                  ? `${s.bg} text-white border-transparent`
                  : `bg-muted border-border text-muted-foreground hover:${s.text}`
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend — only show for DSA */}
      {(activeSubject === "dsa" || activeSubject === "all") && (
        <div className="flex items-center gap-4 mb-5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Easy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Hard
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <Code2 className="h-3 w-3 text-amber-500" /> = direct link &nbsp;|&nbsp;
            <Search className="h-3 w-3 text-cyan-500" /> = search fallback
          </span>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Code2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <div className="text-foreground font-medium mb-1">No problems found</div>
          <div className="text-muted-foreground text-sm">
            {search ? `No results for "${search}"` : "No videos found for this subject."}
          </div>
        </div>
      )}

      {/* Grouped by Subject → Topic */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([subjectKey, topicsMap]) => {
          const meta = getSubjectMeta(subjectKey);
          const subjectVideos = Object.values(topicsMap).flat();
          const subjectTotal = subjectVideos.length;
          const subjectSolved = subjectVideos.filter((v) => solvedSet.has(v._id)).length;
          const isDSA = subjectKey === "dsa";

          return (
            <div key={subjectKey} className={`rounded-xl border border-border border-l-4 ${meta.border} overflow-hidden`}>

              {/* Subject header */}
              <div className="px-5 py-4 bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-md bg-muted border ${meta.border} border-opacity-50 grid place-items-center`}>
                    <BookOpen className={`h-4 w-4 ${meta.text}`} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className={`text-[10px] uppercase tracking-[0.22em] ${meta.text}`}>
                      {meta.label}
                    </div>
                    <div className="text-foreground text-sm font-semibold">{meta.full}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${meta.bg} transition-all duration-500`}
                        style={{ width: subjectTotal > 0 ? `${Math.round((subjectSolved / subjectTotal) * 100)}%` : "0%" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {subjectSolved}/{subjectTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div className="divide-y divide-border">
                {Object.entries(topicsMap).map(([topicName, videos]) => {
                  const topicKey = `${subjectKey}-${topicName}`;
                  const isExpanded = expandedTopics[topicKey] !== false;
                  const topicSolved = videos.filter((v) => solvedSet.has(v._id)).length;

                  return (
                    <div key={topicName}>
                      {/* Topic row */}
                      <button
                        onClick={() => toggleTopic(topicKey)}
                        className="w-full flex items-center justify-between px-5 py-3 bg-muted/50 hover:bg-muted transition-all text-left"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                          )}
                          <span className="text-foreground text-sm font-medium capitalize">
                            {topicName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {topicSolved}/{videos.length} solved
                        </span>
                      </button>

                      {/* Problem rows */}
                      {isExpanded && (
                        <div className="divide-y divide-border/50">
                          {videos.map((v, i) => {
                            const isSolved = solvedSet.has(v._id);
                            const diffColor = DIFFICULTY_COLORS[v.difficulty];

                            return (
                              <div
                                key={v._id}
                                className={`flex items-center gap-3 px-5 py-3 transition-all group ${
                                  isSolved ? "bg-emerald-500/5" : "bg-card hover:bg-muted/30"
                                }`}
                              >
                                {/* Solved toggle */}
                                <button
                                  onClick={() => toggleSolved(v._id)}
                                  title={isSolved ? "Mark unsolved" : "Mark solved"}
                                  className="shrink-0 transition-all"
                                >
                                  {isSolved ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={1.75} />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-muted-foreground/40 hover:text-muted-foreground" strokeWidth={1.75} />
                                  )}
                                </button>

                                {/* Index */}
                                <div className="text-[11px] text-muted-foreground w-5 shrink-0 text-right">
                                  {i + 1}
                                </div>

                                {/* Title */}
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium truncate transition-all ${isSolved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                    {v.title}
                                  </div>
                                  <div className={`text-[10px] uppercase tracking-[0.16em] mt-0.5 ${meta.text}`}>
                                    {topicName}
                                  </div>
                                </div>

                                {/* Difficulty badge — DSA only */}
                                {isDSA && (
                                  <span className={`hidden sm:inline-flex shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-[0.1em] ${diffColor}`}>
                                    {v.difficulty}
                                  </span>
                                )}

                                {/* Watch video */}
                                <Link
                                  to={`/subject/${subjectKey}/${encodeURIComponent(topicName)}`}
                                  className="shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                                  title="Watch video"
                                >
                                  <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                                  <span className="hidden sm:inline">Watch</span>
                                </Link>

                                {/* Solve on LeetCode — DSA only */}
                                {isDSA && (
                                  <a
                                    href={v.resolvedLeetcodeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={v.isAutoUrl ? "Auto-matched LeetCode link (may need adjustment)" : "Verified LeetCode link"}
                                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-all ${
                                      v.isAutoUrl
                                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/20"
                                        : "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                                    }`}
                                  >
                                    <Code2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    <span className="hidden sm:inline">Solve</span>
                                    <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                                  </a>
                                )}

                                {/* LeetCode search fallback — DSA only */}
                                {isDSA && v.isAutoUrl && (
                                  <a
                                    href={toLeetCodeSearch(v.title)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Search on LeetCode if Solve link doesn't work"
                                    className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
                                  >
                                    <Search className="h-3 w-3" strokeWidth={1.75} />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}