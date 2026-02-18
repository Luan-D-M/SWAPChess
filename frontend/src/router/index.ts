import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/play-local',
      name: 'play-local',
      component: () => import('../views/LocalPlayView.vue'),
    },
    {
      path: '/play-computer',
      name: 'play-computer',
      component: () => import('../views/ComputerPlayView.vue'),
    },
      {
      path: '/play-online',
      name: 'play-online',
      component: () => import('../views/MultiplayerPlayView.vue'),
    },
  ],
})

export default router
