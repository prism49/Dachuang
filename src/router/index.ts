import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/academic',
      name: 'academic',
      // 使用动态导入，当用户访问这个页面时才会加载对应的组件
      // 这有助于优化初始加载速度
      component: () => import('../views/AcademicView.vue')
    },
    {
      path: '/interactive',
      name: 'interactive',
      component: () => import('../views/InteractiveView.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
