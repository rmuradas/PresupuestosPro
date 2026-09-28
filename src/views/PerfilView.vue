<script setup>
import { reactive, ref, onMounted } from 'vue'
import { getPerfil, savePerfil } from '../storage/perfil.js'
import LogoUploader from '../components/LogoUploader.vue'

const form = reactive({ nombre: '', nif: '', contacto: '', logo: '' })
const error = ref('')
const guardado = ref(false)
const cargando = ref(true)

onMounted(async () => {
  try {
    const perfil = await getPerfil()
    if (perfil) {
      Object.assign(form, perfil)
    }
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  error.value = ''
  guardado.value = false
  if (!form.nombre.trim() || !form.nif.trim() || !form.contacto.trim()) {
    error.value = 'Nombre, NIF y contacto son obligatorios.'
    return
  }
  try {
    await savePerfil({ nombre: form.nombre.trim(), nif: form.nif.trim(), contacto: form.contacto.trim(), logo: form.logo })
    guardado.value = true
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section>
    <h2>Perfil del freelancer</h2>
    <p v-if="cargando">Cargando…</p>
    <form v-else @submit.prevent="guardar">
      <label>
        Nombre
        <input v-model="form.nombre" type="text" />
      </label>
      <label>
        NIF
        <input v-model="form.nif" type="text" />
      </label>
      <label>
        Contacto
        <input v-model="form.contacto" type="text" placeholder="Email, teléfono o dirección" />
      </label>
      <LogoUploader v-model="form.logo" />
      <p v-if="error" class="aviso">{{ error }}</p>
      <p v-if="guardado">Perfil guardado.</p>
      <button type="submit">Guardar</button>
    </form>
  </section>
</template>
