// Devuelve la fecha como YYYY-MM-DD usando la hora local.
// No uso toISOString() porque devuelve la fecha en UTC y en El Salvador (UTC-6)
// despues de las 6 pm ya marca el dia siguiente.
export function toDateKey(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
