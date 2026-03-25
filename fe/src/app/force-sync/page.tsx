"use client"

import { redirect } from "next/navigation"

export default function ForceSyncPage() {
  // Энэ page ашиглахгүй болсон
  redirect("/admin")
}
