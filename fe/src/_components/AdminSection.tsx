"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays, DollarSign, Users, TrendingUp, Calendar } from "lucide-react";

const bookings = [
  { id: "BK-001", customer: "John Doe",      location: "Purple Haze Karaoke", room: "VIP Room",    date: "2026-03-05", time: "7:00 PM", amount: 85 },
  { id: "BK-002", customer: "Jane Smith",     location: "Neon Dreams Studio",  room: "Medium Room", date: "2026-03-05", time: "3:00 PM", amount: 45 },
  { id: "BK-003", customer: "Mike Johnson",   location: "Star Light Karaoke",  room: "Small Room",  date: "2026-03-06", time: "5:00 PM", amount: 25 },
  { id: "BK-004", customer: "Sarah Williams", location: "Echo Chamber",        room: "VIP Room",    date: "2026-03-06", time: "8:00 PM", amount: 85 },
  { id: "BK-005", customer: "Tom Brown",      location: "Purple Haze Karaoke", room: "Medium Room", date: "2026-03-07", time: "6:00 PM", amount: 45 },
];



const totalRevenue = bookings.reduce((s, b) => s + b.amount, 0);
const avgValue = Math.round(totalRevenue / bookings.length);

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
    value: `$${totalRevenue}`,
    icon: DollarSign,
    corner: TrendingUp,
    iconColor: "text-emerald-400",
    cornerColor: "text-emerald-500/40",
    glow: "group-hover:shadow-emerald-500/20",
    bar: "from-emerald-500 to-emerald-700",
  },
  {
    label: "Avg Booking Value",
    value: `$${avgValue}`,
    icon: Users,
    corner: Calendar,
    iconColor: "text-cyan-400",
    cornerColor: "text-cyan-500/40",
    glow: "group-hover:shadow-cyan-500/20",
    bar: "from-cyan-500 to-cyan-700",
  },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = bookings.filter(
    (b) =>
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
  );

  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0814] p-4 sm:p-6 lg:p-8 space-y-8">

      
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
        Admin Dashboard
      </h1>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const Corner = stat.corner;
          return (
            <div
              key={i}
              className={`group relative rounded-2xl border border-[#2a2545] bg-[#13112a] p-5 sm:p-6
                overflow-hidden cursor-default
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:border-[#3a3060]
                hover:shadow-2xl ${stat.glow}`}
            >
             
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.bar}
                scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />

              
              <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0
                group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${stat.bar}`} />

              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-[#1e1a3a] flex items-center justify-center
                  transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <Corner className={`w-5 h-5 ${stat.cornerColor} transition-all duration-300 group-hover:opacity-70`} />
              </div>

             
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight">
                {stat.value}
              </p>

             
              <p className={`text-sm ${stat.iconColor} font-medium`}>{stat.label}</p>

            
            </div>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        <Input
          placeholder="Search by customer or booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#13112a] border-[#2a2545] text-white placeholder:text-slate-600
            focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-200 rounded-xl h-11"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-[#2a2545] bg-[#13112a] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2545] hover:bg-transparent">
              {["Booking ID","Customer","Location","Room","Date","Time","Amount","Actions"].map((h) => (
                <TableHead key={h} className="text-white font-semibold text-sm">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => (
              <TableRow
                key={booking.id}
                onMouseEnter={() => setHoveredRow(booking.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="border-[#2a2545] hover:bg-[#1e1a3a] transition-all duration-200 cursor-default"
              >
                <TableCell>
                  <span className={`font-bold text-sm transition-colors duration-200 ${
                    hoveredRow === booking.id ? "text-purple-400" : "text-white"
                  }`}>{booking.id}</span>
                </TableCell>
                <TableCell className="text-slate-300 text-sm">{booking.customer}</TableCell>
                <TableCell className="text-slate-300 text-sm">{booking.location}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    booking.room === "VIP Room"
                      ? "bg-purple-500/15 text-purple-400"
                      : booking.room === "Medium Room"
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "bg-slate-500/15 text-slate-400"
                  }`}>
                    {booking.room}
                  </span>
                </TableCell>
                <TableCell className="text-slate-300 text-sm">{booking.date}</TableCell>
                <TableCell className="text-slate-300 text-sm">{booking.time}</TableCell>
                <TableCell className="text-emerald-400 font-semibold text-sm">${booking.amount}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#3a3060] bg-transparent text-slate-300
                      hover:bg-purple-500/15 hover:text-purple-400 hover:border-purple-500/50
                      transition-all duration-200 text-xs"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8 text-sm">No bookings found.</p>
        )}
        {filtered.map((booking) => (
          <div
            key={booking.id}
            className="rounded-2xl border border-[#2a2545] bg-[#13112a] p-4 space-y-3
              hover:border-[#3a3060] hover:bg-[#1a1730] transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-400 text-sm">{booking.id}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#3a3060] bg-transparent text-slate-300
                  hover:bg-purple-500/15 hover:text-purple-400 hover:border-purple-500/50
                  transition-all duration-200 h-7 text-xs"
              >
                View
              </Button>
            </div>

            <p className="text-white font-medium">{booking.customer}</p>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <p className="text-slate-500 mb-0.5">Location</p>
                <p className="text-slate-300">{booking.location}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Room</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  booking.room === "VIP Room"
                    ? "bg-purple-500/15 text-purple-400"
                    : booking.room === "Medium Room"
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "bg-slate-500/15 text-slate-400"
                }`}>
                  {booking.room}
                </span>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Date</p>
                <p className="text-slate-300">{booking.date}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Time</p>
                <p className="text-slate-300">{booking.time}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2a2545] flex items-center justify-between">
              <span className="text-slate-500 text-xs">Amount</span>
              <span className="text-emerald-400 font-bold">${booking.amount}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="hidden md:block text-center text-slate-500 py-8 text-sm">No bookings found.</p>
      )}
    </div>
  );
}