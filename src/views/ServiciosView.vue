<script setup>
import { reactive, ref, onMounted } from 'vue'
import { listarServicios, crearServicio, actualizarServicio, eliminarServicio } from '../storage/servicios.js'
import { formatearEuros } from '../calculo/formato.js'

const servicios = ref([])
const form = reactive({ id: null, nombre: '', precioUnitarioEuros: 0 })
const error = ref('')
const cargando = ref(true)

async function recargar() {
  servicios.value = await listarServicios()
}

onMounted(async () => {
  try {
    await recargar()
  } finally {
    cargando.value = false
  }
})

function editar(servicio) {
  form.id = servicio.id
  form.nombre = servicio.nombre
  form.precioUnitarioEuros = servicio.precioPorDefecto / 100
}

function limpiar() {
  form.id = null
  form.nombre = ''
  form.precioUnitarioEuros = 0
  error.value = ''
}

async function guardar() {
  error.value = ''
  try {
    const datos = { nombre: form.nombre.trim(), precioPorDefecto: Math.round(form.precioUnitarioEuros * 100) }
    if (form.id) {
      await actualizarServicio(form.id, datos)
    } else {
      await crearServicio(datos)
    }
    limpiar()
    await recargar()
  } catch (e) {
    error.value = e.message
  }
}

async function eliminar(id) {
  await eliminarServicio(id)
  await recargar()
}
</script>

<template>
  <section>
    <h2>Catálogo de servicios</h2>
    <form @submit.prevent="guardar">
      <label>Nombre <input v-model="form.nombre" type="text" /></label>
      <label>Precio por defecto (€) <input v-model.number="form.precioUnitarioEuros" type="number" step="0.01" /></label>
      <p v-if="error" class="aviso">{{ error }}</p>
      <div>
        <button type="submit">{{ form.id ? 'Guardar cambios' : 'Añadir servicio' }}</button>
        <button v-if="form.id" type="button" class="secundario" @click="limpiar">Cancelar</button>
      </div>
    </form>

    <p v-if="cargando">Cargando…</p>
    <template v-else>
      <table v-if="servicios.length">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio por defecto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in servicios" :key="s.id">
            <td>{{ s.nombre }}</td>
            <td>{{ formatearEuros(s.precioPorDefecto) }}</td>
            <td>
              <button type="button" class="secundario" @click="editar(s)">Editar</button>
              <button type="button" class="secundario" @click="eliminar(s.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Todavía no hay servicios en el catálogo.</p>
    </template>
  </section>
</template>
