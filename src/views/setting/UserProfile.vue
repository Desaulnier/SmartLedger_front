<template>
  <div class="user-profile-container">
    <div class="page-header fade-in-up">
      <div class="header-content">
        <h2 class="page-title">
          <span class="title-icon">👤</span>
          个人中心
        </h2>
        <p class="page-subtitle">维护你的基础资料、头像和登录安全信息</p>
      </div>
    </div>

    <div class="main-layout">
      <div class="left-panel">
        <el-card class="info-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">基础资料</span>
          </template>

          <div class="profile-header">
            <div class="avatar-wrapper">
              <el-avatar :size="92" :src="avatarSrc" class="profile-avatar">
                {{ displayInitial }}
              </el-avatar>
              <button class="avatar-edit-btn" type="button" @click="triggerAvatarSelect">
                更换头像
              </button>
              <input
                ref="avatarInputRef"
                type="file"
                accept="image/*"
                class="avatar-input"
                @change="handleAvatarChange"
              />
            </div>

            <div class="profile-info">
              <div class="profile-name">{{ userInfo.username || '未设置用户名' }}</div>
              <div class="profile-email">{{ userInfo.email || '暂无邮箱信息' }}</div>
              <div class="profile-tags">
                <el-tag size="small" type="success">{{ roleLabel }}</el-tag>
                <el-tag size="small" effect="plain">{{ statusLabel }}</el-tag>
              </div>
            </div>
          </div>

          <el-form :model="editForm" label-width="88px" class="profile-form">
            <el-form-item label="用户名">
              <el-input
                v-model="editForm.username"
                maxlength="20"
                placeholder="请输入用户名"
              />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="editForm.email" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input
                v-model="editForm.phone"
                maxlength="11"
                placeholder="请输入手机号"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                native-type="button"
                :loading="saving"
                @click="handleSaveProfile"
              >
                保存资料
              </el-button>
              <el-button native-type="button" @click="handleResetProfile">
                重置修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="password-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">修改密码</span>
          </template>

          <el-form :model="passwordForm" label-width="88px" class="profile-form">
            <el-form-item label="旧密码">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入旧密码"
              />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入 6 到 20 位新密码"
              />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="warning"
                native-type="button"
                :loading="changingPassword"
                @click="handleChangePassword"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div class="right-panel">
        <el-card class="stats-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">当前账号信息</span>
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

        <el-card class="tips-card fade-in-up" shadow="hover">
          <template #header>
            <div class="card-header-with-action">
              <span class="card-title">我的账户</span>
              <el-button type="primary" size="small" @click="showAddAccountDialog">
                <el-icon><Plus /></el-icon>
                添加账户
              </el-button>
            </div>
          </template>

          <div v-if="accountList.length === 0" class="empty-accounts">
            <div class="empty-icon">💳</div>
            <p class="empty-text">暂无账户</p>
            <p class="empty-hint">点击右上角"添加账户"开始管理</p>
          </div>

          <div v-else class="account-list">
            <div
              v-for="account in accountList"
              :key="account.id"
              class="account-item"
              :class="{ 'is-default': account.isDefault === 1 }"
            >
              <div class="account-info">
                <div class="account-name-wrapper">
                  <span class="account-icon">{{ getAccountIcon(account.accountType) }}</span>
                  <span class="account-name">{{ account.accountName }}</span>
                  <el-tag v-if="account.isDefault === 1" size="small" type="success" effect="dark">
                    默认
                  </el-tag>
                </div>
                <div class="account-balance">
                  <span class="balance-label">余额：</span>
                  <span class="balance-value">¥{{ formatBalance(account.balance) }}</span>
                </div>
                <div class="account-type">{{ getAccountTypeName(account.accountType) }}</div>
              </div>
              <div class="account-actions">
                <el-button
                  v-if="account.isDefault !== 1"
                  size="small"
                  type="warning"
                  plain
                  @click="handleSetDefault(account.id)"
                >
                  设为默认
                </el-button>
                <el-button size="small" @click="handleEditAccount(account)">
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  plain
                  @click="handleDeleteAccount(account.id, account.accountName)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <el-dialog
          v-model="accountDialogVisible"
          :title="accountDialogTitle"
          width="500px"
          destroy-on-close
        >
          <el-form
            ref="accountFormRef"
            :model="accountForm"
            :rules="accountRules"
            label-width="80px"
          >
            <el-form-item label="账户名称" prop="accountName">
              <el-input
                v-model="accountForm.accountName"
                placeholder="例如：支付宝、微信、银行卡"
                maxlength="20"
              />
            </el-form-item>
            <el-form-item label="账户类型" prop="accountType">
              <el-select v-model="accountForm.accountType" placeholder="请选择账户类型" style="width: 100%">
                <el-option label="银行卡" value="BANK_CARD" />
                <el-option label="支付宝" value="ALIPAY" />
                <el-option label="微信" value="WECHAT" />
                <el-option label="现金" value="CASH" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="accountForm.remark"
                type="textarea"
                :rows="3"
                placeholder="选填，可记录卡号后四位等信息"
                maxlength="100"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="accountDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="savingAccount" @click="handleSaveAccount">
              确定
            </el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { getAccountList, createAccount, updateAccount, deleteAccount, setDefaultAccount } from '@/api/accounts'

const avatarInputRef = ref(null)
const saving = ref(false)
const changingPassword = ref(false)
const accountList = ref([])
const accountDialogVisible = ref(false)
const accountDialogTitle = ref('添加账户')
const savingAccount = ref(false)
const accountFormRef = ref(null)
const editingAccountId = ref(null)

const userInfo = ref({
  id: null,
  username: '',
  email: '',
  phone: '',
  role: 'USER',
  status: 'ACTIVE',
  avatarUrl: ''
})

const editForm = ref({
  username: '',
  email: '',
  phone: '',
  avatarUrl: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const accountForm = ref({
  accountName: '',
  accountType: '',
  remark: ''
})

const accountRules = {
  accountName: [
    { required: true, message: '请输入账户名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  accountType: [
    { required: true, message: '请选择账户类型', trigger: 'change' }
  ]
}

const avatarSrc = computed(() => userInfo.value.avatarUrl || '')

const displayInitial = computed(() => {
  const name = userInfo.value.username || userInfo.value.email || 'U'
  return name.charAt(0).toUpperCase()
})

const roleLabel = computed(() => {
  return userInfo.value.role === 'ADMIN' ? '管理员' : '普通用户'
})

const statusLabel = computed(() => {
  switch (userInfo.value.status) {
    case 'ACTIVE':
      return '正常'
    case 'PENDING':
      return '待审核'
    case 'DISABLED':
      return '已禁用'
    case 'BANNED':
      return '已封禁'
    default:
      return userInfo.value.status || '未知状态'
  }
})

const accountStats = computed(() => [
  {
    icon: '📧',
    label: '登录邮箱',
    value: userInfo.value.email || '未获取',
    desc: '来自当前登录用户信息'
  },
  {
    icon: '📱',
    label: '手机号',
    value: userInfo.value.phone || '未填写',
    desc: '可在本页直接修改并保存'
  },
  {
    icon: '🪪',
    label: '用户角色',
    value: roleLabel.value,
    desc: '决定菜单与权限范围'
  },
  {
    icon: '🆔',
    label: '用户 ID',
    value: userInfo.value.id ?? '-',
    
  }
])

onMounted(() => {
  loadUserInfo()
  loadAccountList()
})

const syncLocalUserInfo = (nextUser) => {
  localStorage.setItem('userInfo', JSON.stringify({
    ...JSON.parse(localStorage.getItem('userInfo') || '{}'),
    ...nextUser,
    name: nextUser.username
  }))
}

const loadUserInfo = async () => {
  try {
    const res = await request.get('/users/profile')
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '获取个人资料失败')
      return
    }

    const data = res.data || {}
    const normalizedUser = {
      ...userInfo.value,
      ...data,
      username: data.username || data.name || '',
      avatarUrl: data.avatarUrl || data.avatar_url || ''
    }

    userInfo.value = normalizedUser
    editForm.value = {
      username: normalizedUser.username || '',
      email: normalizedUser.email || '',
      phone: normalizedUser.phone || '',
      avatarUrl: normalizedUser.avatarUrl || ''
    }

    syncLocalUserInfo(normalizedUser)
  } catch (error) {
    console.error('获取个人资料失败:', error)
    ElMessage.error('获取个人资料失败，请稍后重试')
  }
}

const loadAccountList = async () => {
  try {
    const res = await getAccountList()
    if (res.code === 200) {
      accountList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取账户列表失败')
    }
  } catch (error) {
    console.error('获取账户列表失败:', error)
    ElMessage.error('获取账户列表失败')
  }
}

const getAccountIcon = (type) => {
  const iconMap = {
    BANK_CARD: '💳',
    ALIPAY: '🔵',
    WECHAT: '💚',
    CASH: '💵',
    OTHER: '📦'
  }
  return iconMap[type] || '📦'
}

const getAccountTypeName = (type) => {
  const nameMap = {
    BANK_CARD: '银行卡',
    ALIPAY: '支付宝',
    WECHAT: '微信',
    CASH: '现金',
    OTHER: '其他'
  }
  return nameMap[type] || '其他'
}

const formatBalance = (balance) => {
  if (!balance) return '0.00'
  return Number(balance).toFixed(2)
}

const triggerAvatarSelect = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('头像大小请控制在 2MB 以内')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await request.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '头像上传失败')
      return
    }

    const avatarUrl = res.data
    editForm.value.avatarUrl = avatarUrl
    userInfo.value.avatarUrl = avatarUrl
    ElMessage.success('头像上传成功，记得保存资料')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请稍后重试')
  } finally {
    event.target.value = ''
  }
}

const handleSaveProfile = async () => {
  const username = editForm.value.username.trim()
  const phone = editForm.value.phone.trim()

  if (!username) {
    ElMessage.warning('请输入用户名')
    return
  }

  if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.warning('手机号格式不正确')
    return
  }

  saving.value = true
  try {
    const res = await request.put('/users/profile', {
      username,
      phone,
      avatarUrl: editForm.value.avatarUrl
    })

    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '保存失败')
      return
    }

    const nextUser = {
      ...userInfo.value,
      username,
      phone,
      avatarUrl: editForm.value.avatarUrl
    }

    userInfo.value = nextUser
    syncLocalUserInfo(nextUser)
    ElMessage.success(res.message || res.msg || '个人资料更新成功')
  } catch (error) {
    console.error('保存资料失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

const handleResetProfile = () => {
  editForm.value = {
    username: userInfo.value.username || '',
    email: userInfo.value.email || '',
    phone: userInfo.value.phone || '',
    avatarUrl: userInfo.value.avatarUrl || ''
  }
  ElMessage.info('已恢复为当前保存的信息')
}

const handleChangePassword = async () => {
  if (!passwordForm.value.oldPassword) {
    ElMessage.warning('请输入旧密码')
    return
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.value.newPassword.length < 6 || passwordForm.value.newPassword.length > 20) {
    ElMessage.warning('新密码长度需在 6 到 20 位之间')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }

  changingPassword.value = true
  try {
    const res = await request.put('/users/password', {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })

    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '密码修改失败')
      return
    }

    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    ElMessage.success(res.message || res.msg || '密码修改成功')
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('密码修改失败，请稍后重试')
  } finally {
    changingPassword.value = false
  }
}

const showAddAccountDialog = () => {
  editingAccountId.value = null
  accountDialogTitle.value = '添加账户'
  accountForm.value = {
    accountName: '',
    accountType: '',
    remark: ''
  }
  accountDialogVisible.value = true
}

const handleEditAccount = (account) => {
  editingAccountId.value = account.id
  accountDialogTitle.value = '编辑账户'
  accountForm.value = {
    accountName: account.accountName,
    accountType: account.accountType,
    remark: account.remark || ''
  }
  accountDialogVisible.value = true
}

const handleSaveAccount = async () => {
  if (!accountFormRef.value) return
  
  await accountFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    savingAccount.value = true
    try {
      let res
      if (editingAccountId.value) {
        res = await updateAccount(editingAccountId.value, accountForm.value)
      } else {
        res = await createAccount(accountForm.value)
      }
      
      if (res.code === 200) {
        ElMessage.success(editingAccountId.value ? '账户更新成功' : '账户添加成功')
        accountDialogVisible.value = false
        loadAccountList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('保存账户失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    } finally {
      savingAccount.value = false
    }
  })
}

const handleSetDefault = async (id) => {
  try {
    const res = await setDefaultAccount(id)
    if (res.code === 200) {
      ElMessage.success('默认账户设置成功')
      loadAccountList()
    } else {
      ElMessage.error(res.message || '设置失败')
    }
  } catch (error) {
    console.error('设置默认账户失败:', error)
    ElMessage.error('设置失败，请稍后重试')
  }
}

const handleDeleteAccount = async (id, name) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除账户"${name}"吗？删除后不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await deleteAccount(id)
    if (res.code === 200) {
      ElMessage.success('账户已删除')
      loadAccountList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账户失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
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
  padding: 18px 22px;
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
  gap: 18px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.profile-avatar {
  background: linear-gradient(135deg, #2f4f4f, #4a7c7c);
  color: white;
  font-weight: 700;
  font-size: 30px;
  box-shadow: 0 10px 24px rgba(47, 79, 79, 0.2);
}

.avatar-edit-btn {
  border: none;
  background: #eef7f5;
  color: #2f4f4f;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #dcedea;
  }
}

.avatar-input {
  display: none;
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
  margin-bottom: 8px;
}

.profile-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.profile-form {
  margin-top: 16px;
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
  word-break: break-all;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* 账户管理相关样式 */
.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
}

.account-list {
  margin-top: 12px;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f7f9fc;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f2f5;
  }

  &.is-default {
    border: 1px solid #67c23a;
    background: #f0f9ff;
  }
}

.account-info {
  flex: 1;
}

.account-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.account-icon {
  font-size: 18px;
}

.account-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.account-balance {
  margin-bottom: 4px;
  font-size: 14px;
}

.balance-label {
  color: #909399;
}

.balance-value {
  color: #303133;
  font-weight: 600;
}

.account-type {
  font-size: 12px;
  color: #909399;
}

.account-actions {
  display: flex;
  gap: 8px;
}

/* 响应式适配 */
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>