<script setup>
import { ref, computed, onMounted } from 'vue'
import { getResumenActividad } from '../storage/resumenActividad.js'
import { getPerfil } from '../storage/perfil.js'

const resumen = ref(null)
const perfilCompleto = ref(true)
const cargando = ref(true)

const sinPresupuestos = computed(() => {
  if (!resumen.value) return false
  return Object.values(resumen.value).every((n) => n === 0)
})

onMounted(async () => {
  try {
    const [resumenActividad, perfil] = await Promise.all([getResumenActividad(), getPerfil()])
    resumen.value = resumenActividad
    perfilCompleto.value = !!perfil
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section>
    <h2>Inicio</h2>

    <nav class="inicio-accesos">
      <router-link to="/presupuestos" class="inicio-accesos__item">Presupuestos</router-link>
      <router-link to="/clientes" class="inicio-accesos__item">Clientes</router-link>
      <router-link to="/servicios" class="inicio-accesos__item">Catálogo</router-link>
      <router-link to="/perfil" class="inicio-accesos__item">Perfil</router-link>
    </nav>

    <p v-if="!cargando && !perfilCompleto" class="aviso">
      Completa tu perfil antes de crear presupuestos.
      <router-link to="/perfil">Ir a Perfil</router-link>
    </p>

    <h3>Resumen de actividad</h3>
    <p v-if="cargando">Cargando…</p>
    <template v-else>
      <p v-if="sinPresupuestos">Todavía no hay presupuestos creados.</p>
      <ul v-else class="resumen-actividad">
        <li>Borrador: {{ resumen.borrador }}</li>
        <li>Enviado: {{ resumen.enviado }}</li>
        <li>Aceptado: {{ resumen.aceptado }}</li>
        <li>Rechazado: {{ resumen.rechazado }}</li>
        <li>Caducado: {{ resumen.caducado }}</li>
      </ul>
    </template>
  </section>
</template>
