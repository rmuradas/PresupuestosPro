<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listarPresupuestos } from '../storage/presupuestos.js'
import { calcularImportes } from '../calculo/importes.js'
import { formatearEuros, formatearFecha } from '../calculo/formato.js'
import EstadoBadge from '../components/EstadoBadge.vue'

const router = useRouter()
const presupuestos = ref([])
const cargando = ref(true)

onMounted(async () => {
  try {
    presupuestos.value = await listarPresupuestos()
  } finally {
    cargando.value = false
  }
})

function totalDe(presupuesto) {
  return calcularImportes(presupuesto).total
}

function nuevoPresupuesto() {
  router.push({ name: 'presupuesto-detalle', params: { id: 'nuevo' } })
}
</script>

<template>
  <section>
    <h2>Presupuestos</h2>
    <button type="button" @click="nuevoPresupuesto">Nuevo presupuesto</button>
    <p v-if="cargando">Cargando…</p>
    <template v-else>
      <table v-if="presupuestos.length">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Válido hasta</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in presupuestos" :key="p.id">
            <td>
              <router-link :to="{ name: 'presupuesto-detalle', params: { id: p.id } }">{{ p.numero }}</router-link>
            </td>
            <td>{{ p.cliente?.nombre }}</td>
            <td>{{ formatearFecha(p.fechaValidez) }}</td>
            <td><EstadoBadge :estado="p.estado" /></td>
            <td>{{ formatearEuros(totalDe(p)) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>Todavía no hay presupuestos creados.</p>
    </template>
  </section>
</template>
