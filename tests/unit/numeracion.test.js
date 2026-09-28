import { describe, it, expect } from 'vitest'
import { siguienteNumero } from '../../src/calculo/numeracion.js'

describe('calculo/numeracion', () => {
  it('empieza en 001 para un año sin contador', () => {
    expect(siguienteNumero(2026, [])).toBe('2026-001')
  })

  it('es correlativa dentro del mismo año natural', () => {
    let contadores = []
    const primero = siguienteNumero(2026, contadores)
    contadores = [{ anio: 2026, ultimoNumeroUsado: 1 }]
    const segundo = siguienteNumero(2026, contadores)
    contadores = [{ anio: 2026, ultimoNumeroUsado: 2 }]
    const tercero = siguienteNumero(2026, contadores)

    expect(primero).toBe('2026-001')
    expect(segundo).toBe('2026-002')
    expect(tercero).toBe('2026-003')
  })

  it('reinicia a 001 en un año nuevo sin afectar a años anteriores', () => {
    const contadores = [{ anio: 2026, ultimoNumeroUsado: 3 }]
    expect(siguienteNumero(2027, contadores)).toBe('2027-001')
    expect(siguienteNumero(2026, contadores)).toBe('2026-004')
  })
})
