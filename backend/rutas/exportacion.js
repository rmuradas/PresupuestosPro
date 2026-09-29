import { Router } from 'express'
import db from '../db/conexion.js'
import { calcularEstadoEfectivo } from '../estado/estadoEfectivo.js'

const router = Router()

function filaAPerfil(fila) {
  if (!fila) return null
  return { nombre: fila.nombre, nif: fila.nif, contacto: fila.contacto, logo: fila.logo ?? '' }
}

function filaAServicio(fila) {
  return { id: fila.id, nombre: fila.nombre, precioPorDefecto: fila.precio_por_defecto_centimos }
}

function obtenerLineas(presupuestoId) {
  return db
    .prepare(
      'SELECT descripcion, cantidad, precio_unitario_centimos, servicio_origen_id FROM presupuesto_lineas WHERE presupuesto_id = ?'
    )
    .all(presupuestoId)
    .map((l) => ({
      descripcion: l.descripcion,
      cantidad: l.cantidad,
      precioUnitario: l.precio_unitario_centimos,
      servicioOrigenId: l.servicio_origen_id
    }))
}

function filaAPresupuesto(fila, hoy) {
  const estadoEfectivo = calcularEstadoEfectivo(fila.estado, fila.fecha_validez, hoy)
  return {
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
    estado: estadoEfectivo,
    lineas: obtenerLineas(fila.id)
  }
}

router.get('/', (req, res) => {
  const hoy = new Date().toISOString()
  const filaPerfil = db.prepare('SELECT nombre, nif, contacto, logo FROM perfil WHERE id = 1').get()
  const filasServicios = db.prepare('SELECT id, nombre, precio_por_defecto_centimos FROM servicios').all()
  const filasPresupuestos = db.prepare('SELECT * FROM presupuestos ORDER BY numero DESC').all()

  res.json({
    perfil: filaAPerfil(filaPerfil),
    servicios: filasServicios.map(filaAServicio),
    presupuestos: filasPresupuestos.map((fila) => filaAPresupuesto(fila, hoy))
  })
})

export default router
