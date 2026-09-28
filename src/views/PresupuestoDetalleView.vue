<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listarClientes } from '../storage/clientes.js'
import { getPresupuesto, crearPresupuesto, actualizarPresupuesto, cambiarEstadoPresupuesto } from '../storage/presupuestos.js'
import { calcularImportes } from '../calculo/importes.js'
import { formatearEuros, formatearFecha, sumarDias } from '../calculo/formato.js'
import LineaForm from '../components/LineaForm.vue'
import EstadoBadge from '../components/EstadoBadge.vue'

const props = defineProps({
  id: { type: String, required: true }
})

const router = useRouter()
const esNuevo = computed(() => props.id === 'nuevo')

const clientesCatalogo = ref([])
const clienteSeleccionadoId = ref('')
const nuevoClienteForm = reactive({ nombre: '', nif: '', contacto: '', tipo: 'particular' })
const mostrarFormularioCliente = ref(false)
const cargando = ref(true)

const presupuesto = reactive({
  id: null,
  numero: null,
  fechaEmision: new Date().toISOString(),
  fechaValidez: sumarDias(new Date().toISOString(), 30),
  cliente: null,
  retencionActiva: false,
  retencionPorcentaje: 15,
  estado: 'borrador',
  lineas: []
})

const errorLinea = ref('')
const errorPdf = ref('')
const errorEstado = ref('')
const guardadoOk = ref(false)

onMounted(async () => {
  try {
    clientesCatalogo.value = await listarClientes()
    if (!esNuevo.value) {
      const existente = await getPresupuesto(props.id)
      if (existente) {
        Object.assign(presupuesto, existente)
      }
    }
  } finally {
    cargando.value = false
  }
})

async function cambiarEstado(nuevoEstado) {
  errorEstado.value = ''
  try {
    const actualizado = await cambiarEstadoPresupuesto(presupuesto.id, nuevoEstado)
    presupuesto.estado = actualizado.estado
  } catch (e) {
    errorEstado.value = e.message
  }
}

function elegirClienteCatalogo() {
  const cliente = clientesCatalogo.value.find((c) => c.id === clienteSeleccionadoId.value)
  if (cliente) {
    presupuesto.cliente = { nombre: cliente.nombre, nif: cliente.nif, contacto: cliente.contacto, tipo: cliente.tipo }
  }
}

function confirmarClienteNuevo() {
  if (!nuevoClienteForm.nombre.trim() || !nuevoClienteForm.nif.trim() || !nuevoClienteForm.contacto.trim()) {
    return
  }
  presupuesto.cliente = {
    nombre: nuevoClienteForm.nombre.trim(),
    nif: nuevoClienteForm.nif.trim(),
    contacto: nuevoClienteForm.contacto.trim(),
    tipo: nuevoClienteForm.tipo
  }
  mostrarFormularioCliente.value = false
}

function agregarLinea(linea) {
  presupuesto.lineas.push(linea)
}

function eliminarLinea(index) {
  presupuesto.lineas.splice(index, 1)
}

const importes = computed(() => calcularImportes(presupuesto))

const puedeAplicarRetencion = computed(() => presupuesto.cliente?.tipo === 'empresa_autonomo')

async function guardar() {
  guardadoOk.value = false
  const datos = {
    cliente: presupuesto.cliente,
    retencionActiva: presupuesto.retencionActiva,
    retencionPorcentaje: presupuesto.retencionPorcentaje,
    lineas: presupuesto.lineas
  }
  if (esNuevo.value) {
    const creado = await crearPresupuesto(datos)
    Object.assign(presupuesto, creado)
    router.replace({ name: 'presupuesto-detalle', params: { id: creado.id } })
  } else {
    const actualizado = await actualizarPresupuesto(presupuesto.id, datos)
    Object.assign(presupuesto, actualizado)
  }
  guardadoOk.value = true
}

async function generarPdf() {
  errorPdf.value = ''
  if (presupuesto.lineas.length === 0) {
    errorPdf.value = 'Añade al menos una línea antes de generar el PDF.'
    return
  }
  const { generarPdfPresupuesto } = await import('../pdf/generarPdfPresupuesto.js')
  await generarPdfPresupuesto(presupuesto)
}
</script>

<template>
  <section>
    <h2>{{ esNuevo ? 'Nuevo presupuesto' : `Presupuesto ${presupuesto.numero}` }}</h2>
    <p v-if="cargando">Cargando…</p>
    <template v-else>
    <template v-if="!esNuevo">
      <p>
        Fecha de emisión: {{ formatearFecha(presupuesto.fechaEmision) }} · Válido hasta:
        {{ formatearFecha(presupuesto.fechaValidez) }}
      </p>
      <p>
        Estado: <EstadoBadge :estado="presupuesto.estado" />
        <label v-if="presupuesto.estado !== 'caducado'" class="selector-estado">
          Cambiar a
          <select :value="presupuesto.estado" @change="cambiarEstado($event.target.value)">
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </label>
      </p>
      <p v-if="errorEstado" class="aviso">{{ errorEstado }}</p>
    </template>

    <fieldset>
      <legend>Cliente</legend>
      <label>
        Elegir de la lista
        <select v-model="clienteSeleccionadoId" @change="elegirClienteCatalogo">
          <option value="">-- Selecciona un cliente --</option>
          <option v-for="c in clientesCatalogo" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </label>
      <button type="button" class="secundario" @click="mostrarFormularioCliente = !mostrarFormularioCliente">
        {{ mostrarFormularioCliente ? 'Cancelar alta rápida' : 'Dar de alta un cliente nuevo aquí' }}
      </button>
      <div v-if="mostrarFormularioCliente">
        <label>Nombre <input v-model="nuevoClienteForm.nombre" type="text" /></label>
        <label>NIF <input v-model="nuevoClienteForm.nif" type="text" /></label>
        <label>Contacto <input v-model="nuevoClienteForm.contacto" type="text" /></label>
        <label>
          Tipo
          <select v-model="nuevoClienteForm.tipo">
            <option value="empresa_autonomo">Empresa / autónomo</option>
            <option value="particular">Particular</option>
          </select>
        </label>
        <button type="button" @click="confirmarClienteNuevo">Usar estos datos</button>
      </div>
      <p v-if="presupuesto.cliente">
        Cliente en este presupuesto: <strong>{{ presupuesto.cliente.nombre }}</strong> ({{ presupuesto.cliente.tipo }})
      </p>
    </fieldset>

    <fieldset>
      <legend>Líneas</legend>
      <table v-if="presupuesto.lineas.length">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Importe</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(linea, index) in presupuesto.lineas" :key="index">
            <td>{{ linea.descripcion }}</td>
            <td>{{ linea.cantidad }}</td>
            <td>{{ formatearEuros(linea.precioUnitario) }}</td>
            <td>{{ formatearEuros(linea.cantidad * linea.precioUnitario) }}</td>
            <td><button type="button" class="secundario" @click="eliminarLinea(index)">Eliminar</button></td>
          </tr>
        </tbody>
      </table>
      <LineaForm @agregar="agregarLinea" />
    </fieldset>

    <fieldset>
      <legend>Retención de IRPF</legend>
      <label>
        <input type="checkbox" v-model="presupuesto.retencionActiva" :disabled="!puedeAplicarRetencion" />
        Aplicar retención
      </label>
      <label v-if="presupuesto.retencionActiva">
        Porcentaje
        <select v-model.number="presupuesto.retencionPorcentaje">
          <option :value="15">15%</option>
          <option :value="7">7%</option>
        </select>
      </label>
      <p v-if="!puedeAplicarRetencion">La retención solo se aplica a clientes de tipo empresa/autónomo.</p>
    </fieldset>

    <div class="resumen-importes">
      <p>Base imponible: {{ formatearEuros(importes.baseImponible) }}</p>
      <p>IVA (21%): {{ formatearEuros(importes.iva) }}</p>
      <p v-if="importes.retencion > 0">Retención IRPF: −{{ formatearEuros(importes.retencion) }}</p>
      <p class="total">Total: {{ formatearEuros(importes.total) }}</p>
    </div>

    <div>
      <button type="button" @click="guardar">Guardar presupuesto</button>
      <button type="button" class="secundario" @click="generarPdf">Generar PDF</button>
    </div>
    <p v-if="guardadoOk">Presupuesto guardado.</p>
    <p v-if="errorPdf" class="aviso">{{ errorPdf }}</p>
    </template>
  </section>
</template>
