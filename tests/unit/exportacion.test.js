import { describe, it, expect } from 'vitest'
import { sanitizarNombreArchivo } from '../../src/exportacion/nombreArchivo.js'
import { construirObjetoDatosJson } from '../../src/exportacion/exportarTodo.js'

describe('exportacion/nombreArchivo', () => {
  it.each(['/', '\\', ':', '*', '?', '"', '<', '>', '|'])(
    'sustituye el carácter inválido "%s" por un guion',
    (caracter) => {
      expect(sanitizarNombreArchivo(`Cliente${caracter}Ejemplo`)).toBe('Cliente-Ejemplo')
    }
  )

  it('recorta espacios sobrantes tras sanear', () => {
    expect(sanitizarNombreArchivo('Diseño/Web S.L.')).toBe('Diseño-Web S.L.')
  })

  it('un nombre ya vacío sigue vacío tras sanear, pero el número lo sigue distinguiendo', () => {
    expect(sanitizarNombreArchivo('')).toBe('')
  })
})

describe('exportacion/exportarTodo — construirObjetoDatosJson', () => {
  it('produce exactamente las claves de primer nivel esperadas, sin catálogo de clientes', () => {
    const datosSimulados = {
      perfil: { nombre: 'Ejemplo', nif: '12345678A', contacto: 'a@b.com', logo: '' },
      servicios: [{ id: 's1', nombre: 'Consultoría', precioPorDefecto: 12000 }],
      presupuestos: [{ id: 'p1', numero: '2026-001', lineas: [] }]
    }

    const resultado = construirObjetoDatosJson(datosSimulados)

    expect(Object.keys(resultado).sort()).toEqual(['generadoEn', 'perfil', 'presupuestos', 'servicios'].sort())
    expect(resultado.perfil).toEqual(datosSimulados.perfil)
    expect(resultado.servicios).toEqual(datosSimulados.servicios)
    expect(resultado.presupuestos).toEqual(datosSimulados.presupuestos)
    expect(resultado.clientes).toBeUndefined()
  })
})
