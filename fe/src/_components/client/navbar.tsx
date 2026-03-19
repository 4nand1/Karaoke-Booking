"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
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

export default function Navbar() {
  const { user, isSignedIn } = useUser()

  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const metadata = useMemo(() => {
    return (user?.publicMetadata as PublicMetadata | undefined) ?? {}
  }, [user])

  const isApprovedOwner =
    metadata.role === "karaoke_owner" && metadata.ownerStatus === "approved"

  const isPendingOwner =
    metadata.role === "karaoke_owner" && metadata.ownerStatus === "pending"

  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "dark") {
      setDark(true)
      document.documentElement.classList.add("dark")
    } else if (savedTheme === "light") {
      setDark(false)
      document.documentElement.classList.remove("dark")
    } else {
      const systemPrefersDark =
        window.matchMedia("(prefers-color-scheme: dark)").matches
      setDark(systemPrefersDark)
      document.documentElement.classList.toggle("dark", systemPrefersDark)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!mounted) return

    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark, mounted])

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
          <Button variant="glass" size="icon" className="rounded-xl" type="button">
            <MapPin className="h-5 w-5 text-foreground" />
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
                </>
              ) : isApprovedOwner ? (
                /* 🏢 APPROVED OWNER */
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/dashboard?tab=listings"
                      className="flex items-center gap-2"
                    >
                      <Store className="h-4 w-4" />
                      My karaoke listings
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

                  <SignOutButton redirectUrl="/">
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </SignOutButton>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/register-karaoke"
                      className="flex items-center gap-2"
                    >
                      <Store className="h-4 w-4" />
                      Register karaoke
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
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