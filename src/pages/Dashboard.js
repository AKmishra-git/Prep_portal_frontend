import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SUBJECTS, getSubjectMeta } from "@/lib/subjects";
import ProgressRing from "@/components/ProgressRing";
import {
  Flame,
  Clock,
  TrendingUp,
  PlayCircle,
  Loader2,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

function formatDay(d) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { weekday: "short" });
  } catch {
    return d;
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/api/prep/progress/dashboard");
        if (!alive) return;
        if (res.data?.success) setStats(res.data);
        else setError("Could not load dashboard");
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || "Failed to load dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="dashboard-loading">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div
          data-testid="dashboard-error"
          className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md px-4 py-3"
        >
          {error}
        </div>
      </div>
    );
  }

  const subjectStatsMap = Object.fromEntries(
    (stats?.stats || []).map((s) => [s.subject?.toLowerCase(), s])
  );

  const activityData = (stats?.last5Days || []).map((d) => ({
    name: formatDay(d.date),
    fullDate: d.date,
    count: d.count || 0,
  }));

  const overall =
    stats?.totalVideos > 0
      ? Math.round(((stats.totalWatched || 0) / stats.totalVideos) * 100)
      : 0;

  // chart colors based on theme
  const chartAxisColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const chartGridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const tooltipBg = isDark ? "#1a1a1a" : "#ffffff";
  const tooltipBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)";
  const tooltipColor = isDark ? "white" : "black";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="dashboard-page">
      {/* Greeting row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-500 mb-2">
            command center
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Hey {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s where you stand across all subjects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            data-testid="dashboard-streak"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-500"
          >
            <Flame className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-sm font-semibold">{stats?.streak ?? 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted border border-border text-muted-foreground">
            <PlayCircle className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-sm font-medium" data-testid="dashboard-total-watched">
              {stats?.totalWatched ?? 0} / {stats?.totalVideos ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Subject ring grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {SUBJECTS.map((s) => {
          const st = subjectStatsMap[s.key] || { watchedVideos: 0, totalVideos: 0, percent: 0 };
          return (
            <Link
              to={`/subject/${s.key}`}
              key={s.key}
              data-testid={`dashboard-subject-card-${s.key}`}
              className={`group relative rounded-xl bg-card border border-border border-l-4 ${s.border} p-5 hover:-translate-y-0.5 hover:border-border/60 transition-all duration-200 ${s.glow} hover:shadow-[0_0_60px_-12px_rgba(255,255,255,0.15)]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className={`text-[10px] uppercase tracking-[0.22em] ${s.text}`}>
                    {s.label}
                  </div>
                  <div className="text-foreground text-sm font-medium mt-0.5">{s.full}</div>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex items-center justify-center my-2">
                <ProgressRing
                  percent={st.percent || 0}
                  size={110}
                  stroke={8}
                  color={s.hex}
                  label={`${st.watchedVideos || 0}/${st.totalVideos || 0}`}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Activity + overall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-500" strokeWidth={1.75} />
              <h3 className="text-foreground text-sm font-semibold tracking-tight uppercase tracking-[0.18em]">
                last 5 days
              </h3>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              videos completed
            </div>
          </div>
          <div className="h-56 min-h-[224px] w-full" data-testid="dashboard-activity-chart">
            {activityData.length === 0 || activityData.every((d) => !d.count) ? (
              <div className="h-full grid place-items-center text-center">
                <div>
                  <div className="text-muted-foreground text-sm">No activity in the last 5 days yet.</div>
                  <div className="text-muted-foreground/60 text-xs mt-1">Watch a video to start your streak.</div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="name" stroke={chartAxisColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartAxisColor} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: tooltipBorder,
                      borderRadius: 8,
                      color: tooltipColor,
                      fontSize: 12,
                    }}
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="count" fill="#00E5FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-purple-500" strokeWidth={1.75} />
            <h3 className="text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
              overall progress
            </h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ProgressRing percent={overall} size={170} stroke={10} color="#9D4EDD" label="completed" />
          </div>
          <div className="mt-4 text-center text-muted-foreground text-xs">
            {stats?.totalWatched ?? 0} of {stats?.totalVideos ?? 0} videos watched
          </div>
        </div>
      </div>

      {/* Recently watched */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-emerald-500" strokeWidth={1.75} />
          <h3 className="text-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            recently watched
          </h3>
        </div>
        {(!stats?.recentWatched || stats.recentWatched.length === 0) ? (
          <div className="text-muted-foreground text-sm py-6 text-center" data-testid="dashboard-recent-empty">
            No videos watched yet. Open a subject and start grinding.
          </div>
        ) : (
          <ul className="divide-y divide-border" data-testid="dashboard-recent-list">
            {stats.recentWatched.slice(0, 5).map((r, i) => {
              const v = r.videoId || {};
              const meta = getSubjectMeta(v.subject);
              return (
                <li key={i} className="py-3 flex items-center gap-4">
                  <div className={`h-9 w-9 rounded-md grid place-items-center bg-muted border ${meta.border} border-opacity-50`}>
                    <PlayCircle className={`h-4 w-4 ${meta.text}`} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground text-sm font-medium truncate">{v.title || "Untitled"}</div>
                    <div className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
                      <span className={meta.text}>{meta.label}</span>
                      {v.topic ? <span className="text-muted-foreground/60"> · {v.topic}</span> : null}
                    </div>
                  </div>
                  {v.subject && v.topic && (
                    <Link
                      to={`/subject/${v.subject}/${encodeURIComponent(v.topic)}`}
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-border/60"
                      data-testid={`dashboard-recent-open-${i}`}
                    >
                      open
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}