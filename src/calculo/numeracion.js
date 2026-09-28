export function siguienteNumero(anio, contadores) {
  const contador = contadores.find((c) => c.anio === anio)
  const ultimoNumeroUsado = contador ? contador.ultimoNumeroUsado : 0
  const siguiente = ultimoNumeroUsado + 1
  const nnn = String(siguiente).padStart(3, '0')
  return `${anio}-${nnn}`
}
