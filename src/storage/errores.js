import { ref } from 'vue'

export const avisoConexion = ref(null)

let ultimaPeticionFallida = null

export async function peticionJson(url, opciones) {
  let respuesta
  try {
    respuesta = await fetch(url, opciones)
  } catch {
    ultimaPeticionFallida = { url, opciones }
    avisoConexion.value = {
      mensaje: 'No se puede conectar con el servidor. Comprueba que esté en marcha e inténtalo de nuevo.'
    }
    throw new Error('No se puede conectar con el servidor')
  }
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}))
    throw new Error(cuerpo.error || `Error del servidor (${respuesta.status})`)
  }
  avisoConexion.value = null
  if (respuesta.status === 204) {
    return null
  }
  const texto = await respuesta.text()
  return texto ? JSON.parse(texto) : null
}

export function reintentarUltimaPeticion() {
  if (!ultimaPeticionFallida) {
    return
  }
  const { url, opciones } = ultimaPeticionFallida
  peticionJson(url, opciones).catch(() => {})
}
