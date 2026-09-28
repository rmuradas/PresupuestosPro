export function calcularEstadoEfectivo(estadoGuardado, fechaValidez, hoy) {
  if (estadoGuardado === 'aceptado' || estadoGuardado === 'rechazado') {
    return estadoGuardado
  }
  if (fechaValidez < hoy) {
    return 'caducado'
  }
  return estadoGuardado
}
