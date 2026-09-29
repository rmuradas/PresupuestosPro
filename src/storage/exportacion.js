import { peticionJson } from './errores.js'

export async function getDatosExportacion() {
  return peticionJson('/api/exportacion')
}
