import { describe, it, expect } from 'vitest'
import { baseImponible, iva, retencion, total, calcularImportes } from '../../src/calculo/importes.js'

describe('calculo/importes', () => {
  it('Escenario 2 de quickstart: 1.500,00 € + 500,00 €, retención 15% sobre empresa/autónomo', () => {
    const presupuesto = {
      retencionActiva: true,
      retencionPorcentaje: 15,
      cliente: { tipo: 'empresa_autonomo' },
      lineas: [
        { cantidad: 1, precioUnitario: 150000 },
        { cantidad: 1, precioUnitario: 50000 }
      ]
    }
    const importes = calcularImportes(presupuesto)
    expect(importes.baseImponible).toBe(200000)
    expect(importes.iva).toBe(42000)
    expect(importes.retencion).toBe(30000)
    expect(importes.total).toBe(212000)
  })

  it('retención 7% en vez de 15%', () => {
    const presupuesto = {
      retencionActiva: true,
      retencionPorcentaje: 7,
      cliente: { tipo: 'empresa_autonomo' },
      lineas: [
        { cantidad: 1, precioUnitario: 150000 },
        { cantidad: 1, precioUnitario: 50000 }
      ]
    }
    const importes = calcularImportes(presupuesto)
    expect(importes.total).toBe(228000)
  })

  it('cliente particular: la retención no se aplica aunque esté activa', () => {
    const presupuesto = {
      retencionActiva: true,
      retencionPorcentaje: 15,
      cliente: { tipo: 'particular' },
      lineas: [
        { cantidad: 1, precioUnitario: 150000 },
        { cantidad: 1, precioUnitario: 50000 }
      ]
    }
    const importes = calcularImportes(presupuesto)
    expect(importes.retencion).toBe(0)
    expect(importes.total).toBe(242000)
  })

  it('redondea 0,5 céntimos hacia arriba', () => {
    expect(baseImponible([{ cantidad: 1, precioUnitario: 100.5 }])).toBe(101)
    expect(iva(10050)).toBe(2111)
    expect(retencion(10050, { retencionActiva: true, retencionPorcentaje: 15, cliente: { tipo: 'empresa_autonomo' } })).toBe(1508)
    expect(total(101, 21, 15)).toBe(107)
  })
})
