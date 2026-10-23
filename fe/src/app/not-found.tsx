"use client"

import Link from "next/link"
import Navbar from "@/_components/client/navbar"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { useLanguage } from "@/lib/language"

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <>
      <Navbar />
      <main id="main" className="wrap grid min-h-[70svh] place-items-center pt-16">
        <Empty>
          <EmptyHeader>
            <p className="font-display text-7xl font-semibold text-primary">404</p>
            <EmptyTitle>{t("This page left the stage", "Энэ хуудас олдсонгүй")}</EmptyTitle>
            <EmptyDescription>
              {t("The link may be broken or the venue was removed.", "Холбоос буруу эсвэл караоке устгагдсан байж магадгүй.")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">{t("Back to venues", "Нүүр хуудас руу")}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    </>
  )
}
