import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

type ProfileResponse = {
  profile?: {
    fullName?: string
    email?: string
    role?: string
  }
}

async function getProfile() {
  const { userId, getToken } = await auth()

  if (!userId) redirect("/sign-in")

  const token = await getToken()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) return null

  return (await res.json()) as ProfileResponse
}

export default async function ProfilePage() {
  const data = await getProfile()
  
  const role = data?.profile?.role || "customer"
  const isKaraokeOwner = role === "karaoke_owner"

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="rounded-2xl border border-border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Миний Профайл</h1>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border/50 bg-background/50 p-4">
            <h2 className="font-semibold text-foreground">Ерөнхий мэдээлэл</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Нэр:</span>
                <span className="font-medium">{data?.profile?.fullName || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Имэйл:</span>
                <span className="font-medium">{data?.profile?.email || "-"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/50 p-4">
            <h2 className="font-semibold text-foreground">Хэрэглэгчийн төрөл</h2>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Статус:</span>
                <div className="flex items-center gap-2">
                  {isKaraokeOwner ? (
                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-600">
                      🎤 Караоке Эзэмшигч
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-600">
                      👤 Энгийн хэрэглэгч
                    </span>
                  )}
                </div>
              </div>

              {isKaraokeOwner && (
                <div className="mt-4 rounded-lg bg-purple-500/5 border border-purple-500/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    ✨ Та админ эрхтэй байна. Navbar дээр "Admin" товчийг дарж админ page руу орно уу.
                  </p>
                </div>
              )}

              {!isKaraokeOwner && (
                <div className="mt-4 rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    Та өөрийн караокеээ бүртгүүлэхээр сонирхож байвал "Караоке бүртгэх" товчийг дарна уу.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}