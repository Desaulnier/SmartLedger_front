<template>
  <div class="user-profile-container">
    <div class="page-header fade-in-up">
      <div class="header-content">
        <h2 class="page-title">
          <span class="title-icon">👤</span>
          个人中心
        </h2>
        <p class="page-subtitle">当前页面已与登录信息对齐，编辑类接口等待后端接入</p>
      </div>
    </div>

    <div class="main-layout">
      <div class="left-panel">
        <el-card class="info-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">基础信息</span>
          </template>

          <div class="profile-header">
            <el-avatar :size="80" class="profile-avatar">
              {{ userInfo.username?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <div class="profile-info">
              <div class="profile-name">{{ userInfo.username || '未设置用户名' }}</div>
              <div class="profile-email">{{ userInfo.email || '暂无邮箱信息' }}</div>
              <el-tag :type="userInfo.role === 'ADMIN' ? 'danger' : 'success'" size="small">
                {{ userInfo.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </el-tag>
            </div>
          </div>

          <el-form :model="editForm" label-width="80px" class="profile-form">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="editForm.email" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="editForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="button" @click="handleSaveProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="password-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">修改密码</span>
          </template>

          <el-form :model="passwordForm" label-width="100px" class="password-form">
            <el-form-item label="旧密码">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="button" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div class="right-panel">
        <el-card class="stats-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">当前登录信息</span>
          </template>

          <div class="stats-grid">
            <div class="stat-item" v-for="stat in accountStats" :key="stat.label">
              <div class="stat-icon">{{ stat.icon }}</div>
              <div class="stat-content">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-desc">{{ stat.desc }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="security-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">后端接口待接入</span>
          </template>

          <div class="todo-list">
            <div class="todo-item">
              <strong>GET /users/profile</strong>
              <span>加载最新个人资料</span>
            </div>
            <div class="todo-item">
              <strong>PUT /users/profile</strong>
              <span>保存用户名和手机号</span>
            </div>
            <div class="todo-item">
              <strong>PUT /users/password</strong>
              <span>完成密码修改</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const userInfo = ref({
  id: null,
  username: '',
  email: '',
  phone: '',
  role: 'USER'
})

const editForm = ref({
  username: '',
  email: '',
  phone: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const accountStats = computed(() => [
  { icon: '📧', label: '登录邮箱', value: userInfo.value.email || '未获取', desc: '来自登录返回信息' },
  { icon: '📱', label: '手机号', value: userInfo.value.phone || '未填写', desc: '后续可由个人资料接口维护' },
  { icon: '🪪', label: '用户角色', value: userInfo.value.role || 'USER', desc: '决定菜单与权限范围' },
  { icon: '🆔', label: '用户 ID', value: userInfo.value.id ?? '-', desc: '如果登录返回中包含则直接展示' }
])

onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = () => {
  const localUser = localStorage.getItem('userInfo')
  if (!localUser) return

  try {
    const parsed = JSON.parse(localUser)
    userInfo.value = {
      ...userInfo.value,
      ...parsed
    }
    editForm.value = {
      username: parsed.username || '',
      email: parsed.email || '',
      phone: parsed.phone || ''
    }
  } catch (error) {
    console.error('解析本地用户信息失败:', error)
  }
}

const handleSaveProfile = () => {
  if (!editForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }

  ElMessage.info('后端接口待实现：PUT /users/profile')
}

const handleChangePassword = () => {
  if (!passwordForm.value.oldPassword) {
    ElMessage.warning('请输入旧密码')
    return
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  ElMessage.info('后端接口待实现：PUT /users/password')
}
</script>

<style scoped lang="scss">
.user-profile-container {
  padding: 0;
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2f4f4f 0%, #3a6363 100%);
  border-radius: 12px;
  color: white;
}

.page-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-subtitle {
  margin: 0;
  font-size: 12px;
  opacity: 0.85;
}

.main-layout {
  display: flex;
  gap: 16px;
}

.left-panel,
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-avatar {
  background: linear-gradient(135deg, #2f4f4f, #4a7c7c);
  color: white;
  font-weight: 700;
  font-size: 28px;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.profile-email {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 10px;
  background: #f7f9fc;
}

.stat-icon {
  font-size: 20px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 4px 0;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f9fc;
  color: #606266;
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
