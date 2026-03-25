export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Failed to read image file"))
    }

    reader.onerror = () => reject(new Error("Failed to read image file"))
    reader.readAsDataURL(file)
  })
}

async function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load image preview"))
    image.src = dataUrl
  })
}

export async function optimizeImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
) {
  const dataUrl = await fileToDataUrl(file)

  if (typeof document === "undefined") {
    return dataUrl
  }

  const image = await loadImage(dataUrl)
  const largestSide = Math.max(image.width, image.height)

  if (largestSide <= maxDimension) {
    return dataUrl
  }

  const scale = maxDimension / largestSide
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)

  const context = canvas.getContext("2d")

  if (!context) {
    return dataUrl
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"
  return canvas.toDataURL(outputType, quality)
}

export async function imageFilesToDataUrls(files: File[]) {
  return Promise.all(files.map((file) => optimizeImageFile(file)))
}
