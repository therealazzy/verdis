export function cn(...inputs: Array<string | undefined | false | null>) {
  return inputs.filter(Boolean).join(" ")
}

/** Garden tiles use YYYY-MM-DD; format with fixed locale + UTC so SSR and client match. */
export function formatGardenDateLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00.000Z`)
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

