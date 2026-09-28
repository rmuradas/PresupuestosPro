import { peticionJson } from './errores.js'

export async function getResumenActividad() {
  return peticionJson('/api/resumen-actividad')
}
