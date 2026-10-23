"use client"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language"
import { cn } from "@/lib/utils"

const ORDER: Record<string, [string, [string, string]]> = {
  pending: ["bg-warning/15 text-warning", ["Pending", "Хүлээгдэж буй"]],
  confirmed: ["bg-live/15 text-live", ["Confirmed", "Баталгаажсан"]],
  cancelled: ["bg-muted text-muted-foreground", ["Cancelled", "Цуцлагдсан"]],
}

const PAYMENT: Record<string, [string, [string, string]]> = {
  paid: ["bg-live/15 text-live", ["Paid", "Төлөгдсөн"]],
  unpaid: ["border-border text-muted-foreground", ["Unpaid", "Төлөгдөөгүй"]],
  refunded: ["bg-muted text-muted-foreground", ["Refunded", "Буцаагдсан"]],
}

function Pill({ map, status }: { map: typeof ORDER; status?: string }) {
  const { t } = useLanguage()
  const [classes, label] = map[status ?? ""] ?? ["bg-muted text-muted-foreground", [status ?? "", status ?? ""]]
  return <Badge className={cn("rounded-full", classes)}>{t(...label)}</Badge>
}

export const StatusBadge = ({ status }: { status?: string }) => <Pill map={ORDER} status={status} />
export const PaymentBadge = ({ status }: { status?: string }) => <Pill map={PAYMENT} status={status} />
