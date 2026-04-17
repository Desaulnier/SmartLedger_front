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
          <el-input placeholder="用户名/邮箱" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select placeholder="请选择类型" clearable>
            <el-option label="支出" value="EXPENSE" />
            <el-option label="收入" value="INCOME" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账单列表 -->
    <el-card shadow="hover">
      <el-table :data="bills" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            {{ row.icon }} {{ row.category }}
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
          layout="total, prev, pager, next"
          :total="200"
          :page-size="10"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const bills = ref([
  { id: 1, userName: '张三', icon: '🍜', category: '食堂就餐', type: 'EXPENSE', amount: 12, attribute: 1, remark: '午餐', billTime: '2026-04-12' },
  { id: 2, userName: '张三', icon: '🏠', category: '家长生活费', type: 'INCOME', amount: 2000, attribute: null, remark: '4月生活费', billTime: '2026-04-01' },
  { id: 3, userName: '李四', icon: '🥤', category: '奶茶咖啡', type: 'EXPENSE', amount: 18, attribute: 3, remark: '下午奶茶', billTime: '2026-04-12' },
  { id: 4, userName: '王五', icon: '📚', category: '考研资料', type: 'EXPENSE', amount: 89, attribute: 1, remark: '数学复习全书', billTime: '2026-04-11' },
  { id: 5, userName: '赵六', icon: '🎮', category: '游戏氪金', type: 'EXPENSE', amount: 648, attribute: 3, remark: '抽卡', billTime: '2026-04-11' }
])

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

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除这笔账单吗？`, '提示', { type: 'warning' })
    // TODO 后端接口: DELETE /api/admin/bills/{id}
    ElMessage.success('删除成功')
  } catch {
    // 取消
  }
}
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
