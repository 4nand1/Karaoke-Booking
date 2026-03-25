"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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

export default function Navbar() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { getToken, isLoaded } = useAuth()

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false

    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "dark") return true
    if (savedTheme === "light") return false

    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })
  const [scrolled, setScrolled] = useState(false)
  const [language, setLanguage] = useState<"EN" | "MN">(() => {
    if (typeof window === "undefined") return "EN"

    const savedLanguage = localStorage.getItem("language")
    return savedLanguage === "MN" ? "MN" : "EN"
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [profileMetadata, setProfileMetadata] = useState<PublicMetadata | null>(null)
  const hasHydrated = useRef(false)

  const metadata = useMemo(() => {
    return (user?.publicMetadata as PublicMetadata | undefined) ?? {}
  }, [user])

  useEffect(() => {
    const syncProfile = async () => {
      if (!isLoaded) return

      if (!isSignedIn) {
        setProfileMetadata(null)
        return
      }

      try {
        const token = await getToken()

        if (!token) {
          setProfileMetadata(null)
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
      }
    }

    void syncProfile()
  }, [getToken, isLoaded, isSignedIn, user?.id])

  const effectiveMetadata = profileMetadata ?? metadata

  const isApprovedOwner =
    effectiveMetadata.role === "karaoke_owner" &&
    effectiveMetadata.ownerStatus === "approved"

  const isAdmin =
    effectiveMetadata.role === "admin" ||
    effectiveMetadata.role === "karaoke_owner" ||
    isApprovedOwner
  const isRegularUser = isSignedIn && !isAdmin

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
    localStorage.setItem("language", language)
  }, [language])

  const handleSearch = () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    setSearchQuery("")
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" className="rounded-xl" type="button">
                <Search className="h-5 w-5 text-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search karaokes..."
                  className="rounded-lg"
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
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="glass"
            className="rounded-xl px-3"
            type="button"
            onClick={() => setLanguage((prev) => (prev === "EN" ? "MN" : "EN"))}
          >
            <Languages className="mr-2 h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">{language}</span>
          </Button>

          <Button asChild variant="glass" size="icon" className="rounded-xl">
            <Link href="/map" aria-label="Open map page">
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
                {isSignedIn ? `Hi, ${user?.firstName || "User"}` : "Account"}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {!isSignedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/sign-up" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : isAdmin ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <SignOutButton redirectUrl="/">
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </SignOutButton>
                </>
              ) : isRegularUser ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      My bookings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <SignOutButton redirectUrl="/">
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Log out
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
