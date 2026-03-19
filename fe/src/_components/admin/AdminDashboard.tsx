"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Search,
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react"

type BookingRecord = {
  id: string
  customer: string
  location: string
  room: string
  date: string
  time: string
  amount: number
}

const bookings: BookingRecord[] = []

const totalRevenue = bookings.reduce((s, b) => s + b.amount, 0)
const avgValue = bookings.length ? Math.round(totalRevenue / bookings.length) : 0

const stats = [
  {
    label: "Total Bookings",
    value: bookings.length.toString(),
    icon: CalendarDays,
    corner: Calendar,
    iconColor: "text-purple-400",
    cornerColor: "text-purple-500/40",
    glow: "group-hover:shadow-purple-500/20",
    bar: "from-purple-500 to-purple-700",
  },
  {
    label: "Total Revenue",
    value: `${totalRevenue}`,
    icon: DollarSign,
    corner: TrendingUp,
    iconColor: "text-emerald-400",
    cornerColor: "text-emerald-500/40",
    glow: "group-hover:shadow-emerald-500/20",
    bar: "from-emerald-500 to-emerald-700",
  },
  {
    label: "Avg Booking Value",
    value: `${avgValue}`,
    icon: Users,
    corner: Calendar,
    iconColor: "text-cyan-400",
    cornerColor: "text-cyan-500/40",
    glow: "group-hover:shadow-cyan-500/20",
    bar: "from-cyan-500 to-cyan-700",
  },
]

export default function AdminDashboard() {
  const [search, setSearch] = useState("")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const filtered = bookings.filter(
    (b) =>
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen space-y-8 bg-[#0a0814] p-4 sm:p-6 lg:p-8">
      <h1 className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
        Owner Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          const Corner = stat.corner
          return (
            <div
              key={i}
              className={`group relative cursor-default overflow-hidden rounded-2xl border border-[#2a2545] bg-[#13112a] p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#3a3060] hover:shadow-2xl ${stat.glow} sm:p-6`}
            >
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 bg-gradient-to-r ${stat.bar} origin-left transition-transform duration-500 group-hover:scale-x-100`}
              />
              <div
                className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-r ${stat.bar} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`}
              />

              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1a3a] transition-transform duration-300 group-hover:scale-110">
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <Corner
                  className={`h-5 w-5 ${stat.cornerColor} transition-all duration-300 group-hover:opacity-70`}
                />
              </div>

              <p className="mb-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className={`text-sm font-medium ${stat.iconColor}`}>
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search by customer or booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-xl border-[#2a2545] bg-[#13112a] pl-9 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-purple-500/20"
        />
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[#2a2545] bg-[#13112a] md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2545] hover:bg-transparent">
              {["Booking ID", "Customer", "Location", "Room", "Date", "Time", "Amount", "Actions"].map((h) => (
                <TableHead key={h} className="text-sm font-semibold text-white">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((booking) => (
              <TableRow
                key={booking.id}
                onMouseEnter={() => setHoveredRow(booking.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="cursor-default border-[#2a2545] transition-all duration-200 hover:bg-[#1e1a3a]"
              >
                <TableCell>
                  <span
                    className={`text-sm font-bold transition-colors duration-200 ${
                      hoveredRow === booking.id ? "text-purple-400" : "text-white"
                    }`}
                  >
                    {booking.id}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-300">
                  {booking.customer}
                </TableCell>
                <TableCell className="text-sm text-slate-300">
                  {booking.location}
                </TableCell>
                <TableCell className="text-sm text-slate-300">
                  {booking.room}
                </TableCell>
                <TableCell className="text-sm text-slate-300">
                  {booking.date}
                </TableCell>
                <TableCell className="text-sm text-slate-300">
                  {booking.time}
                </TableCell>
                <TableCell className="text-sm font-semibold text-emerald-400">
                  {booking.amount}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#3a3060] bg-transparent text-xs text-slate-300 hover:border-purple-500/50 hover:bg-purple-500/15 hover:text-purple-400"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No bookings found.
        </p>
      ) : null}
    </div>
  )
}