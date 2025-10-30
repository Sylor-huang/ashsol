import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/',
        name: 'ASH',
        component: () => import('@/views/home/index'),
        meta: { title: 'ASH' }
      },
    ]
  }
]

export const asyncRoutes = []

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

export default router
