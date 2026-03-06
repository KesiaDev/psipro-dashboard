import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const A11Y_STORAGE_KEY = "psipro_a11y";

export type AccessibilityState = {
  highContrast: boolean;
  enlargedFont: boolean;
  textSpacing: boolean;
  largeButtons: boolean;
};

const defaultState: AccessibilityState = {
  highContrast: false,
  enlargedFont: false,
  textSpacing: false,
  largeButtons: false,
};

interface AccessibilityContextType extends AccessibilityState {
  setHighContrast: (v: boolean) => void;
  setEnlargedFont: (v: boolean) => void;
  setTextSpacing: (v: boolean) => void;
  setLargeButtons: (v: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

function loadFromStorage(): AccessibilityState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: AccessibilityState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
    const root = document.documentElement;
    root.classList.toggle("high-contrast", state.highContrast);
    root.classList.toggle("large-font", state.enlargedFont);
    root.classList.toggle("a11y-text-spacing", state.textSpacing);
    root.classList.toggle("large-buttons", state.largeButtons);
  }, [state]);

  const setHighContrast = useCallback((v: boolean) => {
    setState((s) => ({ ...s, highContrast: v }));
  }, []);

  const setEnlargedFont = useCallback((v: boolean) => {
    setState((s) => ({ ...s, enlargedFont: v }));
  }, []);

  const setTextSpacing = useCallback((v: boolean) => {
    setState((s) => ({ ...s, textSpacing: v }));
  }, []);

  const setLargeButtons = useCallback((v: boolean) => {
    setState((s) => ({ ...s, largeButtons: v }));
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...state,
        setHighContrast,
        setEnlargedFont,
        setTextSpacing,
        setLargeButtons,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
