export default function ProgressRing({
  percent = 0,
  size = 120,
  stroke = 8,
  color = "#00E5FF",
  label,
  sublabel,
}) {
  const p = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 700ms ease-out",
            filter: `drop-shadow(0 0 6px ${color}55)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-semibold text-white tracking-tight">{p}%</div>
          {label && <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">{label}</div>}
          {sublabel && <div className="text-[10px] text-white/40 mt-0.5">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
