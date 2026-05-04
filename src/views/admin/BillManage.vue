<template>
  <div class="bill-manage-container">
    <div class="page-header">
      <h2 class="page-title">📝 账单管理</h2>
      <p class="page-subtitle">查看和管理系统账单数据</p>
    </div>

    <!-- TODO [后端接口]: GET /api/admin/bills -->
    <!-- <el-alert type="info" :closable="false" class="todo-alert">
      <template #default>
        <strong>TODO [后端接口]</strong><br>
        GET /api/admin/bills - 获取账单列表（分页、筛选）<br>
        DELETE /api/admin/bills/{id} - 删除账单<br>
        GET /api/admin/bills/stats - 获取账单统计数据
      </template>
    </el-alert> -->

    <!-- 搜索筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true">
        <el-form-item label="用户">
          <el-input v-model="searchForm.user" placeholder="用户名/邮箱" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="支出" value="EXPENSE" />
            <el-option label="收入" value="INCOME" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账单列表 -->
    <el-card shadow="hover">
      <el-table :data="bills" stripe :loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户" />
        <el-table-column prop="categoryName" label="分类" width="120">
          <template #default="{ row }">
            {{ row.categoryName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'EXPENSE' ? 'danger' : 'success'" size="small">
              {{ row.type === 'EXPENSE' ? '支出' : '收入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span :class="row.type === 'EXPENSE' ? 'expense' : 'income'">
              {{ row.type === 'EXPENSE' ? '-' : '+' }}¥{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="attribute" label="消费属性" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.attribute" :type="getAttributeType(row.attribute)" size="small">
              {{ getAttributeName(row.attribute) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column prop="billTime" label="消费时间" width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
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
import { getAdminBills, deleteAdminBill } from '@/api/admin'

const bills = ref([])
const loading = ref(false)

const searchForm = ref({
  user: '',
  type: '',
  dateRange: []
})

const pagination = ref({
  total: 0,
  pageSize: 10,
  currentPage: 1
})

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ')
  }

  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const getAttributeType = (attr) => {
  if (attr === 1) return 'success'
  if (attr === 2) return 'warning'
  return 'danger'
}

const getAttributeName = (attr) => {
  if (attr === 1) return '必需'
  if (attr === 2) return '改善'
  return '欲望'
}

const buildParams = () => {
  const params = {
    pageNum: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
    user: searchForm.value.user || undefined,
    type: searchForm.value.type || undefined,
    keyword: undefined,
    startDate: undefined,
    endDate: undefined
  }

  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    params.startDate = formatDate(searchForm.value.dateRange[0])
    params.endDate = formatDate(searchForm.value.dateRange[1])
  }

  return params
}

const fetchBills = async () => {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getAdminBills(params)
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '获取账单列表失败')
      return
    }

    const pageData = res.data || {}
    bills.value = pageData.records || []
    pagination.value.total = pageData.total || 0
  } catch (error) {
    console.error(error)
    ElMessage.error('获取账单列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchBills()
}

const handleReset = () => {
  searchForm.value = {
    user: '',
    type: '',
    dateRange: []
  }
  pagination.value.currentPage = 1
  fetchBills()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除这笔账单吗？`, '提示', { type: 'warning' })
    const res = await deleteAdminBill(row.id)
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '删除账单失败')
      return
    }
    ElMessage.success('删除成功')
    fetchBills()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.currentPage = 1
  fetchBills()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchBills()
}

onMounted(() => {
  fetchBills()
})
</script>

<style scoped lang="scss">
.bill-manage-container {
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

  .expense {
    color: #f56c6c;
    font-weight: 600;
  }

  .income {
    color: #67c23a;
    font-weight: 600;
  }
}
</style>
