import Link from "next/link"
import { Mic } from "lucide-react"
import type { ReactNode } from "react"

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2" aria-label="KaraokeNow">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mic className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">
            Karaoke<span className="text-primary">Now</span>
          </span>
        </Link>
        {children}
      </div>
    </main>
  )
}

export const clerkAppearance = {
  variables: { borderRadius: "0.75rem" },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "bg-card border border-border shadow-card rounded-2xl",
    headerTitle: "text-foreground font-display",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border border-border bg-background text-foreground hover:bg-muted",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-foreground",
    formFieldInput: "bg-background border border-input text-foreground rounded-xl",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-none",
    footer: "bg-transparent",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-primary",
    identityPreviewText: "text-foreground",
    otpCodeFieldInput: "border border-input bg-background text-foreground",
  },
}
