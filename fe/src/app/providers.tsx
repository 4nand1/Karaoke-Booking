"use client"

import type { ReactNode } from "react"
import { MotionConfig } from "framer-motion"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { LanguageProvider, type AppLanguage } from "@/lib/language"

export function Providers({ lang, children }: { lang: AppLanguage; children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="theme" disableTransitionOnChange>
      <LanguageProvider initialLanguage={lang}>
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster position="top-center" richColors />
        </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  )
}
