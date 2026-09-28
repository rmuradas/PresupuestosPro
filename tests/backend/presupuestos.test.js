import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let servidor
let baseUrl
let carpetaTemp
let db

beforeAll(async () => {
  carpetaTemp = mkdtempSync(join(tmpdir(), 'presupuestospro-test-'))
  process.env.PRESUPUESTOSPRO_DB_PATH = join(carpetaTemp, 'test.db')

  const express = (await import('express')).default
  db = (await import('../../backend/db/conexion.js')).default
  const rutasPresupuestos = (await import('../../backend/rutas/presupuestos.js')).default

  const app = express()
  app.use(express.json())
  app.use('/api/presupuestos', rutasPresupuestos)

  await new Promise((resolve) => {
    servidor = app.listen(0, resolve)
  })
  const { port } = servidor.address()
  baseUrl = `http://localhost:${port}`
})

afterAll(() => {
  servidor?.close()
  db?.close()
  try {
    rmSync(carpetaTemp, { recursive: true, force: true })
  } catch {
    // En Windows el archivo .db puede quedar bloqueado brevemente tras cerrarlo; no es crítico para el test.
  }
  delete process.env.PRESUPUESTOSPRO_DB_PATH
})

beforeEach(() => {
  // Solo se falsea Date (no setTimeout/setInterval): la petición HTTP real
  // contra el servidor de prueba necesita que los temporizadores de Node sigan funcionando.
  vi.useFakeTimers({ toFake: ['Date'] })
})

afterEach(() => {
  vi.useRealTimers()
})

function clientePrueba() {
  return { nombre: 'Cliente de prueba', nif: '11111111A', contacto: 'c@example.com', tipo: 'particular' }
}

async function crearPresupuesto() {
  const respuesta = await fetch(`${baseUrl}/api/presupuestos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente: clientePrueba(),
      retencionActiva: false,
      lineas: [{ descripcion: 'Servicio', cantidad: 1, precioUnitario: 1000 }]
    })
  })
  return respuesta.json()
}

describe('numeración correlativa de presupuestos (backend, T013)', () => {
  it('asigna números correlativos sin huecos dentro del mismo año', async () => {
    vi.setSystemTime(new Date('2026-05-01T10:00:00.000Z'))

    const p1 = await crearPresupuesto()
    const p2 = await crearPresupuesto()
    const p3 = await crearPresupuesto()

    expect(p1.numero).toBe('2026-001')
    expect(p2.numero).toBe('2026-002')
    expect(p3.numero).toBe('2026-003')
  })

  it('reinicia la numeración a 001 al entrar en un año nuevo, sin afectar al año anterior', async () => {
    vi.setSystemTime(new Date('2027-12-31T23:00:00.000Z'))
    const primeroDe2027 = await crearPresupuesto()
    expect(primeroDe2027.numero).toBe('2027-001')

    vi.setSystemTime(new Date('2028-01-01T00:30:00.000Z'))
    const primeroDe2028 = await crearPresupuesto()
    expect(primeroDe2028.numero).toBe('2028-001')

    vi.setSystemTime(new Date('2027-06-01T00:00:00.000Z'))
    const segundoDe2027 = await crearPresupuesto()
    expect(segundoDe2027.numero).toBe('2027-002')
  })
})
