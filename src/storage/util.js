export function leerClave(clave, valorPorDefecto) {
  const texto = localStorage.getItem(clave)
  if (texto === null) {
    return valorPorDefecto
  }
  return JSON.parse(texto)
}

export function escribirClave(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor))
}

export function generarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
