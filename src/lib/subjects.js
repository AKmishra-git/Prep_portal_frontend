// Subject metadata: colors, labels, accent classes.
export const SUBJECTS = [
  {
    key: "dsa",
    label: "DSA",
    full: "Data Structures & Algorithms",
    hex: "#00E5FF",
    text: "text-cyan-400",
    border: "border-cyan-400",
    bg: "bg-cyan-400",
    glow: "shadow-[0_0_40px_-12px_rgba(0,229,255,0.6)]",
    ring: "ring-cyan-400/40",
  },
  {
    key: "oops",
    label: "OOPS",
    full: "Object-Oriented Programming",
    hex: "#9D4EDD",
    text: "text-purple-400",
    border: "border-purple-500",
    bg: "bg-purple-500",
    glow: "shadow-[0_0_40px_-12px_rgba(157,78,221,0.6)]",
    ring: "ring-purple-500/40",
  },
  {
    key: "cn",
    label: "CN",
    full: "Computer Networks",
    hex: "#22c55e",
    text: "text-emerald-400",
    border: "border-emerald-400",
    bg: "bg-emerald-400",
    glow: "shadow-[0_0_40px_-12px_rgba(34,197,94,0.6)]",
    ring: "ring-emerald-400/40",
  },
  {
    key: "os",
    label: "OS",
    full: "Operating Systems",
    hex: "#FF6B00",
    text: "text-orange-400",
    border: "border-orange-500",
    bg: "bg-orange-500",
    glow: "shadow-[0_0_40px_-12px_rgba(255,107,0,0.6)]",
    ring: "ring-orange-500/40",
  },
  {
    key: "dbms",
    label: "DBMS",
    full: "Database Management",
    hex: "#FF003C",
    text: "text-rose-400",
    border: "border-rose-500",
    bg: "bg-rose-500",
    glow: "shadow-[0_0_40px_-12px_rgba(255,0,60,0.6)]",
    ring: "ring-rose-500/40",
  },
];

export const SUBJECT_MAP = Object.fromEntries(SUBJECTS.map((s) => [s.key, s]));

export function getSubjectMeta(key) {
  if (!key) return SUBJECTS[0];
  return SUBJECT_MAP[key.toLowerCase()] || SUBJECTS[0];
}

// Extract a YouTube video id from any common YouTube URL shape.
export function youtubeIdFromUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const embedIdx = parts.indexOf("embed");
    if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    return null;
  } catch {
    return null;
  }
}
