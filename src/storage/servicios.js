import { peticionJson } from './errores.js'

export async function listarServicios() {
  return peticionJson('/api/servicios')
}

export async function crearServicio({ nombre, precioPorDefecto }) {
  return peticionJson('/api/servicios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precioPorDefecto })
  })
}

export async function actualizarServicio(id, { nombre, precioPorDefecto }) {
  return peticionJson(`/api/servicios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precioPorDefecto })
  })
}

export async function eliminarServicio(id) {
  await peticionJson(`/api/servicios/${id}`, { method: 'DELETE' })
}
