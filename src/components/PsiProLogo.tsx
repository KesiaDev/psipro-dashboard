import logoPsiPro from "@/assets/logo-psipro.png";

interface PsiProLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PsiProLogo({ className = "", size = "md" }: PsiProLogoProps) {
  const heights = { sm: "h-12", md: "h-20", lg: "h-28" };
  // Logo dourada invisível em fundo claro; brightness-0 no light, normal no dark
  return (
    <img
      src={logoPsiPro}
      alt="PsiPro"
      className={`${heights[size]} w-auto object-contain brightness-0 dark:brightness-100 ${className}`}
    />
  );
}
