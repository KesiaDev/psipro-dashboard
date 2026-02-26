interface PsiProLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PsiProLogo({ className = "", size = "md" }: PsiProLogoProps) {
  const sizes = {
    sm: { height: "h-8", fontSize: 28, viewBox: "0 0 155 48" },
    md: { height: "h-11", fontSize: 36, viewBox: "0 0 195 56" },
    lg: { height: "h-14", fontSize: 44, viewBox: "0 0 240 68" },
  };

  const s = sizes[size];

  return (
    <div className={`${s.height} ${className}`}>
      <div className="flex items-end gap-0 h-full">
        {/* PsiPr text */}
        <span
          className="font-serif font-bold leading-none"
          style={{ fontSize: s.fontSize }}
        >
          <span style={{ color: "#C6A44B" }}>P</span>
          <span style={{ color: "#96782E" }}>si</span>
          <span style={{ color: "#C6A44B" }}>P</span>
          <span style={{ color: "#96782E" }}>r</span>
        </span>

        {/* Stylized "o" with tree */}
        <div className="relative flex flex-col items-center" style={{ marginLeft: -2 }}>
          {/* Tree canopy */}
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: s.fontSize * 0.5,
              height: s.fontSize * 0.42,
              backgroundColor: "#C6A44B",
              marginBottom: -2,
            }}
          >
            {/* Psi symbol */}
            <span
              className="font-serif font-bold leading-none"
              style={{
                fontSize: s.fontSize * 0.3,
                color: "#0E0E0E",
              }}
            >
              Ψ
            </span>
          </div>
          {/* Trunk */}
          <div
            style={{
              width: 3,
              height: s.fontSize * 0.35,
              backgroundColor: "#96782E",
              borderRadius: 2,
            }}
          />
          {/* The "o" */}
          <div
            className="rounded-full"
            style={{
              width: s.fontSize * 0.48,
              height: s.fontSize * 0.48,
              border: `3px solid #C6A44B`,
              marginTop: -2,
            }}
          />
        </div>
      </div>
    </div>
  );
}
