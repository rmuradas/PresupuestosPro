import { Router } from 'express'
import db from '../db/conexion.js'
import { generarId } from '../util/id.js'

const router = Router()

function baseDatosVacia() {
  const conteo = db
    .prepare(
      'SELECT ' +
        '(SELECT COUNT(*) FROM perfil) AS perfil, ' +
        '(SELECT COUNT(*) FROM servicios) AS servicios, ' +
        '(SELECT COUNT(*) FROM clientes) AS clientes, ' +
        '(SELECT COUNT(*) FROM presupuestos) AS presupuestos'
    )
    .get()
  return conteo.perfil === 0 && conteo.servicios === 0 && conteo.clientes === 0 && conteo.presupuestos === 0
}

router.get('/estado', (req, res) => {
  res.json({ baseDatosVacia: baseDatosVacia() })
})

router.post('/', (req, res) => {
  if (!baseDatosVacia()) {
    res.status(409).json({ error: 'La base de datos ya tiene datos: la migración solo se ejecuta una vez.' })
    return
  }

  const { perfil, servicios, clientes, presupuestos, contadorAnual } = req.body ?? {}
  const importados = { perfil: 0, servicios: 0, clientes: 0, presupuestos: 0 }

  const migrar = db.transaction(() => {
    if (perfil) {
      db.prepare('INSERT INTO perfil (id, nombre, nif, contacto, logo) VALUES (1, ?, ?, ?, ?)').run(
        perfil.nombre,
        perfil.nif,
        perfil.contacto,
        perfil.logo ?? null
      )
      importados.perfil = 1
    }

    for (const servicio of servicios ?? []) {
      db.prepare('INSERT INTO servicios (id, nombre, precio_por_defecto_centimos) VALUES (?, ?, ?)').run(
        servicio.id ?? generarId(),
        servicio.nombre,
        servicio.precioPorDefecto
      )
      importados.servicios += 1
    }

    for (const cliente of clientes ?? []) {
      db.prepare('INSERT INTO clientes (id, nombre, nif, contacto, tipo) VALUES (?, ?, ?, ?, ?)').run(
        cliente.id ?? generarId(),
        cliente.nombre,
        cliente.nif,
        cliente.contacto,
        cliente.tipo
      )
      importados.clientes += 1
    }

    const insertarLinea = db.prepare(
      'INSERT INTO presupuesto_lineas (id, presupuesto_id, descripcion, cantidad, precio_unitario_centimos, servicio_origen_id) VALUES (?, ?, ?, ?, ?, ?)'
    )
    for (const presupuesto of presupuestos ?? []) {
      const id = presupuesto.id ?? generarId()
      db.prepare(
        'INSERT INTO presupuestos (id, numero, fecha_emision, fecha_validez, cliente_nombre, cliente_nif, cliente_contacto, cliente_tipo, retencion_activa, retencion_porcentaje, estado) ' +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador')"
      ).run(
        id,
        presupuesto.numero,
        presupuesto.fechaEmision,
        presupuesto.fechaValidez,
        presupuesto.cliente.nombre,
        presupuesto.cliente.nif,
        presupuesto.cliente.contacto,
        presupuesto.cliente.tipo,
        presupuesto.retencionActiva ? 1 : 0,
        presupuesto.retencionActiva ? presupuesto.retencionPorcentaje : null
      )
      for (const linea of presupuesto.lineas ?? []) {
        insertarLinea.run(generarId(), id, linea.descripcion, linea.cantidad, linea.precioUnitario, linea.servicioOrigenId ?? null)
      }
      importados.presupuestos += 1
    }

    for (const contador of contadorAnual ?? []) {
      db.prepare(
        'INSERT INTO contador_anual (anio, ultimo_numero_usado) VALUES (?, ?) ' +
          'ON CONFLICT(anio) DO UPDATE SET ultimo_numero_usado = MAX(ultimo_numero_usado, excluded.ultimo_numero_usado)'
      ).run(contador.anio, contador.ultimoNumeroUsado)
    }
  })

  migrar()
  res.json({ ok: true, importados })
})

export default router
