import { Router } from 'express'
import db from '../db/conexion.js'
import { generarId } from '../util/id.js'

const router = Router()

function filaAServicio(fila) {
  return { id: fila.id, nombre: fila.nombre, precioPorDefecto: fila.precio_por_defecto_centimos }
}

function validar({ nombre, precioPorDefecto }) {
  if (!nombre || !nombre.trim()) {
    return 'El nombre del servicio no puede estar vacío'
  }
  if (!(precioPorDefecto > 0)) {
    return 'El precio por defecto debe ser mayor que 0'
  }
  return null
}

router.get('/', (req, res) => {
  const filas = db.prepare('SELECT id, nombre, precio_por_defecto_centimos FROM servicios').all()
  res.json(filas.map(filaAServicio))
})

router.post('/', (req, res) => {
  const { nombre, precioPorDefecto } = req.body ?? {}
  const errorValidacion = validar({ nombre, precioPorDefecto })
  if (errorValidacion) {
    res.status(400).json({ error: errorValidacion })
    return
  }
  const id = generarId()
  db.prepare('INSERT INTO servicios (id, nombre, precio_por_defecto_centimos) VALUES (?, ?, ?)').run(
    id,
    nombre.trim(),
    precioPorDefecto
  )
  res.status(201).json({ id, nombre: nombre.trim(), precioPorDefecto })
})

router.put('/:id', (req, res) => {
  const { nombre, precioPorDefecto } = req.body ?? {}
  const errorValidacion = validar({ nombre, precioPorDefecto })
  if (errorValidacion) {
    res.status(400).json({ error: errorValidacion })
    return
  }
  const resultado = db
    .prepare('UPDATE servicios SET nombre = ?, precio_por_defecto_centimos = ? WHERE id = ?')
    .run(nombre.trim(), precioPorDefecto, req.params.id)
  if (resultado.changes === 0) {
    res.status(404).json({ error: 'Servicio no encontrado' })
    return
  }
  res.json({ id: req.params.id, nombre: nombre.trim(), precioPorDefecto })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM servicios WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
