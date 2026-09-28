<script setup>
import { reactive, ref, onMounted } from 'vue'
import { listarServicios } from '../storage/servicios.js'

const emit = defineEmits(['agregar'])

const servicios = ref([])
const servicioSeleccionadoId = ref('')
const error = ref('')

const form = reactive({ descripcion: '', cantidad: 1, precioUnitario: 0 })

onMounted(async () => {
  servicios.value = await listarServicios()
})

function elegirServicio() {
  const servicio = servicios.value.find((s) => s.id === servicioSeleccionadoId.value)
  if (servicio) {
    form.descripcion = servicio.nombre
    form.precioUnitario = servicio.precioPorDefecto / 100
  }
}

function agregar() {
  error.value = ''
  if (!form.descripcion.trim()) {
    error.value = 'La descripción no puede estar vacía.'
    return
  }
  if (!(form.cantidad > 0)) {
    error.value = 'La cantidad debe ser mayor que 0.'
    return
  }
  if (!(form.precioUnitario > 0)) {
    error.value = 'El precio unitario debe ser mayor que 0.'
    return
  }
  emit('agregar', {
    descripcion: form.descripcion.trim(),
    cantidad: form.cantidad,
    precioUnitario: Math.round(form.precioUnitario * 100),
    servicioOrigenId: servicioSeleccionadoId.value || null
  })
  form.descripcion = ''
  form.cantidad = 1
  form.precioUnitario = 0
  servicioSeleccionadoId.value = ''
}
</script>

<template>
  <div>
    <label v-if="servicios.length">
      Desde el catálogo de servicios
      <select v-model="servicioSeleccionadoId" @change="elegirServicio">
        <option value="">-- Escribir a mano --</option>
        <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.nombre }}</option>
      </select>
    </label>
    <label>Descripción <input v-model="form.descripcion" type="text" /></label>
    <label>Cantidad <input v-model.number="form.cantidad" type="number" step="any" /></label>
    <label>Precio unitario (€) <input v-model.number="form.precioUnitario" type="number" step="0.01" /></label>
    <p v-if="error" class="aviso">{{ error }}</p>
    <button type="button" @click="agregar">Añadir línea</button>
  </div>
</template>
