import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, type User } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/TheDefault.vue'),
      children: [
        {
          path: '',
          name: 'root',
          redirect: '/top',
        },
        {
          path: '/login',
          name: 'login',
          component: () => import('../views/LoginView.vue'),
        },
        {
          path: '/register',
          name: 'register',
          component: () => import('../views/RegisterView.vue'),
        },
        {
          path: '/reset-password',
          name: 'reset-password',
          component: () => import('../views/ResetPassword.vue'),
        },
        {
          path: '/top',
          name: 'top',
          component: () => import('../views/TopView.vue'),
        },
        {
          path: '/about',
          name: 'about',
          meta: { requiresAuth: true },
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: '/account',
          name: 'account',
          meta: { requiresAuth: true },
          component: () => import('../views/AccountView.vue'),
        },
        {
          path: '/home',
          name: 'home',
          meta: { requiresAuth: true },
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/admin',
          name: 'admin',
          meta: { requiresAuth: true },
          component: () => import('../views/AdminView.vue'),
        },
      ],
    },
  ],
})

const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = getAuth().onAuthStateChanged(
      (user) => {
        unsubscribe()
        resolve(user)
      },
      (error) => {
        console.error('Authentication error:', error)
        unsubscribe()
        resolve(null) // Treat errors as not logged in
      },
    )
  })
}

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = await getCurrentUser()
    if (!user) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
