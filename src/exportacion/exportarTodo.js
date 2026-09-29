import JSZip from 'jszip'
import { ref } from 'vue'
import { getDatosExportacion } from '../storage/exportacion.js'
import { construirDocumentoPdfPresupuesto } from '../pdf/generarPdfPresupuesto.js'
import { sanitizarNombreArchivo } from './nombreArchivo.js'

export const progreso = ref(null)

function cederHiloPrincipal() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function nombreZipDeHoy() {
  const hoy = new Date().toISOString().slice(0, 10)
  return `presupuestospro-copia-${hoy}.zip`
}

function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.click()
  URL.revokeObjectURL(url)
}

export function construirObjetoDatosJson({ perfil, servicios, presupuestos }) {
  return {
    generadoEn: new Date().toISOString(),
    perfil,
    servicios,
    presupuestos
  }
}

export async function exportarTodo() {
  const datos = await getDatosExportacion()
  const total = datos.presupuestos.length
  const zip = new JSZip()
  const presupuestosExportados = []
  const fallidos = []

  progreso.value = { actual: 0, total }
  for (const presupuesto of datos.presupuestos) {
    try {
      const doc = await construirDocumentoPdfPresupuesto(presupuesto)
      const nombreCliente = sanitizarNombreArchivo(presupuesto.cliente.nombre)
      zip.file(`${presupuesto.numero} - ${nombreCliente}.pdf`, doc.output('blob'))
      presupuestosExportados.push(presupuesto)
    } catch (error) {
      fallidos.push({ numero: presupuesto.numero, motivo: error?.message ?? 'Error desconocido' })
    }
    progreso.value = { actual: progreso.value.actual + 1, total }
    await cederHiloPrincipal()
  }

  const datosJson = construirObjetoDatosJson({
    perfil: datos.perfil,
    servicios: datos.servicios,
    presupuestos: presupuestosExportados
  })
  zip.file('datos.json', JSON.stringify(datosJson, null, 2))

  const blob = await zip.generateAsync({ type: 'blob' })
  descargarBlob(blob, nombreZipDeHoy())
  progreso.value = null

  return { total, exportados: presupuestosExportados.length, fallidos }
}
