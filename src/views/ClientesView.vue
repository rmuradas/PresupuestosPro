<script setup>
import { reactive, ref, onMounted } from 'vue'
import { listarClientes, crearCliente, actualizarCliente, eliminarCliente } from '../storage/clientes.js'

const clientes = ref([])
const form = reactive({ id: null, nombre: '', nif: '', contacto: '', tipo: 'particular' })
const error = ref('')
const cargando = ref(true)

async function recargar() {
  clientes.value = await listarClientes()
}

onMounted(async () => {
  try {
    await recargar()
  } finally {
    cargando.value = false
  }
})

function editar(cliente) {
  form.id = cliente.id
  form.nombre = cliente.nombre
  form.nif = cliente.nif
  form.contacto = cliente.contacto
  form.tipo = cliente.tipo
}

function limpiar() {
  form.id = null
  form.nombre = ''
  form.nif = ''
  form.contacto = ''
  form.tipo = 'particular'
  error.value = ''
}

async function guardar() {
  error.value = ''
  try {
    const datos = { nombre: form.nombre.trim(), nif: form.nif.trim(), contacto: form.contacto.trim(), tipo: form.tipo }
    if (form.id) {
      await actualizarCliente(form.id, datos)
    } else {
      await crearCliente(datos)
    }
    limpiar()
    await recargar()
  } catch (e) {
    error.value = e.message
  }
}

async function eliminar(id) {
  await eliminarCliente(id)
  await recargar()
}
</script>

<template>
  <section>
    <h2>Clientes</h2>
    <form @submit.prevent="guardar">
      <label>Nombre <input v-model="form.nombre" type="text" /></label>
      <label>NIF <input v-model="form.nif" type="text" /></label>
      <label>Contacto <input v-model="form.contacto" type="text" /></label>
      <label>
        Tipo
        <select v-model="form.tipo">
          <option value="empresa_autonomo">Empresa / autónomo</option>
          <option value="particular">Particular</option>
        </select>
      </label>
      <p v-if="error" class="aviso">{{ error }}</p>
      <div>
        <button type="submit">{{ form.id ? 'Guardar cambios' : 'Añadir cliente' }}</button>
        <button v-if="form.id" type="button" class="secundario" @click="limpiar">Cancelar</button>
      </div>
    </form>

    <p v-if="cargando">Cargando…</p>
    <template v-else>
      <table v-if="clientes.length">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>NIF</th>
            <th>Tipo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clientes" :key="c.id">
            <td>{{ c.nombre }}</td>
            <td>{{ c.nif }}</td>
            <td>{{ c.tipo === 'empresa_autonomo' ? 'Empresa/autónomo' : 'Particular' }}</td>
            <td>
              <button type="button" class="secundario" @click="editar(c)">Editar</button>
              <button type="button" class="secundario" @click="eliminar(c.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Todavía no hay clientes en la lista.</p>
    </template>
  </section>
</template>
