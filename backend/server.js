import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import './db/conexion.js'
import rutasPerfil from './rutas/perfil.js'
import rutasServicios from './rutas/servicios.js'
import rutasClientes from './rutas/clientes.js'
import rutasPresupuestos, { resumenActividadRouter } from './rutas/presupuestos.js'
import rutasMigracion from './rutas/migracion.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(express.json())

app.use('/api/perfil', rutasPerfil)
app.use('/api/servicios', rutasServicios)
app.use('/api/clientes', rutasClientes)
app.use('/api/presupuestos', rutasPresupuestos)
app.use('/api/resumen-actividad', resumenActividadRouter)
app.use('/api/migracion', rutasMigracion)

app.use(express.static(join(__dirname, '..', 'dist')))

const puerto = process.env.PORT || 3000
app.listen(puerto, () => {
  console.log(`PresupuestosPro escuchando en http://localhost:${puerto}`)
})
