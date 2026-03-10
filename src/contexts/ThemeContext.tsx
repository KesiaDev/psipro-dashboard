import { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback, type ReactNode } from "react";

export type ColorPaletteId = "gold" | "terracotta" | "teal" | "violet" | "rose" | "forest";

export const PALETTES: { id: ColorPaletteId; name: string; primary: string; preview: string }[] = [
  { id: "gold", name: "Dourado (original)", primary: "#c9a227", preview: "42 52% 53%" },
  { id: "terracotta", name: "Terracotta", primary: "#c46a3a", preview: "21 55% 50%" },
  { id: "teal", name: "Teal / Oceano", primary: "#1f4d4a", preview: "176 43% 21%" },
  { id: "violet", name: "Violeta", primary: "#7c3aed", preview: "263 84% 58%" },
  { id: "rose", name: "Rosa", primary: "#e11d48", preview: "347 77% 50%" },
  { id: "forest", name: "Floresta", primary: "#166534", preview: "142 64% 26%" },
];

const PALETTE_STORAGE_KEY = "psipro_color_palette";

interface ThemeContextValue {
  palette: ColorPaletteId;
  setPalette: (id: ColorPaletteId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialPalette(): ColorPaletteId {
  if (typeof window === "undefined") return "gold";
  const stored = localStorage.getItem(PALETTE_STORAGE_KEY) as ColorPaletteId | null;
  return stored && PALETTES.some((p) => p.id === stored) ? stored : "gold";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<ColorPaletteId>(getInitialPalette);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [palette]);

  const setPalette = useCallback((id: ColorPaletteId) => {
    setPaletteState(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePalette() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemePalette must be used within ThemeProvider");
  return ctx;
}
