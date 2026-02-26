import logoPsiPro from "@/assets/logo-psipro.png";

interface PsiProLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PsiProLogo({ className = "", size = "md" }: PsiProLogoProps) {
  const heights = { sm: "h-8", md: "h-12", lg: "h-16" };

  return (
    <img
      src={logoPsiPro}
      alt="PsiPro"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  );
}
