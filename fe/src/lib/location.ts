export function formatDisplayLocation(address?: string | null, city?: string | null) {
  const normalizedAddress = address?.trim() ?? ""
  const normalizedCity = city?.trim() ?? ""

  if (!normalizedCity) return normalizedAddress

  if (normalizedCity.toLowerCase() === "ulaanbaatar") {
    return normalizedAddress
  }

  if (!normalizedAddress) return normalizedCity

  return [normalizedAddress, normalizedCity].join(", ")
}
