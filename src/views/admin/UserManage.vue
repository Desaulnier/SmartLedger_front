<template>
  <div class="user-manage-container">
    <div class="page-header">
      <h2 class="page-title">👥 用户管理</h2>
      <p class="page-subtitle">查看和管理系统用户信息</p>
    </div>

    <!-- TODO [后端接口]: GET /api/admin/users -->
    <!-- <el-alert type="info" :closable="false" class="todo-alert">
      <template #default>
        <strong>TODO [后端接口]</strong><br>
        GET /api/admin/users - 获取用户列表（分页）<br>
        PUT /api/admin/users/{id}/status - 修改用户状态<br>
        DELETE /api/admin/users/{id} - 删除用户
      </template>
    </el-alert> -->

    <!-- 搜索筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true">
        <el-form-item label="用户名/邮箱">
          <el-input v-model="searchForm.keyword" placeholder="请输入用户名或邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="ACTIVE" />
            <el-option label="禁用" value="DISABLED" />
            <el-option label="审核中" value="PENDING" />
            <el-option label="已封禁" value="BANNED" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
            <el-option label="普通用户" value="USER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card shadow="hover">
      <el-table :data="userList" stripe :loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="monthlyLimit" label="月预算" width="120">
          <template #default="{ row }">
            ¥{{ row.monthlyLimit || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small">查看详情</el-button>
            <el-button 
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'" 
              text size="small"
              @click="handleStatusChange(row)"
            >
              {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          layout="total, prev, pager, next, sizes"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const userList = ref([])

const searchForm = ref({
  keyword: '',
  status: '',
  role: ''
})

const pagination = ref({
  total: 0,
  pageSize: 10,
  currentPage: 1
})

const formatDateTime = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ')
  }

  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const getStatusLabel = (status) => {
  const statusMap = {
    ACTIVE: '正常',
    DISABLED: '禁用',
    PENDING: '审核中',
    BANNED: '已封禁'
  }
  return statusMap[status] || status || '-'
}

const getStatusType = (status) => {
  const typeMap = {
    ACTIVE: 'success',
    DISABLED: 'danger',
    PENDING: 'warning',
    BANNED: 'danger'
  }
  return typeMap[status] || 'info'
}

const fetchUserList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      keyword: searchForm.value.keyword || undefined,
      status: searchForm.value.status || undefined,
      role: searchForm.value.role || undefined
    }

    const res = await request.get('/users/admin/list', { params })
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '获取用户列表失败')
      return
    }

    const pageData = res.data || {}
    userList.value = pageData.records || []
    pagination.value.total = pageData.total || 0
  } catch (error) {
    console.error(error)
    ElMessage.error('获取用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchUserList()
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    role: ''
  }
  pagination.value.currentPage = 1
  fetchUserList()
}

const handleStatusChange = (row) => {
  ElMessage.info(`修改用户状态接口待实现：用户 ID ${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.username} (${row.email}) 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.info(`删除用户接口待实现：用户 ID ${row.id}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.currentPage = 1
  fetchUserList()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchUserList()
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.user-manage-container {
  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 4px 0;
    }

    .page-subtitle {
      font-size: 13px;
      color: #909399;
      margin: 0;
    }
  }

  .todo-alert {
    margin-bottom: 20px;
    border-radius: 8px;
    font-size: 12px;
  }

  .search-card {
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
