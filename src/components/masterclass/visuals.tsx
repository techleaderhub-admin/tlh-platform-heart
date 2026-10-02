/**
 * Custom, lightweight visuals for the masterclass page (inline SVG + CSS, no image downloads).
 */

/** Hero background: a faint system-design blueprint (app → repository → API/cache) on a grid. */
export function HeroBlueprint({ className = "" }: { className?: string }) {
  const node = (x: number, y: number, w: number, label: string, strong = false) => (
    <g key={label}>
      <rect
        x={x}
        y={y}
        width={w}
        height="44"
        rx="10"
        fill={strong ? "rgba(31,86,224,0.16)" : "rgba(229,228,226,0.03)"}
        stroke={strong ? "rgba(108,152,255,0.55)" : "rgba(229,228,226,0.16)"}
      />
      <text
        x={x + w / 2}
        y={y + 27}
        textAnchor="middle"
        fontSize="13"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fill={strong ? "rgba(200,216,255,0.9)" : "rgba(229,228,226,0.42)"}
      >
        {label}
      </text>
    </g>
  );
  return (
    <svg
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="mc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(229,228,226,0.045)" strokeWidth="1" />
        </pattern>
        <radialGradient id="mc-fade" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="mc-mask">
          <rect width="1200" height="640" fill="url(#mc-fade)" />
        </mask>
      </defs>
      <g mask="url(#mc-mask)">
        <rect width="1200" height="640" fill="url(#mc-grid)" />
        <g
          className="mc-blueprint-lines"
          fill="none"
          stroke="rgba(108,152,255,0.35)"
          strokeWidth="1.2"
        >
          <path d="M210 150 H330" />
          <path d="M470 150 H590" />
          <path d="M730 150 C800 150 800 96 870 96" />
          <path d="M730 150 C800 150 800 210 870 210" />
          <path d="M1010 96 H1060" strokeDasharray="4 6" />
          <path d="M400 172 V330 H520" strokeDasharray="4 6" />
          <path d="M660 172 V470 H780" strokeDasharray="4 6" />
        </g>
        {node(70, 128, 140, "UI / Compose")}
        {node(330, 128, 140, "ViewModel", true)}
        {node(590, 128, 140, "Repository", true)}
        {node(870, 74, 140, "Remote API")}
        {node(870, 188, 140, "Local cache")}
        {node(520, 308, 150, "Use cases")}
        {node(780, 448, 170, "Offline sync")}
      </g>
    </svg>
  );
}

/** Problem → solution: a flat "ticket-closer" line against a rising "tech leader" curve. */
export function TrajectoryChart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 300" className={className} role="img" aria-labelledby="mc-traj-title">
      <title id="mc-traj-title">
        Career trajectory: a flat line for a ticket-closer, a rising curve for a tech leader
      </title>
      <defs>
        <linearGradient id="mc-rise" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1f56e0" />
          <stop offset="100%" stopColor="#e5e4e2" />
        </linearGradient>
        <linearGradient id="mc-rise-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(31,86,224,0.28)" />
          <stop offset="100%" stopColor="rgba(31,86,224,0)" />
        </linearGradient>
      </defs>
      <g stroke="rgba(229,228,226,0.08)">
        <path d="M40 60H500M40 130H500M40 200H500M40 260H500" />
      </g>
      <path
        d="M40 232 C160 230 300 228 500 226"
        fill="none"
        stroke="rgba(229,228,226,0.35)"
        strokeWidth="2.5"
        strokeDasharray="6 7"
      />
      <path
        d="M40 236 C170 226 250 170 330 120 S450 52 500 40 V260 H40 Z"
        fill="url(#mc-rise-fill)"
      />
      <path
        className="mc-rise-line"
        d="M40 236 C170 226 250 170 330 120 S450 52 500 40"
        fill="none"
        stroke="url(#mc-rise)"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength={1}
      />
      <circle cx="500" cy="40" r="6" fill="#e5e4e2" />
      <text x="48" y="218" fontSize="13" fill="rgba(229,228,226,0.55)">
        Ticket-closer
      </text>
      <text x="384" y="30" fontSize="13" fontWeight="600" fill="#e5e4e2">
        Tech Leader
      </text>
      <text x="40" y="285" fontSize="11" fill="rgba(229,228,226,0.4)">
        Today
      </text>
      <text x="420" y="285" fontSize="11" fill="rgba(229,228,226,0.4)">
        After 90 days
      </text>
    </svg>
  );
}

/** A designed cover for each bonus, so the gifts feel tangible. */
export function BonusCover({
  kind,
  title,
}: {
  kind: "book" | "scorecard" | "resume";
  title: string;
}) {
  return (
    <div className={`mc-cover mc-cover-${kind}`} aria-hidden="true">
      <span className="mc-cover-brand">Tech Leader Hub</span>
      {kind === "book" ? (
        <svg viewBox="0 0 120 70" className="mc-cover-art">
          <path
            d="M8 60 C40 58 60 40 80 26 S108 10 114 8"
            fill="none"
            stroke="#6c98ff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="114" cy="8" r="4" fill="#e5e4e2" />
        </svg>
      ) : kind === "scorecard" ? (
        <svg viewBox="0 0 120 70" className="mc-cover-art">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={8 + i * 18}
              y={60 - (i + 2) * 7}
              width="11"
              height={(i + 2) * 7}
              rx="3"
              fill={i === 5 ? "#6c98ff" : "rgba(229,228,226,0.35)"}
            />
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 120 70" className="mc-cover-art">
          <rect
            x="22"
            y="4"
            width="76"
            height="62"
            rx="6"
            fill="rgba(229,228,226,0.08)"
            stroke="rgba(229,228,226,0.3)"
          />
          <rect x="32" y="14" width="40" height="5" rx="2.5" fill="#e5e4e2" />
          <rect x="32" y="26" width="56" height="3" rx="1.5" fill="rgba(229,228,226,0.4)" />
          <rect x="32" y="34" width="50" height="3" rx="1.5" fill="rgba(229,228,226,0.4)" />
          <rect x="32" y="42" width="54" height="3" rx="1.5" fill="rgba(229,228,226,0.4)" />
          <path
            d="M70 52 l6 6 l12 -14"
            fill="none"
            stroke="#6c98ff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className="mc-cover-title">{title}</span>
    </div>
  );
}
