import { Router } from 'express'
import db from '../db/conexion.js'
import { generarId } from '../util/id.js'

const router = Router()

const TIPOS_VALIDOS = ['empresa_autonomo', 'particular']

function filaACliente(fila) {
  return { id: fila.id, nombre: fila.nombre, nif: fila.nif, contacto: fila.contacto, tipo: fila.tipo }
}

function validar({ nombre, nif, contacto, tipo }) {
  if (!nombre || !nombre.trim()) {
    return 'El nombre del cliente no puede estar vacío'
  }
  if (!nif || !nif.trim()) {
    return 'El NIF del cliente no puede estar vacío'
  }
  if (!contacto || !contacto.trim()) {
    return 'El contacto del cliente no puede estar vacío'
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return 'El tipo de cliente debe ser empresa_autonomo o particular'
  }
  return null
}

router.get('/', (req, res) => {
  const filas = db.prepare('SELECT id, nombre, nif, contacto, tipo FROM clientes').all()
  res.json(filas.map(filaACliente))
})

router.post('/', (req, res) => {
  const { nombre, nif, contacto, tipo } = req.body ?? {}
  const errorValidacion = validar({ nombre, nif, contacto, tipo })
  if (errorValidacion) {
    res.status(400).json({ error: errorValidacion })
    return
  }
  const id = generarId()
  db.prepare('INSERT INTO clientes (id, nombre, nif, contacto, tipo) VALUES (?, ?, ?, ?, ?)').run(
    id,
    nombre.trim(),
    nif.trim(),
    contacto.trim(),
    tipo
  )
  res.status(201).json({ id, nombre: nombre.trim(), nif: nif.trim(), contacto: contacto.trim(), tipo })
})

router.put('/:id', (req, res) => {
  const { nombre, nif, contacto, tipo } = req.body ?? {}
  const errorValidacion = validar({ nombre, nif, contacto, tipo })
  if (errorValidacion) {
    res.status(400).json({ error: errorValidacion })
    return
  }
  const resultado = db
    .prepare('UPDATE clientes SET nombre = ?, nif = ?, contacto = ?, tipo = ? WHERE id = ?')
    .run(nombre.trim(), nif.trim(), contacto.trim(), tipo, req.params.id)
  if (resultado.changes === 0) {
    res.status(404).json({ error: 'Cliente no encontrado' })
    return
  }
  res.json({ id: req.params.id, nombre: nombre.trim(), nif: nif.trim(), contacto: contacto.trim(), tipo })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
