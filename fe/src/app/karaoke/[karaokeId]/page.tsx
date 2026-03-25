import { redirect } from "next/navigation"

export default async function KaraokePage({
  params,
}: {
  params: Promise<{ karaokeId: string }>
}) {
  const { karaokeId } = await params

  redirect(`/book/${karaokeId}`)
}
