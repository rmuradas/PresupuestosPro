import { Router } from 'express'
import db from '../db/conexion.js'
import { generarId } from '../util/id.js'
import { calcularEstadoEfectivo } from '../estado/estadoEfectivo.js'

const router = Router()
const resumenActividadRouter = Router()

const ESTADOS_MANUALES = ['borrador', 'enviado', 'aceptado', 'rechazado']

function sumarDias(fechaIso, dias) {
  const fecha = new Date(fechaIso)
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString()
}

function obtenerLineas(presupuestoId) {
  return db
    .prepare(
      'SELECT id, descripcion, cantidad, precio_unitario_centimos, servicio_origen_id FROM presupuesto_lineas WHERE presupuesto_id = ?'
    )
    .all(presupuestoId)
    .map((l) => ({
      descripcion: l.descripcion,
      cantidad: l.cantidad,
      precioUnitario: l.precio_unitario_centimos,
      servicioOrigenId: l.servicio_origen_id
    }))
}

function filaAPresupuesto(fila, hoy, { conLineas } = {}) {
  const estadoEfectivo = calcularEstadoEfectivo(fila.estado, fila.fecha_validez, hoy)
  const presupuesto = {
    id: fila.id,
    numero: fila.numero,
    fechaEmision: fila.fecha_emision,
    fechaValidez: fila.fecha_validez,
    cliente: {
      nombre: fila.cliente_nombre,
      nif: fila.cliente_nif,
      contacto: fila.cliente_contacto,
      tipo: fila.cliente_tipo
    },
    retencionActiva: !!fila.retencion_activa,
    retencionPorcentaje: fila.retencion_porcentaje,
    estado: estadoEfectivo
  }
  if (conLineas) {
    presupuesto.lineas = obtenerLineas(fila.id)
  }
  return presupuesto
}

function validarCrearActualizar({ cliente, lineas }) {
  if (!cliente || !cliente.nombre || !cliente.nif || !cliente.contacto || !cliente.tipo) {
    return 'El presupuesto necesita un cliente completo (nombre, NIF, contacto, tipo)'
  }
  if (!Array.isArray(lineas)) {
    return 'Las líneas del presupuesto deben ser una lista'
  }
  return null
}

function reemplazarLineas(presupuestoId, lineas) {
  db.prepare('DELETE FROM presupuesto_lineas WHERE presupuesto_id = ?').run(presupuestoId)
  const insertar = db.prepare(
    'INSERT INTO presupuesto_lineas (id, presupuesto_id, descripcion, cantidad, precio_unitario_centimos, servicio_origen_id) VALUES (?, ?, ?, ?, ?, ?)'
  )
  for (const linea of lineas) {
    insertar.run(
      generarId(),
      presupuestoId,
      linea.descripcion,
      linea.cantidad,
      linea.precioUnitario,
      linea.servicioOrigenId ?? null
    )
  }
}

router.get('/', (req, res) => {
  const hoy = new Date().toISOString()
  const filas = db.prepare('SELECT * FROM presupuestos ORDER BY numero DESC').all()
  res.json(filas.map((fila) => filaAPresupuesto(fila, hoy)))
})

router.get('/:id', (req, res) => {
  const hoy = new Date().toISOString()
  const fila = db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(req.params.id)
  if (!fila) {
    res.status(404).json({ error: 'Presupuesto no encontrado' })
    return
  }
  res.json(filaAPresupuesto(fila, hoy, { conLineas: true }))
})

router.post('/', (req, res) => {
  const { cliente, retencionActiva, retencionPorcentaje, lineas } = req.body ?? {}
  const errorValidacion = validarCrearActualizar({ cliente, lineas })
  if (errorValidacion) {
    res.status(400).json({ error: errorValidacion })
    return
  }

  const crear = db.transaction(() => {
    const fechaEmision = new Date().toISOString()
    const fechaValidez = sumarDias(fechaEmision, 30)
    const anio = new Date(fechaEmision).getUTCFullYear()

    const contador = db.prepare('SELECT ultimo_numero_usado FROM contador_anual WHERE anio = ?').get(anio)
    const siguiente = (contador ? contador.ultimo_numero_usado : 0) + 1
    if (contador) {
      db.prepare('UPDATE contador_anual SET ultimo_numero_usado = ? WHERE anio = ?').run(siguiente, anio)
    } else {
      db.prepare('INSERT INTO contador_anual (anio, ultimo_numero_usado) VALUES (?, ?)').run(anio, siguiente)
    }
    const numero = `${anio}-${String(siguiente).padStart(3, '0')}`

    const id = generarId()
    db.prepare(
      'INSERT INTO presupuestos (id, numero, fecha_emision, fecha_validez, cliente_nombre, cliente_nif, cliente_contacto, cliente_tipo, retencion_activa, retencion_porcentaje, estado) ' +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador')"
    ).run(
      id,
      numero,
      fechaEmision,
      fechaValidez,
      cliente.nombre,
      cliente.nif,
      cliente.contacto,
      cliente.tipo,
      retencionActiva ? 1 : 0,
      retencionActiva ? retencionPorcentaje : null
    )
    reemplazarLineas(id, lineas)
    return id
  })

  const id = crear()
  const fila = db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(id)
  res.status(201).json(filaAPresupuesto(fila, new Date().toISOString(), { conLineas: true }))
})

router.put('/:id', (req, res) => {
  const { cliente, retencionActiva, retencionPorcentaje, lineas } = req.body ?? {}
  const errorValidacion = validarCrearActualizar({ cliente, lineas })
  if (errorValidacion) {
    res.status(400).json({ error: errorValidacion })
    return
  }
  const existente = db.prepare('SELECT id FROM presupuestos WHERE id = ?').get(req.params.id)
  if (!existente) {
    res.status(404).json({ error: 'Presupuesto no encontrado' })
    return
  }

  const actualizar = db.transaction(() => {
    db.prepare(
      'UPDATE presupuestos SET cliente_nombre = ?, cliente_nif = ?, cliente_contacto = ?, cliente_tipo = ?, retencion_activa = ?, retencion_porcentaje = ? WHERE id = ?'
    ).run(
      cliente.nombre,
      cliente.nif,
      cliente.contacto,
      cliente.tipo,
      retencionActiva ? 1 : 0,
      retencionActiva ? retencionPorcentaje : null,
      req.params.id
    )
    reemplazarLineas(req.params.id, lineas)
  })
  actualizar()

  const fila = db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(req.params.id)
  res.json(filaAPresupuesto(fila, new Date().toISOString(), { conLineas: true }))
})

router.put('/:id/estado', (req, res) => {
  const { estado } = req.body ?? {}
  if (!ESTADOS_MANUALES.includes(estado)) {
    res
      .status(400)
      .json({ error: 'El estado debe ser uno de: borrador, enviado, aceptado, rechazado (Caducado se calcula solo).' })
    return
  }
  const resultado = db.prepare('UPDATE presupuestos SET estado = ? WHERE id = ?').run(estado, req.params.id)
  if (resultado.changes === 0) {
    res.status(404).json({ error: 'Presupuesto no encontrado' })
    return
  }
  const fila = db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(req.params.id)
  res.json(filaAPresupuesto(fila, new Date().toISOString(), { conLineas: true }))
})

resumenActividadRouter.get('/', (req, res) => {
  const hoy = new Date().toISOString()
  const filas = db.prepare('SELECT estado, fecha_validez FROM presupuestos').all()
  const resumen = { borrador: 0, enviado: 0, aceptado: 0, rechazado: 0, caducado: 0 }
  for (const fila of filas) {
    const estadoEfectivo = calcularEstadoEfectivo(fila.estado, fila.fecha_validez, hoy)
    resumen[estadoEfectivo] += 1
  }
  res.json(resumen)
})

export { resumenActividadRouter }
export default router
