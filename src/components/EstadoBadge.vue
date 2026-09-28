<script setup>
defineProps({
  estado: { type: String, required: true }
})

const ETIQUETAS = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  caducado: 'Caducado'
}
</script>

<template>
  <span class="estado-badge" :class="`estado-badge--${estado}`">{{ ETIQUETAS[estado] ?? estado }}</span>
</template>

<style scoped>
.estado-badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: var(--radio-borde, 999px);
  font-size: 0.85rem;
  font-weight: var(--fuente-peso-negrita, 600);
  color: #fff;
}

.estado-badge--borrador {
  background: var(--color-estado-borrador);
}

.estado-badge--enviado {
  background: var(--color-estado-enviado);
}

.estado-badge--aceptado {
  background: var(--color-estado-aceptado);
}

.estado-badge--rechazado {
  background: var(--color-estado-rechazado);
}

.estado-badge--caducado {
  background: var(--color-estado-caducado);
}
</style>
