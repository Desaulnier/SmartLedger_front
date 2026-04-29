<script setup>
import { ref } from 'vue'
import { Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const searchForm = ref({
  keyword: '',
  category: '',
  startDate: '',
  endDate: '',
  billType: ''
})

const billList = ref([
  {
    id: 1,
    amount: 15.50,
    category: '餐饮',
    billType: 'EXPENSE',
    isNecessary: true,
    remark: '食堂午餐',
    billDate: '2026-04-11 12:30:00'
  },
  {
    id: 2,
    amount: 50.00,
    category: '娱乐',
    billType: 'EXPENSE',
    isNecessary: false,
    remark: '电影票',
    billDate: '2026-04-10 19:00:00'
  },
  {
    id: 3,
    amount: 1500,
    category: '家长生活费',
    billType: 'INCOME',
    isNecessary: true,
    remark: '4月生活费',
    billDate: '2026-04-01 08:00:00'
  },
  {
    id: 4,
    amount: 35.80,
    category: '交通',
    billType: 'EXPENSE',
    isNecessary: true,
    remark: '校车通勤充值',
    billDate: '2026-04-09 10:15:00'
  },
  {
    id: 5,
    amount: 89.90,
    category: '服饰鞋包',
    billType: 'EXPENSE',
    isNecessary: false,
    remark: '新买的运动外套',
    billDate: '2026-04-08 16:30:00'
  }
])

// 分页数据
const pagination = ref({
  total: billList.value.length,
  pageSize: 10,
  currentPage: 1
})

const fetchBillList = async () =>{
  const params = {
    pageNum: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
    keyword: searchForm.value.keyword || undefined,
    category: searchForm.value.category || undefined,
    startDate: searchForm.value.startDate || undefined,
    endDate: searchForm.value.endDate || undefined,
    type: searchForm.value.type || undefined
  }
  const res = await axios.get('/api/bills/list', { params })
  if(res.data.code === 200) {
    billList.value = res.data.data.records
    pagination.value.total = res.data.data.total
  } else {
    ElMessage.error(res.data.msg || '获取账单列表失败')
  }
}

const handleSearch = () => {
  ElMessage.info('搜索功能需要后端接口支持')
  console.log('搜索：', searchForm.value)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这笔${row.type === 'EXPENSE' ? '支出' : '收入'}吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
   await axios.delete(`/api/bills/${row.id}`)
   fetchBillList()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能需要后端接口支持')
  console.log('编辑账单：', row)
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
}

const handleDateChange = (val) => {
  if (val) {
    searchForm.value.startDate = val[0]
    searchForm.value.endDate = val[1]
  } else {
    searchForm.value.startDate = ''
    searchForm.value.endDate = ''
  }
}
</script>

<template>
  <div class="history-page">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up">
      <h2 class="page-title">
        <span class="title-icon">📊</span>
        账单明细
      </h2>
      <p class="page-subtitle">查看和管理你的每一笔消费记录</p>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card fade-in-up" shadow="hover">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索备注" clearable class="search-input" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable>
            <el-option label="餐饮" value="餐饮" />
            <el-option label="交通" value="交通" />
            <el-option label="购物" value="购物" />
            <el-option label="娱乐" value="娱乐" />
            <el-option label="收入" value="收入" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
            <el-option label="支出" value="EXPENSE" />
            <el-option label="收入" value="INCOME" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
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
          <el-button @click="searchForm = { keyword: '', category: '', startDate: '', endDate: '', type: '', dateRange: null }">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账单列表 -->
    <el-card class="list-card fade-in-up" shadow="hover">
      <el-table :data="billList" style="width: 100%" :header-cell-style="{ background: '#f8f9fa', color: '#606266' }">
        <el-table-column prop="billDate" label="时间" width="180" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <span class="category-tag">{{ row.category }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.type === 'EXPENSE' ? 'danger' : 'success'" effect="light" round>
              {{ row.type === 'EXPENSE' ? '支出' : '收入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="130">
          <template #default="{ row }">
            <span :class="row.type === 'EXPENSE' ? 'expense' : 'income'">
              {{ row.type === 'EXPENSE' ? '-' : '+' }}¥{{ row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="性质" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isNecessary" type="success" size="small" effect="light">
              ✅ 必要
            </el-tag>
            <el-tag v-else type="warning" size="small" effect="light">
              🎮 非必要
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
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
      background: linear-gradient(135deg, #2F4F4F 0%, #4a7c7c 100%);
      border: none;
      box-shadow: 0 2px 8px rgba(47, 79, 79, 0.2);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(47, 79, 79, 0.3);
      }
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
      color: #F56C6C;
      font-weight: 600;
      font-size: 14px;
    }

    .income {
      color: #67C23A;
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

// 动画
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
