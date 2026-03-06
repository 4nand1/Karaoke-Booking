"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Users, Sun, Moon, Mic } from "lucide-react"
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
export default function Navbar() {
const [theme, setTheme] = useState<"light" | "dark">("light")
const [query, setQuery] = useState("")
function toggleTheme() {
const next = theme === "dark" ? "light" : "dark"
setTheme(next)
document.documentElement.classList.toggle("dark", next === "dark")
}
function handleSearch(e: React.FormEvent) {
e.preventDefault()
console.log("Search:", query)
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
<DropdownMenuContent align="end">
<DropdownMenuLabel>Account</DropdownMenuLabel>
<DropdownMenuSeparator />
<DropdownMenuItem>Login</DropdownMenuItem>
<DropdownMenuItem>Sign up</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
<Button
variant="ghost"
size="icon"
onClick={toggleTheme}
>
{theme === "dark"
? <Sun className="h-5 w-5" />
: <Moon className="h-5 w-5" />}
</Button>
</div>
</div>
</header>
)
}