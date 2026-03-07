import { useTheme } from "next-themes";
import logoPsiPro from "@/assets/logo-psipro.png";
import logoPsiProLight from "@/assets/logo-psipro-light.png";

interface PsiProLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PsiProLogo({ className = "", size = "md" }: PsiProLogoProps) {
  const { resolvedTheme } = useTheme();
  const heights = { sm: "h-12", md: "h-20", lg: "h-28" };
  const src = resolvedTheme === "light" ? logoPsiProLight : logoPsiPro;

  return (
    <img
      src={src}
      alt="PsiPro"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  );
}
