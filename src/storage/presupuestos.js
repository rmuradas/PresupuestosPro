import { peticionJson } from './errores.js'

export async function listarPresupuestos() {
  return peticionJson('/api/presupuestos')
}

export async function getPresupuesto(id) {
  return peticionJson(`/api/presupuestos/${id}`)
}

export async function crearPresupuesto(datos) {
  return peticionJson('/api/presupuestos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
}

export async function actualizarPresupuesto(id, cambios) {
  return peticionJson(`/api/presupuestos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cambios)
  })
}

export async function cambiarEstadoPresupuesto(id, estado) {
  return peticionJson(`/api/presupuestos/${id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  })
}
