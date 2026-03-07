import logoPsiPro from "@/assets/logo-psipro.png";

interface PsiProLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PsiProLogo({ className = "", size = "md" }: PsiProLogoProps) {
  const heights = { sm: "h-12", md: "h-20", lg: "h-28" };
  return (
    <img
      src={logoPsiPro}
      alt="PsiPro"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  );
}
