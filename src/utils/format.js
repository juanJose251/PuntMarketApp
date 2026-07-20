export const formatPrice = (value) => {
  return `$${Number(value).toFixed(2)}`
}

export const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}
