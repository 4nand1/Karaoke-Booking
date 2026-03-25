"use client"

import { useId, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { imageFilesToDataUrls } from "@/lib/image-upload"

type ImageUploadFieldProps = {
  label: string
  value: string[]
  onChange: (images: string[]) => void
  multiple?: boolean
  required?: boolean
  helperText?: string
  theme?: "dark" | "light"
  maxFiles?: number
}

export function ImageUploadField({
  label,
  value,
  onChange,
  multiple = false,
  required = false,
  helperText,
  theme = "light",
  maxFiles = multiple ? 6 : 1,
}: ImageUploadFieldProps) {
  const inputId = useId()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const tone =
    theme === "dark"
      ? {
          label: "mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40",
          picker:
            "flex min-h-28 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-5 text-center text-sm text-white/60 transition-all hover:border-purple-500/50 hover:text-white",
          hint: "mt-2 text-xs text-white/35",
          previewWrap: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3",
          previewCard: "relative overflow-hidden rounded-2xl border border-white/10 bg-black/30",
          remove:
            "absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white/80 transition hover:bg-red-500 hover:text-white",
          error: "mt-2 text-xs text-red-400",
        }
      : {
          label: "mb-2 block text-sm font-medium text-foreground",
          picker:
            "flex min-h-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground",
          hint: "mt-2 text-xs text-muted-foreground",
          previewWrap: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3",
          previewCard: "relative overflow-hidden rounded-lg border border-border bg-background",
          remove:
            "absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-red-500",
          error: "mt-2 text-xs text-red-500",
        }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    setProcessing(true)
    setError("")

    try {
      const nextFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      )

      if (!nextFiles.length) {
        throw new Error("Please choose an image file.")
      }

      const uploadedImages = await imageFilesToDataUrls(nextFiles)
      const nextImages = multiple
        ? [...value, ...uploadedImages].slice(0, maxFiles)
        : uploadedImages.slice(0, 1)

      onChange(nextImages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image.")
    } finally {
      setProcessing(false)
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index))
  }

  return (
    <div>
      <label htmlFor={inputId} className={tone.label}>
        {label}
      </label>

      <label htmlFor={inputId} className={tone.picker}>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple={multiple}
          required={required && value.length === 0}
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.currentTarget.value = ""
          }}
        />

        <div className="flex flex-col items-center gap-2">
          {processing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span>
            {processing
              ? "Processing image..."
              : multiple
                ? "Choose image files"
                : "Choose an image file"}
          </span>
        </div>
      </label>

      <p className={tone.hint}>
        {helperText ||
          (multiple
            ? `You can add up to ${maxFiles} images.`
            : "Pick one image from your device.")}
      </p>

      {error ? <p className={tone.error}>{error}</p> : null}

      {value.length > 0 ? (
        <div className={tone.previewWrap}>
          {value.map((image, index) => (
            <div key={`${image.slice(0, 24)}-${index}`} className={tone.previewCard}>
              <img
                src={image}
                alt={`${label} preview ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className={tone.remove}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
