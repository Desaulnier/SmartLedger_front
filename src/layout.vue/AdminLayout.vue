<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Fold, Expand, Bell, ArrowDown, User, SwitchButton, DataAnalysis, List, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(false)

const userInfo = ref({
  name: '管理员',
  role: 'admin'
})

const menuItems = [
  { index: '/admin/dashboard', title: '数据看板', icon: DataAnalysis },
  { index: '/admin/users', title: '用户管理', icon: User },
  { index: '/admin/bills', title: '账单管理', icon: List }
]

const handleLogout = () => {
  ElMessage.success('已安全退出')
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'is-collapse': isCollapse }">
      <div class="sidebar-header">
        <div class="logo" v-show="!isCollapse">
          <span class="logo-icon">🛡️</span>
          <span class="logo-text">管理后台</span>
        </div>
        <div class="logo-mini" v-show="isCollapse">
          <span>🛡️</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.index"
          :to="item.index"
          class="menu-item"
        >
          <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
          <span class="menu-text" v-show="!isCollapse">{{ item.title }}</span>
        </router-link>
      </nav>
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
            <el-breadcrumb-item>管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title || '数据看板' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown trigger="click" @command="handleLogout">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ userInfo.name?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ userInfo.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
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
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1a3030 0%, #0f1f1f 100%);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;

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
  }
}

.sidebar-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0;
  }
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

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  &.is-active {
    background: rgba(64, 158, 255, 0.15);
    color: #409eff;
    font-weight: 600;
  }

  .menu-icon {
    font-size: 18px;
    margin-right: 12px;
  }

  .menu-text {
    font-size: 14px;
    white-space: nowrap;
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
        color: #409eff;
        background: #f5f7fa;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

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
        background: linear-gradient(135deg, #409eff, #66b1ff);
        color: #fff;
        font-weight: 600;
        font-size: 14px;
      }

      .user-name {
        font-size: 14px;
        color: #303133;
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

    &:hover {
      background: #c0c4cc;
    }
  }
}
</style>
