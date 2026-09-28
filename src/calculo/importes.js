const TIPO_RETENCION_APLICABLE = 'empresa_autonomo'
const PORCENTAJE_IVA = 21

function redondearCentimos(valorCentimos) {
  return Math.floor(valorCentimos + 0.5)
}

export function baseImponible(lineas) {
  const sumaCentimos = lineas.reduce((acc, linea) => acc + linea.cantidad * linea.precioUnitario, 0)
  return redondearCentimos(sumaCentimos)
}

export function iva(baseImponibleCentimos) {
  return redondearCentimos((baseImponibleCentimos * PORCENTAJE_IVA) / 100)
}

export function retencion(baseImponibleCentimos, { retencionActiva, retencionPorcentaje, cliente }) {
  if (retencionActiva && cliente?.tipo === TIPO_RETENCION_APLICABLE) {
    return redondearCentimos((baseImponibleCentimos * retencionPorcentaje) / 100)
  }
  return 0
}

export function total(baseImponibleCentimos, ivaCentimos, retencionCentimos) {
  return redondearCentimos(baseImponibleCentimos + ivaCentimos - retencionCentimos)
}

export function calcularImportes(presupuesto) {
  const base = baseImponible(presupuesto.lineas)
  const ivaImporte = iva(base)
  const retencionImporte = retencion(base, presupuesto)
  const totalImporte = total(base, ivaImporte, retencionImporte)
  return { baseImponible: base, iva: ivaImporte, retencion: retencionImporte, total: totalImporte }
}
