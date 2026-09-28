import { Router } from 'express'
import db from '../db/conexion.js'

const router = Router()

function filaAPerfil(fila) {
  if (!fila) return null
  return { nombre: fila.nombre, nif: fila.nif, contacto: fila.contacto, logo: fila.logo ?? '' }
}

router.get('/', (req, res) => {
  const fila = db.prepare('SELECT nombre, nif, contacto, logo FROM perfil WHERE id = 1').get()
  res.json(filaAPerfil(fila))
})

router.put('/', (req, res) => {
  const { nombre, nif, contacto, logo } = req.body ?? {}
  if (!nombre || !nombre.trim() || !nif || !nif.trim() || !contacto || !contacto.trim()) {
    res.status(400).json({ error: 'Nombre, NIF y contacto son obligatorios.' })
    return
  }
  db.prepare(
    'INSERT INTO perfil (id, nombre, nif, contacto, logo) VALUES (1, ?, ?, ?, ?) ' +
      'ON CONFLICT(id) DO UPDATE SET nombre = excluded.nombre, nif = excluded.nif, contacto = excluded.contacto, logo = excluded.logo'
  ).run(nombre.trim(), nif.trim(), contacto.trim(), logo ?? null)
  const fila = db.prepare('SELECT nombre, nif, contacto, logo FROM perfil WHERE id = 1').get()
  res.json(filaAPerfil(fila))
})

export default router
