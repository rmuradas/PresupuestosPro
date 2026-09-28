import { peticionJson } from './errores.js'

export async function getPerfil() {
  return peticionJson('/api/perfil')
}

export async function savePerfil(perfil) {
  return peticionJson('/api/perfil', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil)
  })
}
