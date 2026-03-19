"use client"

import Link from "next/link"
import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Sun,
  Moon,
  Mic,
  LayoutDashboard,
  Store,
  Users,
  LogIn,
  UserPlus,
} from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type PublicMetadata = {
  role?: "user" | "admin"
}

export default function Navbar() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const [query, setQuery] = useState("")
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const role = useMemo(() => {
    if (!user) return undefined
    return (user.publicMetadata as PublicMetadata)?.role
  }, [user])

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="flex h-14 items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Mic className="h-6 w-6" />
          <span className="text-lg font-semibold">KaraokeNow</span>
        </Link>

        <div className="flex items-center gap-2">

          {/* Search */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <form onSubmit={handleSearch} className="flex gap-2 p-2">
                <Input
                  placeholder="Search karaoke..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit">Go</Button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {isSignedIn
                  ? `Hi, ${user?.firstName || "User"}`
                  : "Continue as Guest"}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {!isSignedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/sign-up" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      User signup
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
              ) : (
                <>
                  {role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2"
                      >
                        <Store className="h-4 w-4" />
                        Admin dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <div className="px-2 py-2">
                    <UserButton />
                  </div>
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
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}