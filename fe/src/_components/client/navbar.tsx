"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sun,
  Moon,
  Mic,
  LayoutDashboard,
  LogIn,
  UserPlus,
  MapPin,
  User,
  BookOpen,
  LogOut,
  Search,
  Languages,
} from "lucide-react"
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/axios"
import { apiRootUrl } from "@/lib/api-url"
import { clerkEnabled } from "@/lib/clerk-config"
import { useLanguage } from "@/lib/language"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type PublicMetadata = {
  role?: "user" | "admin" | "customer" | "karaoke_owner"
  ownerStatus?: "pending" | "approved" | null
}

type ProfileResponse = {
  profile?: {
    role?: "customer" | "karaoke_owner"
    ownerStatus?: "pending" | "approved" | null
  } | null
}

type NavbarContentProps = {
  getToken?: (() => Promise<string | null>) | null
  isAuthLoaded: boolean
  isSignedIn: boolean
  user?: {
    id?: string | null
    firstName?: string | null
    publicMetadata?: PublicMetadata
  } | null
}

type SearchListing = {
  _id: string
  name: string
  address?: string
  city?: string
}

function getSuggestionScore(listing: SearchListing, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return Number.POSITIVE_INFINITY

  const name = listing.name.toLowerCase()
  const location = `${listing.address ?? ""} ${listing.city ?? ""}`.trim().toLowerCase()
  const combined = `${name} ${location}`.trim()

  if (name.startsWith(normalizedQuery)) return 0
  if (name.split(/\s+/).some((word) => word.startsWith(normalizedQuery))) return 1
  if (combined.includes(normalizedQuery)) return 2

  return Number.POSITIVE_INFINITY
}

function NavbarContent({
  getToken,
  isAuthLoaded,
  isSignedIn,
  user,
}: NavbarContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { language, toggleLanguage } = useLanguage()

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false

    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "dark") return true
    if (savedTheme === "light") return false

    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "")
  const [searchListings, setSearchListings] = useState<SearchListing[]>([])
  const [profileMetadata, setProfileMetadata] = useState<PublicMetadata | null>(null)
  const [isProfileResolved, setIsProfileResolved] = useState(false)
  const hasHydrated = useRef(false)

  const copy = useMemo(
    () =>
      language === "MN"
        ? {
            searchPlaceholder: "Караоке хайх...",
            searchAriaLabel: "Хайлт нээх",
            mapAriaLabel: "Газрын зураг нээх",
            account: "Бүртгэл",
            greeting: `Сайн уу, ${user?.firstName || "Хэрэглэгч"}`,
            logIn: "Нэвтрэх",
            signUp: "Бүртгүүлэх",
            adminDashboard: "Админ самбар",
            myBookings: "Миний захиалгууд",
            logOut: "Гарах",
            suggestions: "Санал болгох илэрц",
            noSuggestions: "Тохирох караоке олдсонгүй",
            showAllResults: `"${searchQuery.trim()}" бүх илэрцийг харах`,
          }
        : {
            searchPlaceholder: "Search karaokes...",
            searchAriaLabel: "Open search",
            mapAriaLabel: "Open map page",
            account: "Account",
            greeting: `Hi, ${user?.firstName || "User"}`,
            logIn: "Log in",
            signUp: "Sign up",
            adminDashboard: "Admin dashboard",
            myBookings: "My bookings",
            logOut: "Log out",
            suggestions: "Suggestions",
            noSuggestions: "No matching karaoke found",
            showAllResults: `Show all results for "${searchQuery.trim()}"`,
          },
    [language, searchQuery, user?.firstName]
  )

  const trimmedSearchQuery = searchQuery.trim()

  const suggestions = useMemo(() => {
    if (!trimmedSearchQuery) return []

    return searchListings
      .map((listing) => ({
        listing,
        score: getSuggestionScore(listing, trimmedSearchQuery),
      }))
      .filter((entry) => Number.isFinite(entry.score))
      .sort((left, right) => {
        if (left.score !== right.score) {
          return left.score - right.score
        }

        return left.listing.name.localeCompare(right.listing.name)
      })
      .slice(0, 5)
      .map((entry) => entry.listing)
  }, [searchListings, trimmedSearchQuery])

  const metadata = useMemo(() => {
    return (user?.publicMetadata as PublicMetadata | undefined) ?? {}
  }, [user])

  useEffect(() => {
    const fetchSearchListings = async () => {
      try {
        const response = await fetch(`${apiRootUrl}/karaoke`, {
          cache: "no-store",
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as {
          karaokes?: SearchListing[]
        }

        setSearchListings(Array.isArray(data.karaokes) ? data.karaokes : [])
      } catch {
        setSearchListings([])
      }
    }

    void fetchSearchListings()
  }, [])

  useEffect(() => {
    const syncProfile = async () => {
      if (!isAuthLoaded || !getToken) return

      if (!isSignedIn) {
        setProfileMetadata(null)
        setIsProfileResolved(true)
        return
      }

      try {
        const token = await getToken()

        if (!token) {
          setProfileMetadata(null)
          setIsProfileResolved(true)
          return
        }

        const res = await api.get<ProfileResponse>("/me/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setProfileMetadata({
          role: res.data?.profile?.role,
          ownerStatus: res.data?.profile?.ownerStatus ?? null,
        })
      } catch {
        setProfileMetadata(null)
      } finally {
        setIsProfileResolved(true)
      }
    }

    setIsProfileResolved(false)
    void syncProfile()
  }, [getToken, isAuthLoaded, isSignedIn, user?.id])

  const effectiveMetadata = profileMetadata ?? metadata

  const isApprovedOwner =
    effectiveMetadata.role === "karaoke_owner" &&
    effectiveMetadata.ownerStatus === "approved"

  const isAdmin =
    effectiveMetadata.role === "admin" ||
    effectiveMetadata.role === "karaoke_owner" ||
    isApprovedOwner
  const isRegularUser = isSignedIn && isProfileResolved && !isAdmin

  useEffect(() => {
    hasHydrated.current = true
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) return
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  useEffect(() => {
    if (!hasHydrated.current) return
    setSearchQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  const handleSearch = () => {
    const trimmed = trimmedSearchQuery
    const nextSearchParams = new URLSearchParams(searchParams.toString())

    if (trimmed) {
      nextSearchParams.set("q", trimmed)
    } else {
      nextSearchParams.delete("q")
    }

    const nextQuery = nextSearchParams.toString()
    const nextUrl = nextQuery ? `/?${nextQuery}` : "/"

    if (pathname === "/") {
      router.push(nextUrl)
    } else {
      router.push(nextUrl)
    }

    setSearchOpen(false)
  }

  const handleSuggestionSelect = (listing: SearchListing) => {
    setSearchOpen(false)
    setSearchQuery("")
    router.push(`/book/${listing._id}`)
  }

  return (
    <motion.nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Mic className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Karaoke<span className="text-primary">Now</span>
            </span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-2">
          <DropdownMenu open={searchOpen} onOpenChange={setSearchOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" className="rounded-xl" type="button">
                <Search className="h-5 w-5 text-foreground" aria-label={copy.searchAriaLabel} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="rounded-lg"
                  autoFocus
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="rounded-lg"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {trimmedSearchQuery ? (
                <div className="mt-3 space-y-2">
                  <p className="px-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {copy.suggestions}
                  </p>

                  {suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map((listing) => (
                        <button
                          key={listing._id}
                          type="button"
                          onClick={() => handleSuggestionSelect(listing)}
                          className="flex w-full items-start justify-between rounded-xl border border-transparent bg-background/70 px-3 py-2 text-left transition hover:border-primary/30 hover:bg-accent"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{listing.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {[listing.address, listing.city].filter(Boolean).join(", ")}
                            </p>
                          </div>
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-background/70 px-3 py-3 text-sm text-muted-foreground">
                      {copy.noSuggestions}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start rounded-xl px-3"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4" />
                    {copy.showAllResults}
                  </Button>
                </div>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="glass"
            className="rounded-xl px-3"
            type="button"
            onClick={toggleLanguage}
          >
            <Languages className="mr-2 h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">{language}</span>
          </Button>

          <Button asChild variant="glass" size="icon" className="rounded-xl">
            <Link href="/map" aria-label={copy.mapAriaLabel}>
              <MapPin className="h-5 w-5 text-foreground" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" className="rounded-xl" type="button">
                <User className="h-5 w-5 text-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 rounded-xl">
              <DropdownMenuLabel>
                {isSignedIn ? copy.greeting : copy.account}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {!isSignedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {copy.logIn}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/sign-up" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {copy.signUp}
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : isAdmin ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {copy.adminDashboard}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <SignOutButton redirectUrl="/">
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      {copy.logOut}
                    </DropdownMenuItem>
                  </SignOutButton>
                </>
              ) : isRegularUser ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {copy.myBookings}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <SignOutButton redirectUrl="/">
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      {copy.logOut}
                    </DropdownMenuItem>
                  </SignOutButton>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="glass"
            size="icon"
            className="rounded-xl"
            onClick={() => setDark((prev) => !prev)}
            type="button"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={dark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {dark ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}

function NavbarWithClerk() {
  const { user, isSignedIn } = useUser()
  const { getToken, isLoaded } = useAuth()

  return (
    <NavbarContent
      getToken={getToken}
      isAuthLoaded={Boolean(isLoaded)}
      isSignedIn={Boolean(isSignedIn)}
      user={user}
    />
  )
}

function NavbarWithoutClerk() {
  return <NavbarContent isAuthLoaded={true} isSignedIn={false} user={null} />
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="fixed left-0 right-0 top-0 z-50 h-[88px]" />}>
      <NavbarInner />
    </Suspense>
  )
}

function NavbarInner() {
  if (!clerkEnabled) {
    return <NavbarWithoutClerk />
  }

  return <NavbarWithClerk />
}
