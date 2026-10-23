import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Manrope, Unbounded } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Providers } from "./providers"
import "./globals.css"
import "leaflet/dist/leaflet.css"

const unbounded = Unbounded({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["500", "600", "700"], variable: "--font-unbounded", display: "swap" })
const manrope = Manrope({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-manrope", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "KaraokeNow — Караоке өрөө захиалга", template: "%s · KaraokeNow" },
  description:
    "Улаанбаатарын караоке өрөөнүүдийг хайж, харьцуулж, онлайнаар захиалаарай. Find and book karaoke rooms in Ulaanbaatar.",
  openGraph: { type: "website", siteName: "KaraokeNow", images: ["/hero-1.jpg"] },
}

export const viewport: Viewport = { themeColor: "#151011" }

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Mongolian is the default for the Ulaanbaatar market.
  const lang = (await cookies()).get("lang")?.value === "EN" ? "EN" : "MN"

  return (
    <ClerkProvider>
      <html lang={lang === "MN" ? "mn" : "en"} suppressHydrationWarning className={`${unbounded.variable} ${manrope.variable}`}>
        <body className="min-h-svh bg-background font-sans text-foreground antialiased">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <Providers lang={lang}>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
