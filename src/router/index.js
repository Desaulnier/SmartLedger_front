import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/user/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/user/Register.vue')
    },
    {
      path:'/forgotpassword',
      name:'ForgotPassword',
      component:()=>import('../views/user/ForgotPassword.vue')
    },
    {
      path: '/user',
      name: 'UserLayout',
      component: () => import('@/layout.vue/UserLayout.vue'),
      redirect: '/user/add-bill',
      children: [
        // ========== 核心记账模块 ==========
        {
          path: 'add-bill',
          name: 'UserAddBill',
          component: () => import('@/views/bill/AddBill.vue'),
          meta: { title: '记一笔', group: 'core' }
        },
        {
          path: 'history',
          name: 'UserHistory',
          component: () => import('@/views/bill/History.vue'),
          meta: { title: '账单明细', group: 'core' }
        },
        // ========== 预算与预警模块（核心创新） ==========
        {
          path: 'budget',
          name: 'UserBudget',
          component: () => import('@/views/budget/BudgetSetting.vue'),
          meta: { title: '预算管理', group: 'budget' }
        },
        {
          path: 'warning',
          name: 'UserWarning',
          component: () => import('@/views/warning/WarningCenter.vue'),
          meta: { title: '消费预警 ⭐', group: 'budget' }
        },
        // ========== 数据分析模块 ==========
        {
          path: 'analysis',
          name: 'UserAnalysis',
          component: () => import('@/views/analysis/AnalysisReport.vue'),
          meta: { title: '消费分析', group: 'analysis' }
        },
        // ========== 趣味功能模块 ==========
        {
          path: 'rank',
          name: 'UserRank',
          component: () => import('@/views/fun/ConsumptionRank.vue'),
          meta: { title: '消费排行', group: 'fun' }
        },
        // ========== 设置模块 ==========
        {
          path: 'profile',
          name: 'UserProfile',
          component: () => import('@/views/setting/UserProfile.vue'),
          meta: { title: '个人中心', group: 'setting' }
        }
      ]
    },
    // ========== 管理员模块 ==========
    {
      path: '/admin',
      name: 'AdminLayout',
      component: () => import('@/layout.vue/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '数据看板' }
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/UserManage.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'bills',
          name: 'AdminBills',
          component: () => import('@/views/admin/BillManage.vue'),
          meta: { title: '账单管理' }
        }
      ]
    }
  ]
})

export default router