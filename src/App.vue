<script setup>
import { avisoConexion, reintentarUltimaPeticion } from './storage/errores.js'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1 class="app-title">PresupuestosPro</h1>
      <NavBar />
    </header>
    <p v-if="avisoConexion" class="aviso-conexion">
      {{ avisoConexion.mensaje }}
      <button type="button" @click="reintentarUltimaPeticion">Reintentar</button>
    </p>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
