import { createRouter, createWebHistory } from 'vue-router'
import Musje from '../views/Musje.vue'
import GridSheet from '../views/GridSheet.vue'

export const basicRoutes = [
  {
    path: '/',
    name: 'musje',
    component: Musje
  },
  {
    path: '/gridSheet',
    name: 'gridSheet',
    component: GridSheet
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
]

export const router = createRouter({
  history:
    import.meta.env.VITE_USE_HASH === 'true' ? createWebHashHistory('/') : createWebHistory('/'),
  routes: basicRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export function setupRouter(app) {
  app.use(router)
}
