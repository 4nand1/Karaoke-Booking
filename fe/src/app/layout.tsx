import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { LanguageProvider } from "@/lib/language"
import "./globals.css"
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "KaraokeNow",
  description: "Find and book karaoke rooms",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  try {
                    var savedTheme = localStorage.getItem("theme");
                    var isDark =
                      savedTheme === "dark" ||
                      (savedTheme !== "light" &&
                        window.matchMedia("(prefers-color-scheme: dark)").matches);

                    document.documentElement.classList.toggle("dark", isDark);
                  } catch (error) {}
                })();
              `,
            }}
          />
        </head>
        <body>
          <LanguageProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
