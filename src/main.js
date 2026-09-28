import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import { migrarDatosLegadoSiHaceFalta } from './storage/migracionLegado.js'

migrarDatosLegadoSiHaceFalta().finally(() => {
  createApp(App).use(router).mount('#app')
})
