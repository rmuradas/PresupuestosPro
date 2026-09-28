import { peticionJson } from './errores.js'

export async function listarClientes() {
  return peticionJson('/api/clientes')
}

export async function crearCliente({ nombre, nif, contacto, tipo }) {
  return peticionJson('/api/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, nif, contacto, tipo })
  })
}

export async function actualizarCliente(id, { nombre, nif, contacto, tipo }) {
  return peticionJson(`/api/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, nif, contacto, tipo })
  })
}

export async function eliminarCliente(id) {
  await peticionJson(`/api/clientes/${id}`, { method: 'DELETE' })
}
