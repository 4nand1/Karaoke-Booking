"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

export type AppLanguage = "EN" | "MN"

type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  toggleLanguage: () => void
  t: (en: string, mn: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: AppLanguage
  children: ReactNode
}) {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage)

  const value = useMemo<LanguageContextValue>(() => {
    const setLanguage = (next: AppLanguage) => {
      setLanguageState(next)
      document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`
      document.documentElement.lang = next === "MN" ? "mn" : "en"
    }
    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "EN" ? "MN" : "EN"),
      t: (en, mn) => (language === "MN" ? mn : en),
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider")
  return context
}
