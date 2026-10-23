"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { useLanguage } from "@/lib/language"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useLanguage()
  return (
    <main id="main" className="wrap grid min-h-svh place-items-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("Something went wrong", "Алдаа гарлаа")}</EmptyTitle>
          <EmptyDescription>{t("Please try again in a moment.", "Түр хүлээгээд дахин оролдоно уу.")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button onClick={reset}>{t("Try again", "Дахин оролдох")}</Button>
          <Button variant="outline" asChild>
            <Link href="/">{t("Home", "Нүүр")}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
