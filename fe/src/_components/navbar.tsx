"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Users,
  Sun,
  Moon,
  Mic,
  LayoutDashboard,
  LogOut,
  UserPlus,
  LogIn,
} from "lucide-react"

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

import type { AuthUser } from "@/types/auth"
import { getStoredUser, logoutUser } from "@/lib/auth"

export default function Navbar() {
  const router = useRouter()

  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [query, setQuery] = useState("")
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const currentTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
    setTheme(currentTheme)

    const loadUser = () => {
      const currentUser = getStoredUser()
      setUser(currentUser)
    }

    loadUser()

    window.addEventListener("auth-changed", loadUser)
    window.addEventListener("storage", loadUser)

    return () => {
      window.removeEventListener("auth-changed", loadUser)
      window.removeEventListener("storage", loadUser)
    }
  }, [])

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
  }

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!query.trim()) return

    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  function handleLogout() {
    logoutUser()
    setUser(null)
    router.push("/login")
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Mic className="h-6 w-6" />
          <span className="text-lg font-semibold">KaraokeNow</span>
        </Link>

        <div className="flex items-center gap-2">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {mounted && user ? `Hi, ${user.name}` : "Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {!mounted ? null : user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/signup" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
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