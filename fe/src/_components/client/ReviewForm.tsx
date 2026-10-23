"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Star, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"
import { cn } from "@/lib/utils"

type Review = { _id: string; name: string; rating: number; text: string; userId?: string; createdAt: string }

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-4", i <= value ? "fill-primary text-primary" : "text-muted-foreground/40")} />
      ))}
    </span>
  )
}

export default function ReviewForm({ karaokeId }: { karaokeId: string }) {
  const { t, language } = useLanguage()
  const { isSignedIn, user } = useUser()
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/reviews", { params: { karaokeId } })
      setReviews(Array.isArray(data?.data) ? data.data : [])
    } catch {
      setReviews([])
    }
  }, [karaokeId])

  useEffect(() => {
     
    void load()
  }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim().length < 10) {
      setError(t("Write at least 10 characters", "Дор хаяж 10 тэмдэгт бичнэ үү"))
      return
    }
    setError("")
    setBusy(true)
    try {
      const { data } = await api.post("/reviews", { karaokeId, rating, text: text.trim() })
      setReviews((prev) => [data.data as Review, ...(prev ?? [])])
      setText("")
      toast.success(t("Thanks for your review", "Сэтгэгдэл үлдээсэнд баярлалаа"))
    } catch (err) {
      toast.error(apiError(err, t("Couldn't post the review", "Сэтгэгдэл нийтэлж чадсангүй")))
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/reviews/${id}`)
      setReviews((prev) => (prev ?? []).filter((r) => r._id !== id))
    } catch (err) {
      toast.error(apiError(err, t("Couldn't delete the review", "Устгаж чадсангүй")))
    }
  }

  const average = reviews?.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <section className="wrap py-12">
      <h2 className="font-display text-2xl font-semibold">{t("Reviews", "Сэтгэгдэл")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {reviews === null
          ? " "
          : average
            ? t(`★ ${average} · ${reviews.length} reviews`, `★ ${average} · ${reviews.length} сэтгэгдэл`)
            : t("No reviews yet", "Одоогоор сэтгэгдэл алга")}
      </p>

      {isSignedIn ? (
        <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex gap-1" role="group" aria-label={t("Rating", "Үнэлгээ")}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={t(`Rate ${i} of 5`, `${i} од`)}
                aria-pressed={rating === i}
                onClick={() => setRating(i)}
                className="rounded p-0.5"
              >
                <Star className={cn("size-6", i <= rating ? "fill-primary text-primary" : "text-muted-foreground/40")} />
              </button>
            ))}
          </div>
          <Textarea
            value={text}
            maxLength={500}
            aria-invalid={!!error}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("How were the room, sound and service?", "Өрөө, дуу чимээ, үйлчилгээ ямар байсан бэ?")}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy}>
            {t("Post review", "Нийтлэх")}
          </Button>
        </form>
      ) : (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{t("Sign in to leave a review", "Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү")}</p>
          <Button asChild size="sm">
            <Link href={`/sign-in?redirect_url=/book/${karaokeId}`}>{t("Log in", "Нэвтрэх")}</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {reviews === null && Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        {reviews?.map((r) => (
          <article key={r._id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted font-semibold">
                {r.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString(language === "MN" ? "mn-MN" : "en-US")}
                </p>
              </div>
              <Stars value={r.rating} />
              {user?.id && r.userId === user.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={t("Delete review", "Устгах")}>
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("Delete this review?", "Сэтгэгдлийг устгах уу?")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("This can't be undone.", "Үүнийг буцааж болохгүй.")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("Cancel", "Болих")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void remove(r._id)}>{t("Delete", "Устгах")}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <p className="mt-3 text-sm">{r.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
