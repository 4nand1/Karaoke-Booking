"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export default dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-xl" />,
})
