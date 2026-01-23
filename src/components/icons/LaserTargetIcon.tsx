type Props = {
  className?: string;
  tone?: "violet" | "ice";
};

export default function LaserTargetIcon({ className = "", tone = "violet" }: Props) {
  const accentA = tone === "violet" ? "#A78BFA" : "#7DD3FC";
  const accentB = tone === "violet" ? "#7C3AED" : "#60A5FA";

  return (
    <div className={`k-laserIcon ${className}`}>
      <svg
        viewBox="0 0 320 200"
        className="k-laserIcon__svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="k-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.10" />
            <stop offset="1" stopColor="white" stopOpacity="0.03" />
          </linearGradient>

          <linearGradient id="k-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0.10" />
            <stop offset="0.5" stopColor="white" stopOpacity="0.22" />
            <stop offset="1" stopColor="white" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="k-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={accentA} stopOpacity="0" />
            <stop offset="0.45" stopColor={accentA} stopOpacity="0.75" />
            <stop offset="0.55" stopColor={accentB} stopOpacity="0.95" />
            <stop offset="1" stopColor={accentA} stopOpacity="0" />
          </linearGradient>

          <filter id="k-softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity="0.55" />
          </filter>

          <filter id="k-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.9 0"
            />
          </filter>
        </defs>

        {/* Back plates */}
        <g className="k-laserIcon__stack" filter="url(#k-softShadow)">
          <g opacity="0.18">
            <rect x="86" y="28" width="170" height="120" rx="22" fill="url(#k-glass)" />
            <rect x="86" y="28" width="170" height="120" rx="22" stroke="url(#k-edge)" />
          </g>
          <g opacity="0.22">
            <rect x="76" y="38" width="170" height="120" rx="22" fill="url(#k-glass)" />
            <rect x="76" y="38" width="170" height="120" rx="22" stroke="url(#k-edge)" />
          </g>
          <g opacity="0.26">
            <rect x="66" y="48" width="170" height="120" rx="22" fill="url(#k-glass)" />
            <rect x="66" y="48" width="170" height="120" rx="22" stroke="url(#k-edge)" />
          </g>
        </g>

        {/* Front plate */}
        <rect x="56" y="58" width="170" height="120" rx="22" fill="url(#k-glass)" opacity="0.34" filter="url(#k-softShadow)" />
        <rect x="56" y="58" width="170" height="120" rx="22" stroke="url(#k-edge)" opacity="0.8" />

        {/* Beam + lens + target */}
        <path
          className="k-laserIcon__beamGlow"
          d="M88 120 H214"
          stroke="url(#k-beam)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#k-glow)"
        />
        <path
          className="k-laserIcon__beamCore"
          d="M88 120 H214"
          stroke="url(#k-beam)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="10 10"
        />

        <circle cx="138" cy="120" r="18" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
        <circle cx="138" cy="120" r="11" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />

        <circle className="k-laserIcon__dot" cx="214" cy="120" r="4.5" fill={accentA} />
        <circle cx="214" cy="120" r="10" stroke={accentB} strokeOpacity="0.25" strokeWidth="2" />
      </svg>

      {/* Scoped CSS (component-level) */}
      <style>{`
        .k-laserIcon{
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
        }
        .k-laserIcon__svg{
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Micro-motion, calm and cheap (performance-wise) */
        .k-laserIcon__stack{
          transform-origin: 160px 100px;
          animation: kFloat 5.8s ease-in-out infinite;
        }
        .k-laserIcon__beamGlow{
          opacity: .55;
          animation: kPulse 2.6s ease-in-out infinite;
        }
        .k-laserIcon__beamCore{
          animation: kDash 2.2s linear infinite;
        }
        .k-laserIcon__dot{
          transform-origin: 214px 120px;
          animation: kDot 1.8s ease-in-out infinite;
        }

        @keyframes kFloat{
          0%,100%{ transform: translateY(6px); opacity: 1; }
          50%{ transform: translateY(0px); opacity: 1; }
        }
        @keyframes kPulse{
          0%,100%{ opacity: .35; }
          50%{ opacity: .85; }
        }
        @keyframes kDash{
          from{ stroke-dashoffset: 0; }
          to{ stroke-dashoffset: -40; }
        }
        @keyframes kDot{
          0%,100%{ transform: scale(1); opacity: .75; }
          50%{ transform: scale(1.12); opacity: 1; }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce){
          .k-laserIcon__stack,
          .k-laserIcon__beamGlow,
          .k-laserIcon__beamCore,
          .k-laserIcon__dot{
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
