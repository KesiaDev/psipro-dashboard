import { useTheme } from "next-themes";
import logoPsiPro from "@/assets/logo-psipro.png";
import logoPsiProLight from "@/assets/logo-psipro-light.png";

interface PsiProLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PsiProLogo({ className = "", size = "md" }: PsiProLogoProps) {
  const { resolvedTheme } = useTheme();
  const heights = { sm: "h-28", md: "h-48", lg: "h-72" };
  // resolvedTheme pode ser undefined no carregamento; padrão = logo light (fundo claro)
  const src = resolvedTheme === "dark" ? logoPsiPro : logoPsiProLight;

  return (
    <img
      src={src}
      alt="PsiPro"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  );
}
