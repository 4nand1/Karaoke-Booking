"use client";

import { useState } from "react";
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
import { Search } from "lucide-react";

const bookings = [
  { id: "BK-001", customer: "John Doe",      location: "Purple Haze Karaoke", room: "VIP Room",    date: "2026-03-05", time: "7:00 PM", amount: 85 },
  { id: "BK-002", customer: "Jane Smith",     location: "Neon Dreams Studio",  room: "Medium Room", date: "2026-03-05", time: "3:00 PM", amount: 45 },
  { id: "BK-003", customer: "Mike Johnson",   location: "Star Light Karaoke",  room: "Small Room",  date: "2026-03-06", time: "5:00 PM", amount: 25 },
  { id: "BK-004", customer: "Sarah Williams", location: "Echo Chamber",        room: "VIP Room",    date: "2026-03-06", time: "8:00 PM", amount: 85 },
  { id: "BK-005", customer: "Tom Brown",      location: "Purple Haze Karaoke", room: "Medium Room", date: "2026-03-07", time: "6:00 PM", amount: 45 },
];

export default function BookingsTable() {
  const [search, setSearch] = useState("");

  const filtered = bookings.filter(
    (b) =>
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-3 sm:p-6 bg-[#0f0d1f] min-h-screen">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by customer or booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#1a1730] border-[#2a2545] text-white placeholder:text-muted-foreground"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-[#2a2545] bg-[#13112a] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2545] hover:bg-transparent">
              <TableHead className="text-white font-semibold">Booking ID</TableHead>
              <TableHead className="text-white font-semibold">Customer</TableHead>
              <TableHead className="text-white font-semibold">Location</TableHead>
              <TableHead className="text-white font-semibold">Room</TableHead>
              <TableHead className="text-white font-semibold">Date</TableHead>
              <TableHead className="text-white font-semibold">Time</TableHead>
              <TableHead className="text-white font-semibold">Amount</TableHead>
              <TableHead className="text-white font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => (
              <TableRow
                key={booking.id}
                className="border-[#2a2545] hover:bg-[#1e1a3a] transition-colors"
              >
                <TableCell className="font-bold text-white">{booking.id}</TableCell>
                <TableCell className="text-slate-300">{booking.customer}</TableCell>
                <TableCell className="text-slate-300">{booking.location}</TableCell>
                <TableCell className="text-slate-300">{booking.room}</TableCell>
                <TableCell className="text-slate-300">{booking.date}</TableCell>
                <TableCell className="text-slate-300">{booking.time}</TableCell>
                <TableCell className="text-slate-300">${booking.amount}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#3a3060] bg-transparent text-slate-300 hover:bg-[#2a2550] hover:text-white transition-colors"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8">No bookings found.</p>
        )}
        {filtered.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-[#2a2545] bg-[#13112a] p-4 space-y-3"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{booking.id}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#3a3060] bg-transparent text-slate-300 hover:bg-[#2a2550] hover:text-white transition-colors h-7 text-xs"
              >
                View
              </Button>
            </div>

            {/* Customer */}
            <p className="text-white font-medium">{booking.customer}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <p className="text-slate-500 mb-0.5">Location</p>
                <p className="text-slate-300">{booking.location}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Room</p>
                <p className="text-slate-300">{booking.room}</p>
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

            {/* Amount */}
            <div className="pt-1 border-t border-[#2a2545] flex items-center justify-between">
              <span className="text-slate-500 text-xs">Amount</span>
              <span className="text-white font-semibold">${booking.amount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state (desktop) */}
      {filtered.length === 0 && (
        <p className="hidden md:block text-center text-slate-500 py-8">No bookings found.</p>
      )}
    </div>
  );
}