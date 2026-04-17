<template>
  <div class="user-profile-container">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up">
      <div class="header-content">
        <h2 class="page-title">
          <span class="title-icon">👤</span>
          个人中心
        </h2>
        <p class="page-subtitle">管理你的个人信息和账户设置</p>
      </div>
    </div>

    <div class="main-layout">
      <!-- 左侧：个人信息 -->
      <div class="left-panel">
        <!-- 基本信息卡片 -->
        <el-card class="info-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">📋 基本信息</span>
          </template>

          <div class="profile-header">
            <el-avatar :size="80" class="profile-avatar">
              {{ userInfo.username?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <div class="profile-info">
              <div class="profile-name">{{ userInfo.username }}</div>
              <div class="profile-email">{{ userInfo.email }}</div>
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
              <el-button type="primary" @click="handleSaveProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 修改密码 -->
        <el-card class="password-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">🔒 修改密码</span>
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
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 右侧：统计数据 -->
      <div class="right-panel">
        <!-- 本月消费统计 -->
        <el-card class="stats-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">📊 本月消费统计</span>
          </template>

          <div class="stats-grid">
            <div class="stat-item" v-for="stat in monthStats" :key="stat.label">
              <div class="stat-icon">{{ stat.icon }}</div>
              <div class="stat-content">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value" :class="stat.class">{{ stat.value }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 账户安全 -->
        <el-card class="security-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">🛡️ 账户安全</span>
          </template>

          <div class="security-list">
            <div class="security-item">
              <div class="security-info">
                <span class="security-icon">📧</span>
                <div>
                  <div class="security-label">邮箱绑定</div>
                  <div class="security-value">{{ userInfo.email }}</div>
                </div>
              </div>
              <el-tag type="success" size="small">已绑定</el-tag>
            </div>
            <div class="security-item">
              <div class="security-info">
                <span class="security-icon">📱</span>
                <div>
                  <div class="security-label">手机绑定</div>
                  <div class="security-value">{{ userInfo.phone || '未绑定' }}</div>
                </div>
              </div>
              <el-tag :type="userInfo.phone ? 'success' : 'info'" size="small">
                {{ userInfo.phone ? '已绑定' : '未绑定' }}
              </el-tag>
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

// 用户信息
const userInfo = ref({
  id: 1,
  username: 'lu_user',
  email: 'lu@example.com',
  phone: '138****1234',
  role: 'USER',
  monthlyAllowance: 2000,
  dailySurvivalCost: 30
})

// 编辑表单
const editForm = ref({
  username: userInfo.value.username,
  email: userInfo.value.email,
  phone: userInfo.value.phone
})

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 本月统计（模拟数据）
const monthStats = computed(() => [
  { icon: '💰', label: '总收入', value: '¥2000', class: 'income' },
  { icon: '💸', label: '总支出', value: '¥1450', class: 'expense' },
  { icon: '📈', label: '结余', value: '¥550', class: 'balance' },
  { icon: '📅', label: '剩余天数', value: '10 天', class: 'days' }
])

onMounted(() => {
  loadUserInfo()
})

// 加载用户信息
const loadUserInfo = () => {
  // TODO [后端接口]: GET /api/user/profile
  // userInfo.value = res.data
}

// 保存个人信息
const handleSaveProfile = () => {
  if (!editForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  // TODO [后端接口]: PUT /api/user/profile
  userInfo.value.username = editForm.value.username
  userInfo.value.phone = editForm.value.phone
  ElMessage.success('个人信息已更新')
}

// 修改密码
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
  // TODO [后端接口]: PUT /api/user/password
  ElMessage.success('密码修改成功')
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
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

// 页面头部
.page-header {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2F4F4F 0%, #3a6363 100%);
  border-radius: 12px;
  color: white;

  .header-content {
    .page-title {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      .title-icon { font-size: 24px; }
    }
    .page-subtitle { margin: 0; font-size: 12px; opacity: 0.85; }
  }
}

// 主布局
.main-layout {
  display: flex;
  gap: 16px;

  .left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
}

// 通用卡片
.el-card {
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
}

// 基本信息
.info-card {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .profile-avatar {
      background: linear-gradient(135deg, #2F4F4F, #4a7c7c);
      color: white;
      font-weight: 700;
      font-size: 28px;
    }

    .profile-info {
      flex: 1;

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
    }
  }

  .profile-form {
    :deep(.el-form-item) {
      margin-bottom: 14px;
    }
  }
}

// 修改密码
.password-card {
  .password-form {
    :deep(.el-form-item) {
      margin-bottom: 14px;
    }
  }
}

// 消费统计
.stats-card {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;

      .stat-icon { font-size: 24px; }

      .stat-content {
        flex: 1;
        .stat-label { font-size: 11px; color: #909399; margin-bottom: 2px; }
        .stat-value { font-size: 16px; font-weight: 700; color: #303133; }
      }
    }
  }
}

// 账户安全
.security-card {
  .security-list {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 8px;

      &:last-child { margin-bottom: 0; }

      .security-info {
        display: flex;
        align-items: center;
        gap: 10px;

        .security-icon { font-size: 20px; }

        .security-label { font-size: 13px; font-weight: 600; color: #303133; }
        .security-value { font-size: 12px; color: #909399; }
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .main-layout { flex-direction: column; }
}
</style>
