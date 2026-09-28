import { createRouter, createWebHashHistory } from 'vue-router'
import { getPerfil } from './storage/perfil.js'

const routes = [
  { path: '/', name: 'inicio', component: () => import('./views/InicioView.vue') },
  { path: '/perfil', name: 'perfil', component: () => import('./views/PerfilView.vue') },
  { path: '/servicios', name: 'servicios', component: () => import('./views/ServiciosView.vue') },
  { path: '/clientes', name: 'clientes', component: () => import('./views/ClientesView.vue') },
  { path: '/presupuestos', name: 'presupuestos', component: () => import('./views/PresupuestosListView.vue') },
  { path: '/presupuestos/:id', name: 'presupuesto-detalle', component: () => import('./views/PresupuestoDetalleView.vue'), props: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const RUTAS_QUE_REQUIEREN_PERFIL = ['presupuestos', 'presupuesto-detalle']

router.beforeEach(async (to) => {
  if (RUTAS_QUE_REQUIEREN_PERFIL.includes(to.name) && !(await getPerfil())) {
    return { name: 'perfil' }
  }
  return true
})

export default router
