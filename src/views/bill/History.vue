<script setup>
import { onMounted, ref } from 'vue'
import { Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBillList, deleteBill, updateBill } from '@/api/bill'
import { getCategoryList } from '@/api/category'
import { allCategories } from '@/views/add-bill/constants'


const searchForm = ref({
  keyword: '',
  category: '',
  startDate: '',
  endDate: '',
  billType: ''
})

const dateRange = ref([])
const loading = ref(false)
const billList = ref([])
const categoryOptions = ref([])

const pagination = ref({
  total: 0,
  pageSize: 10,
  currentPage: 1
})

const categoryMap = ref({})

const editDialogVisible = ref(false)

const editForm = ref({
  id: null,
  occurTime: '',
  billType: 'EXPENSE',
  categoryId: null,
  amount: 0,
  remark: '',
  consumptionAttribute: null
})


const syncPagination = (pageData = {}) => {
  pagination.value.total = Number(pageData.total || 0)
  pagination.value.pageSize = Number(pageData.size || pagination.value.pageSize)
  pagination.value.currentPage = Number(pageData.current || pagination.value.currentPage)
}

const formatDateTime = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ')
  }

  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const getCategoryLabel = (categoryId) => {
  return categoryMap.value[categoryId] || `分类 ${categoryId ?? '-'}`
}

const getAttributeLabel = (attribute) => {
  if (attribute === 1) return '生存必需'
  if (attribute === 2) return '改善生活'
  if (attribute === 3) return '欲望消费'
  return '未标记'
}

const fetchCategoryList = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      const categories = res.data || []
      
      categoryOptions.value = categories.map(cat => ({
        id: cat.id,
        label: cat.name
      }))
      
      categoryMap.value = Object.fromEntries(
        categories.map(cat => [cat.id, cat.name])
      )
    } else {
      console.warn('获取分类列表失败，使用本地默认分类')
      useLocalCategories()
    }
  } catch (error) {
    console.error('获取分类列表失败，使用本地默认分类', error)
    useLocalCategories()
  }
}

const useLocalCategories = () => {
  categoryOptions.value = allCategories.map(cat => ({
    id: cat.id,
    label: cat.name
  }))
  
  categoryMap.value = Object.fromEntries(
    allCategories.map(cat => [cat.id, cat.name])
  )
}

const fetchBillList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      keyword: searchForm.value.keyword || undefined,
      category: searchForm.value.category || undefined,
      startDate: searchForm.value.startDate || undefined,
      endDate: searchForm.value.endDate || undefined,
      type: searchForm.value.billType || undefined
    }

    const res = await getBillList(params)
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '获取账单列表失败')
      return
    }

    const pageData = res.data || {}
    billList.value = pageData.records || []
    syncPagination(pageData)

    if (!billList.value.length && pagination.value.currentPage > 1 && pagination.value.total > 0) {
      pagination.value.currentPage -= 1
      await fetchBillList()
    }
  } catch (error) {
    console.error(error)
    billList.value = []
    pagination.value.total = 0
    ElMessage.error('获取账单列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchBillList()
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    category: '',
    startDate: '',
    endDate: '',
    billType: ''
  }
  dateRange.value = []
  pagination.value.currentPage = 1
  fetchBillList()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条账单吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await deleteBill(row.id)
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '删除失败')
      return
    }

    ElMessage.success('删除成功')
    if (billList.value.length === 1 && pagination.value.currentPage > 1) {
      pagination.value.currentPage -= 1
    }
    fetchBillList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleEdit = (row) => {
  editForm.value = {
    id: row.id,
    occurTime: row.occurTime ? String(row.occurTime).replace(' ', 'T') : '',
    billType: row.billType || 'EXPENSE',
    categoryId: row.categoryId ?? null,
    amount: Number(row.amount || 0),
    remark: row.remark || '',
    consumptionAttribute: row.consumptionAttribute ?? null
  }
  editDialogVisible.value = true
}
const handleUpdateBill = async () => {// 编辑账单
  try {
    const payload = {
      occurTime: editForm.value.occurTime,
      billType: editForm.value.billType,
      categoryId: editForm.value.categoryId,
      amount: editForm.value.amount,
      remark: editForm.value.remark,
      consumptionAttribute: editForm.value.consumptionAttribute
    }

    const res = await updateBill(editForm.value.id, payload)
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '编辑失败')
      return
    }

    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    fetchBillList()
  } catch (error) {
    console.error(error)
    ElMessage.error('编辑失败，请稍后重试')
  }
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.currentPage = 1
  fetchBillList()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchBillList()
}

const handleDateChange = (val) => {
  if (val && val.length === 2) {
    searchForm.value.startDate = val[0]
    searchForm.value.endDate = val[1]
    return
  }

  searchForm.value.startDate = ''
  searchForm.value.endDate = ''
}

onMounted(() => {
  fetchCategoryList()
  fetchBillList()
})
</script>

<template>
  <div class="history-page">
    <div class="page-header fade-in-up">
      <h2 class="page-title">
        <span class="title-icon">📒</span>
        账单明细
      </h2>
      <p class="page-subtitle">查看和管理你已经录入的每一笔账单</p>
    </div>

    <el-card class="search-card fade-in-up" shadow="hover">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索备注"
            clearable
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.label"
              :value="String(item.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.billType" placeholder="全部类型" clearable>
            <el-option label="支出" value="EXPENSE" />
            <el-option label="收入" value="INCOME" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            @change="handleDateChange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card fade-in-up" shadow="hover">
      <el-table
        :data="billList"
        :loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#f8f9fa', color: '#606266' }"
      >
        <el-table-column label="时间" width="190">
          <template #default="{ row }">
            {{ formatDateTime(row.occurTime) }}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="140">
          <template #default="{ row }">
            <span class="category-tag">{{ getCategoryLabel(row.categoryId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.billType === 'EXPENSE' ? 'danger' : 'success'" effect="light" round>
              {{ row.billType === 'EXPENSE' ? '支出' : '收入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="130">
          <template #default="{ row }">
            <span :class="row.billType === 'EXPENSE' ? 'expense' : 'income'">
              {{ row.billType === 'EXPENSE' ? '-' : '+' }}¥{{ Number(row.amount || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="性质" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="light">
              {{ getAttributeLabel(row.consumptionAttribute) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <el-dialog v-model="editDialogVisible" title="编辑账单" width="520px">
  <el-form :model="editForm" label-width="80px">
    <el-form-item label="时间">
      <el-date-picker
        v-model="editForm.occurTime"
        type="datetime"
        value-format="YYYY-MM-DDTHH:mm:ss"
        format="YYYY-MM-DD HH:mm:ss"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="类型">
      <el-select v-model="editForm.billType" style="width: 100%">
        <el-option label="支出" value="EXPENSE" />
        <el-option label="收入" value="INCOME" />
      </el-select>
    </el-form-item>

    <el-form-item label="分类">
      <el-select v-model="editForm.categoryId" style="width: 100%">
        <el-option
          v-for="item in categoryOptions"
          :key="item.id"
          :label="item.label"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="金额">
      <el-input-number
        v-model="editForm.amount"
        :min="0.01"
        :precision="2"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="性质">
      <el-select v-model="editForm.consumptionAttribute" clearable style="width: 100%">
        <el-option label="生存必需" :value="1" />
        <el-option label="改善生活" :value="2" />
        <el-option label="欲望消费" :value="3" />
      </el-select>
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="editForm.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="editDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="handleUpdateBill">保存</el-button>
  </template>
</el-dialog>

  </div>
</template>

<style lang="scss" scoped>
.history-page {
  .page-header {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #303133;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .title-icon {
        font-size: 26px;
      }
    }

    .page-subtitle {
      font-size: 13px;
      color: #909399;
      margin: 0;
    }
  }

  .search-card {
  margin-bottom: 20px;
  border-radius: 12px;

  .search-input {
    width: 180px;
  }

  .search-btn {
    background: linear-gradient(135deg, #2f4f4f 0%, #4a7c7c 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(47, 79, 79, 0.2);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(47, 79, 79, 0.3);
    }
  }
  :deep(.el-select) {
    height: 36px !important;
    width: 100px !important; // 原来没宽度，现在设160px，可改180/200px
  }

  :deep(.el-select) {
    height: 36px !important;
  }

  :deep(.el-select__wrapper) {
    align-items: center !important;
    padding: 0 12px !important;
    min-height: 36px !important;
  }

  :deep(.el-select__placeholder),
  :deep(.el-select__value) {
    line-height: 34px !important;
    font-size: 14px !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }
}

  .list-card {
    border-radius: 12px;

    .category-tag {
      padding: 4px 10px;
      background: #f0f0f0;
      border-radius: 12px;
      font-size: 12px;
      color: #606266;
    }

    .expense {
      color: #f56c6c;
      font-weight: 600;
      font-size: 14px;
    }

    .income {
      color: #67c23a;
      font-weight: 600;
      font-size: 14px;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.fade-in-up:nth-child(2) { animation-delay: 0.1s; }
.fade-in-up:nth-child(3) { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
