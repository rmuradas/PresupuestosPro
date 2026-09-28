import { leerClave } from './util.js'

const CLAVE_PERFIL = 'presupuestospro.perfil'
const CLAVE_SERVICIOS = 'presupuestospro.servicios'
const CLAVE_CLIENTES = 'presupuestospro.clientes'
const CLAVE_PRESUPUESTOS = 'presupuestospro.presupuestos'
const CLAVE_CONTADOR = 'presupuestospro.contadorAnual'

export async function migrarDatosLegadoSiHaceFalta() {
  const hayDatosAntiguos =
    localStorage.getItem(CLAVE_PERFIL) !== null ||
    localStorage.getItem(CLAVE_SERVICIOS) !== null ||
    localStorage.getItem(CLAVE_CLIENTES) !== null ||
    localStorage.getItem(CLAVE_PRESUPUESTOS) !== null

  if (!hayDatosAntiguos) {
    return
  }

  let estado
  try {
    const respuesta = await fetch('/api/migracion/estado')
    if (!respuesta.ok) {
      return
    }
    estado = await respuesta.json()
  } catch {
    return
  }

  if (!estado.baseDatosVacia) {
    return
  }

  const cuerpo = {
    perfil: leerClave(CLAVE_PERFIL, null),
    servicios: leerClave(CLAVE_SERVICIOS, []),
    clientes: leerClave(CLAVE_CLIENTES, []),
    presupuestos: leerClave(CLAVE_PRESUPUESTOS, []),
    contadorAnual: leerClave(CLAVE_CONTADOR, [])
  }

  try {
    const respuestaMigracion = await fetch('/api/migracion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    })
    if (!respuestaMigracion.ok) {
      return
    }
  } catch {
    return
  }

  localStorage.removeItem(CLAVE_PERFIL)
  localStorage.removeItem(CLAVE_SERVICIOS)
  localStorage.removeItem(CLAVE_CLIENTES)
  localStorage.removeItem(CLAVE_PRESUPUESTOS)
  localStorage.removeItem(CLAVE_CONTADOR)
}
