export function formatearEuros(centimos) {
  const euros = centimos / 100
  return `${euros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}

export function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso)
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function sumarDias(fechaIso, dias) {
  const fecha = new Date(fechaIso)
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString()
}
