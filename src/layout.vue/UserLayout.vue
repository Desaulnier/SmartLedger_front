<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {Fold,Expand,Bell,ArrowDown,User,SwitchButton,Edit,List,PieChart,Wallet,Warning,Coin,Trophy
} from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(false)

// 用户信息（不从代码写死，从 localStorage 读取）
const userInfo = ref({
  name: '同学',
  email: '',
  avatar: ''
})

// 预警消息数量（不硬编码，后期从接口获取）
// 当为 0 时不显示红点，1-99 显示数字，>99 显示 99+
const warnCount = ref(0)

onMounted(() => {
  // 从本地缓存读取用户信息
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    try {
      const parsed = JSON.parse(savedUserInfo)
      userInfo.value.name = parsed.name || parsed.email?.split('@')[0] || '同学'
      userInfo.value.email = parsed.email || ''
    } catch (e) {
      console.error('用户信息解析失败', e)
    }
  }

  // ==============================================
  // TODO 后端接口：获取当前用户的消费预警数量
  // GET /api/warning/count
  // 返回示例：{ count: 3 }
  // ==============================================
  // warnCount 目前用模拟值，后端实现后替换
  // 0 = 无预警（不显示红点）
  // 1-99 = 显示具体数字
  // >99 = 显示 99+
  warnCount.value = 0
})


// 下拉菜单处理
const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessage.success('已安全退出')
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/user/profile')
  }
}

// 侧边栏折叠
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 当前激活菜单
const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

// ==============================
// 菜单配置（按功能模块分组，贴近大学生活）
// ==============================
const menuGroups = [
  {
    groupName: '核心功能',
    items: [
      { index: '/user/add-bill', title: '记一笔', icon: Edit },
      { index: '/user/history', title: '账单明细', icon: List }
    ]
  },
  {
    groupName: '预算与预警 ⭐',
    items: [
      { index: '/user/budget', title: '预算管理', icon: Wallet },
      { index: '/user/warning', title: '消费预警', icon: Warning }
    ]
  },
  {
    groupName: '数据分析',
    items: [
      { index: '/user/analysis', title: '消费分析', icon: PieChart }
    ]
  },
  {
    groupName: '趣味功能',
    items: [
      { index: '/user/rank', title: '消费排行', icon: 'Trophy' },
      { index: '/user/profile', title: '个人中心', icon: 'User' }
    ]
  }
]

// 扁平化菜单用于路由匹配
const menuItems = computed(() => {
  return menuGroups.flatMap(group => group.items)
})
</script>

<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'is-collapse': isCollapse }">
      <div class="sidebar-header">
        <div class="logo" v-show="!isCollapse">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">校园记账助手</span>
        </div>
        <div class="logo-mini" v-show="isCollapse">
          <span>🎓</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <template v-for="group in menuGroups" :key="group.groupName">
          <!-- 分组标题 -->
          <div class="menu-group-header" v-show="!isCollapse">
            <span>{{ group.groupName }}</span>
          </div>
          <div class="menu-group-divider" v-show="!isCollapse"></div>

          <!-- 分组下的菜单项 -->
          <router-link
            v-for="item in group.items"
            :key="item.index"
            :to="item.index"
            class="menu-item"
            :class="{ 'is-active': activeMenu === item.index }"
          >
            <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
            <span class="menu-text" v-show="!isCollapse">{{ item.title }}</span>

            <!-- 预警角标：warnCount > 0 时才显示 -->
            <el-badge
              v-if="item.index === '/user/warning' && warnCount > 0"
              :value="warnCount"
              :max="99"
              :hidden="warnCount === 0"
              class="menu-badge"
            />

            <el-tooltip v-show="isCollapse" :content="item.title" placement="right">
              <span></span>
            </el-tooltip>
          </router-link>
        </template>
      </nav>

      <div class="sidebar-footer" v-show="!isCollapse">
        <div class="campus-tag">🎓 大学生专用</div>
        <div class="version">v1.0.0</div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-container" :class="{ 'is-collapse': isCollapse }">
      <!-- 顶部导航 -->
      <header class="top-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/user/add-bill' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title || '记一笔' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 通知中心：warnCount > 0 时才显示红点 -->
          <el-badge
            :value="warnCount"
            :hidden="warnCount === 0"
            :max="99"
            class="notification-badge"
          >
            <el-icon class="notify-icon"><Bell /></el-icon>
          </el-badge>

          <!-- 用户菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ userInfo.name?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ userInfo.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #2F4F4F 0%, #1a3030 100%);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1000;

  &.is-collapse {
    width: 64px;

    .menu-item {
      justify-content: center;
      padding: 0 16px;
      margin: 4px 8px;

      .menu-icon {
        margin-right: 0;
        font-size: 18px;
      }
    }
  }
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    .logo-icon {
      font-size: 32px;
      animation: float 3s ease-in-out infinite;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1px;
    }
  }

  .logo-mini {
    text-align: center;
    font-size: 32px;
    animation: float 3s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.sidebar-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0;
  }
}

// 分组标题样式
.menu-group-header {
  padding: 8px 24px 4px;
  font-size: 11px;
  color: rgba(255, 208, 75, 0.6);
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
}

.menu-group-divider {
  margin: 4px 16px;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 4px 12px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  &.is-active {
    background: rgba(255, 208, 75, 0.15);
    color: #ffd04b;
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background: #ffd04b;
      border-radius: 0 2px 2px 0;
    }
  }

  .menu-icon {
    font-size: 18px;
    margin-right: 12px;
    transition: transform 0.25s ease;
  }

  &:hover .menu-icon {
    transform: scale(1.1);
  }

  .menu-text {
    font-size: 14px;
    white-space: nowrap;
  }

  .menu-badge {
    margin-left: auto;
  }
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;

  .campus-tag {
    color: rgba(255, 208, 75, 0.8);
    font-size: 11px;
    margin-bottom: 4px;
  }

  .version {
    color: rgba(255, 255, 255, 0.3);
    font-size: 11px;
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.top-header {
  height: 56px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 999;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 18px;
      cursor: pointer;
      color: #606266;
      transition: all 0.25s;
      padding: 4px;
      border-radius: 4px;

      &:hover {
        color: #2F4F4F;
        background: #f5f7fa;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .notification-badge {
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.25s;

      &:hover {
        background: #f5f7fa;
      }

      .notify-icon {
        font-size: 20px;
        color: #606266;
        transition: all 0.25s;

        &:hover {
          color: #f56c6c;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 20px;
      transition: all 0.25s;

      &:hover {
        background: #f5f7fa;
      }

      .user-avatar {
        background: linear-gradient(135deg, #2F4F4F, #4a7c7c);
        color: #fff;
        font-weight: 600;
        font-size: 14px;
      }

      .user-name {
        font-size: 14px;
        color: #303133;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f5f7fa;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
    transition: background 0.25s;

    &:hover {
      background: #c0c4cc;
    }
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 2000;
    transform: translateX(-100%);

    &.is-collapse {
      transform: translateX(0);
      width: 240px;
    }
  }

  .main-container {
    margin-left: 0 !important;
  }

  .top-header {
    padding: 0 16px;

    .user-name {
      display: none;
    }
  }

  .main-content {
    padding: 16px;
  }
}
</style>
