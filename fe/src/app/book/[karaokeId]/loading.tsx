import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="pt-16">
      <div className="wrap pt-4">
        <Skeleton className="aspect-[16/9] rounded-2xl md:aspect-[21/9]" />
        <Skeleton className="mt-6 h-8 w-1/2" />
        <Skeleton className="mt-6 h-40 rounded-2xl" />
        <Skeleton className="mt-6 h-40 rounded-2xl" />
      </div>
    </div>
  )
}
