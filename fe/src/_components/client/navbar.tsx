"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sun,
  Moon,
  Mic,
  LayoutDashboard,
  Store,
  LogIn,
  UserPlus,
  MapPin,
  User,
  BookOpen,
  LogOut,
  BadgeCheck,
} from "lucide-react"
import { SignOutButton, useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type PublicMetadata = {
  role?: "customer" | "karaoke_owner"
  ownerStatus?: "pending" | "approved" | null
}

const THEME_CHANGE_EVENT = "karaoke-theme-change"

const getThemePreference = () => {
  if (typeof window === "undefined") {
    return false
  }

  const savedTheme = window.localStorage.getItem("theme")

  if (savedTheme === "dark") {
    return true
  }

  if (savedTheme === "light") {
    return false
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

const subscribeToTheme = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const handleChange = () => onStoreChange()

  window.addEventListener("storage", handleChange)
  window.addEventListener(THEME_CHANGE_EVENT, handleChange)
  mediaQuery.addEventListener("change", handleChange)

  return () => {
    window.removeEventListener("storage", handleChange)
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange)
    mediaQuery.removeEventListener("change", handleChange)
  }
}

export default function Navbar() {
  const { user, isSignedIn } = useUser()

  const [scrolled, setScrolled] = useState(false)
  const dark = useSyncExternalStore(subscribeToTheme, getThemePreference, () => false)

  const metadata = useMemo(() => {
    return (user?.publicMetadata as PublicMetadata | undefined) ?? {}
  }, [user])

  const isApprovedOwner =
    metadata.role === "karaoke_owner" && metadata.ownerStatus === "approved"

  const isPendingOwner =
    metadata.role === "karaoke_owner" && metadata.ownerStatus === "pending"

  const adminHref = isSignedIn
    ? "/admin"
    : "/sign-in?role=admin&redirect_url=/admin"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  const toggleTheme = () => {
    const nextDark = !dark
    document.documentElement.classList.toggle("dark", nextDark)
    window.localStorage.setItem("theme", nextDark ? "dark" : "light")
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
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
        
        {/* Logo */}
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

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Location button */}
          <Button asChild variant="glass" size="icon" className="rounded-xl">
            <Link href="/map" aria-label="Open map page">
              <MapPin className="h-5 w-5 text-foreground" />
            </Link>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" className="rounded-xl" type="button">
                <User className="h-5 w-5 text-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>
                {isSignedIn ? `Hi, ${user?.firstName || "User"}` : "Account"}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* 🔓 SIGNED OUT */}
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

                  <DropdownMenuItem asChild>
                    <Link
                      href="/register-karaoke"
                      className="flex items-center gap-2"
                    >
                      <Store className="h-4 w-4" />
                      Register karaoke
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={adminHref} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : isApprovedOwner ? (
                /* 🏢 APPROVED OWNER */
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href={adminHref}
                      className="flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/my-bookings"
                      className="flex items-center gap-2"
                    >
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
              ) : (
                /* 👤 CUSTOMER (or pending owner) */
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      My bookings
                    </Link>
                  </DropdownMenuItem>

                  {isPendingOwner && (
                    <DropdownMenuItem disabled className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4" />
                      Approval pending
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link
                      href="/register-karaoke"
                      className="flex items-center gap-2"
                    >
                      <Store className="h-4 w-4" />
                      Register karaoke
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={adminHref} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>

                  <SignOutButton redirectUrl="/">
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </SignOutButton>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="glass"
            size="icon"
            className="rounded-xl"
            onClick={toggleTheme}
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
