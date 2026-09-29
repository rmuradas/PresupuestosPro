import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getPerfil } from '../storage/perfil.js'
import { calcularImportes } from '../calculo/importes.js'
import { formatearEuros, formatearFecha } from '../calculo/formato.js'

function hexARgb(hex) {
  const limpio = hex.trim().replace('#', '')
  return [parseInt(limpio.slice(0, 2), 16), parseInt(limpio.slice(2, 4), 16), parseInt(limpio.slice(4, 6), 16)]
}

function colorVariableCss(nombre) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre)
  return hexARgb(valor)
}

function cargarImagenLogoMarca() {
  return new Promise((resolve, reject) => {
    const imagen = new Image()
    imagen.onload = () => resolve(imagen)
    imagen.onerror = reject
    imagen.src = '/img/logo-rm.png'
  })
}

export async function construirDocumentoPdfPresupuesto(presupuesto) {
  const perfil = await getPerfil()
  const [rPrimario, gPrimario, bPrimario] = colorVariableCss('--color-primario')
  const doc = new jsPDF()
  let y = 15

  if (perfil?.logo) {
    try {
      const formato = perfil.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      doc.addImage(perfil.logo, formato, 150, 10, 40, 40)
    } catch {
      // Si el formato de imagen no es compatible, se omite el logo sin romper el PDF.
    }
  }

  doc.setTextColor(rPrimario, gPrimario, bPrimario)
  doc.setFontSize(14)
  doc.text(perfil?.nombre ?? '', 15, y)
  y += 6
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`NIF: ${perfil?.nif ?? ''}`, 15, y)
  y += 5
  doc.text(perfil?.contacto ?? '', 15, y)
  y += 10

  doc.setTextColor(rPrimario, gPrimario, bPrimario)
  doc.setFontSize(12)
  doc.text(`Presupuesto ${presupuesto.numero}`, 15, y)
  doc.setTextColor(0, 0, 0)
  y += 6
  doc.setFontSize(10)
  doc.text(`Fecha de emisión: ${formatearFecha(presupuesto.fechaEmision)}`, 15, y)
  y += 5
  doc.text(`Fecha de validez: ${formatearFecha(presupuesto.fechaValidez)}`, 15, y)
  y += 10

  doc.setFontSize(12)
  doc.text('Cliente', 15, y)
  y += 6
  doc.setFontSize(10)
  doc.text(`${presupuesto.cliente.nombre} (${presupuesto.cliente.tipo === 'empresa_autonomo' ? 'Empresa/autónomo' : 'Particular'})`, 15, y)
  y += 5
  doc.text(`NIF: ${presupuesto.cliente.nif}`, 15, y)
  y += 5
  doc.text(presupuesto.cliente.contacto, 15, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Descripción', 'Cantidad', 'Precio unitario', 'Importe']],
    body: presupuesto.lineas.map((linea) => [
      linea.descripcion,
      String(linea.cantidad),
      formatearEuros(linea.precioUnitario),
      formatearEuros(linea.cantidad * linea.precioUnitario)
    ]),
    headStyles: { fillColor: [rPrimario, gPrimario, bPrimario] }
  })

  const importes = calcularImportes(presupuesto)
  let yDesglose = doc.lastAutoTable.finalY + 10

  doc.setFontSize(10)
  doc.text(`Base imponible: ${formatearEuros(importes.baseImponible)}`, 15, yDesglose)
  yDesglose += 5
  doc.text(`IVA (21%): ${formatearEuros(importes.iva)}`, 15, yDesglose)
  yDesglose += 5
  if (importes.retencion > 0) {
    doc.text(`Retención IRPF (${presupuesto.retencionPorcentaje}%): -${formatearEuros(importes.retencion)}`, 15, yDesglose)
    yDesglose += 5
  }
  doc.setTextColor(rPrimario, gPrimario, bPrimario)
  doc.setFontSize(12)
  doc.text(`Total: ${formatearEuros(importes.total)}`, 15, yDesglose)
  doc.setTextColor(0, 0, 0)

  try {
    const logoMarca = await cargarImagenLogoMarca()
    doc.setPage(doc.internal.getNumberOfPages())
    const yLogoMarca = yDesglose > 260 ? doc.internal.pageSize.getHeight() - 20 : 270
    doc.addImage(logoMarca, 'PNG', 183, yLogoMarca, 12, 12)
  } catch {
    // Si el logotipo de marca no llega a cargar, se omite sin romper el PDF.
  }

  return doc
}

export async function generarPdfPresupuesto(presupuesto) {
  const doc = await construirDocumentoPdfPresupuesto(presupuesto)
  doc.save(`presupuesto-${presupuesto.numero}.pdf`)
}
