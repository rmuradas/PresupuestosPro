import { describe, it, expect } from 'vitest'
import { calcularEstadoEfectivo } from '../../backend/estado/estadoEfectivo.js'

const HOY = '2026-09-28T00:00:00.000Z'
const FECHA_PASADA = '2026-01-01T00:00:00.000Z'
const FECHA_FUTURA = '2027-01-01T00:00:00.000Z'

describe('calcularEstadoEfectivo', () => {
  it('Borrador con fecha de validez pasada se considera Caducado', () => {
    expect(calcularEstadoEfectivo('borrador', FECHA_PASADA, HOY)).toBe('caducado')
  })

  it('Enviado con fecha de validez pasada se considera Caducado', () => {
    expect(calcularEstadoEfectivo('enviado', FECHA_PASADA, HOY)).toBe('caducado')
  })

  it('Aceptado con fecha de validez pasada se mantiene Aceptado', () => {
    expect(calcularEstadoEfectivo('aceptado', FECHA_PASADA, HOY)).toBe('aceptado')
  })

  it('Rechazado con fecha de validez pasada se mantiene Rechazado', () => {
    expect(calcularEstadoEfectivo('rechazado', FECHA_PASADA, HOY)).toBe('rechazado')
  })

  it('Borrador con fecha de validez futura se mantiene Borrador', () => {
    expect(calcularEstadoEfectivo('borrador', FECHA_FUTURA, HOY)).toBe('borrador')
  })

  it('Enviado con fecha de validez futura se mantiene Enviado', () => {
    expect(calcularEstadoEfectivo('enviado', FECHA_FUTURA, HOY)).toBe('enviado')
  })
})
