"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Languages, LayoutDashboard, Map, Mic, Moon, Search, Sun, User, CalendarDays, Store, LogIn, UserPlus, LogOut } from "lucide-react"
import { SignOutButton, useUser } from "@clerk/nextjs"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiBaseUrl } from "@/lib/api-url"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language"

type SearchListing = { _id: string; name: string; address?: string; city?: string }

const noopSubscribe = () => () => {}

function suggestionScore(listing: SearchListing, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return Number.POSITIVE_INFINITY
  const name = listing.name.toLowerCase()
  const combined = `${name} ${listing.address ?? ""} ${listing.city ?? ""}`.toLowerCase()
  if (name.startsWith(q)) return 0
  if (name.split(/\s+/).some((word) => word.startsWith(q))) return 1
  if (combined.includes(q)) return 2
  return Number.POSITIVE_INFINITY
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { language, toggleLanguage, t } = useLanguage()
  const { resolvedTheme, setTheme } = useTheme()
  const { isSignedIn, user } = useUser()

  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [listings, setListings] = useState<SearchListing[]>([])
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Suggestions are only needed once the search opens.
  async function loadListings() {
    try {
      const res = await fetch(`${apiBaseUrl}/karaoke`, { cache: "no-store" })
      if (!res.ok) return
      const data = (await res.json()) as { karaokes?: SearchListing[] }
      setListings(Array.isArray(data.karaokes) ? data.karaokes : [])
    } catch {
      setListings([])
    }
  }

  function handleOpenChange(open: boolean) {
    setSearchOpen(open)
    if (open && !listings.length) void loadListings()
  }

  const suggestions = useMemo(
    () =>
      listings
        .map((listing) => ({ listing, score: suggestionScore(listing, query) }))
        .filter((entry) => Number.isFinite(entry.score))
        .sort((a, b) => a.score - b.score || a.listing.name.localeCompare(b.listing.name))
        .slice(0, 5)
        .map((entry) => entry.listing),
    [listings, query]
  )

  function submitSearch() {
    const q = query.trim()
    router.push(q ? `/?q=${encodeURIComponent(q)}#venues` : "/#venues")
    setSearchOpen(false)
  }

  const role = (user?.publicMetadata as { role?: string } | undefined)?.role
  const isOwner = role === "karaoke_owner" || role === "admin"
  const name = user?.firstName || user?.fullName || ""
  const solid = scrolled || pathname !== "/"
  const dark = mounted && resolvedTheme === "dark"

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 transition-colors",
        solid ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="wrap flex h-16 items-center gap-1">
        <Link href="/" aria-label="KaraokeNow" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mic className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">
            Karaoke<span className="text-primary">Now</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu open={searchOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("Search", "Хайх")}>
                <Search />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-3">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault()
                  submitSearch()
                }}
                className="flex gap-2"
              >
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder={t("Search venues…", "Караоке хайх…")}
                  aria-label={t("Search venues", "Караоке хайх")}
                />
                <Button type="submit" size="icon" aria-label={t("Search", "Хайх")}>
                  <Search />
                </Button>
              </form>
              {suggestions.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {suggestions.map((listing) => (
                    <li key={listing._id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchOpen(false)
                          router.push(`/book/${listing._id}`)
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <span className="block text-sm font-semibold">{listing.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[listing.address, listing.city].filter(Boolean).join(", ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label={t("Switch language", "Хэл солих")}>
            <Languages className="hidden sm:block" />
            {language}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("Account", "Бүртгэл")}>
                {isSignedIn && name ? (
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1.5">
              {isSignedIn && name && (
                <DropdownMenuLabel>{t(`Hi, ${name}`, `Сайн уу, ${name}`)}</DropdownMenuLabel>
              )}
              {!isSignedIn && (
                <>
                  <DropdownMenuItem onSelect={() => router.push("/sign-in")}>
                    <LogIn /> {t("Log in", "Нэвтрэх")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/sign-up")}>
                    <UserPlus /> {t("Sign up", "Бүртгүүлэх")}
                  </DropdownMenuItem>
                </>
              )}
              {isSignedIn && isOwner && (
                <DropdownMenuItem onSelect={() => router.push("/admin/dashboard")}>
                  <LayoutDashboard /> {t("Dashboard", "Удирдлагын самбар")}
                </DropdownMenuItem>
              )}
              {isSignedIn && !isOwner && (
                <>
                  <DropdownMenuItem onSelect={() => router.push("/my-bookings")}>
                    <CalendarDays /> {t("My bookings", "Миний захиалгууд")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/post-auth?role=admin&redirect_url=/admin/dashboard")}
                  >
                    <Store /> {t("List your venue", "Караокегоо бүртгүүлэх")}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onSelect={() => router.push("/map")}>
                <Map /> {t("Map", "Газрын зураг")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setTheme(dark ? "light" : "dark")}>
                {dark ? <Sun /> : <Moon />}
                {dark ? t("Light mode", "Цайвар горим") : t("Dark mode", "Харанхуй горим")}
              </DropdownMenuItem>
              {isSignedIn && (
                <SignOutButton>
                  <DropdownMenuItem>
                    <LogOut /> {t("Log out", "Гарах")}
                  </DropdownMenuItem>
                </SignOutButton>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
