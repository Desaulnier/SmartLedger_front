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
        <el-form-item label="用户名">
          <el-input placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select placeholder="请选择状态" clearable>
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card shadow="hover">
      <el-table :data="users" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="monthlyAllowance" label="月生活费" width="120">
          <template #default="{ row }">
            ¥{{ row.monthlyAllowance }}
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small">查看详情</el-button>
            <el-button :type="row.status === 'active' ? 'warning' : 'success'" text size="small">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" text size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          layout="total, prev, pager, next"
          :total="100"
          :page-size="10"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@edu.cn', phone: '138****1234', monthlyAllowance: 2000, registerTime: '2026-03-01 10:30:00', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@edu.cn', phone: '139****5678', monthlyAllowance: 1500, registerTime: '2026-03-05 14:20:00', status: 'active' },
  { id: 3, name: '王五', email: 'wangwu@edu.cn', phone: '137****9012', monthlyAllowance: 2500, registerTime: '2026-03-10 09:15:00', status: 'active' },
  { id: 4, name: '赵六', email: 'zhaoliu@edu.cn', phone: '136****3456', monthlyAllowance: 1800, registerTime: '2026-03-15 16:45:00', status: 'disabled' },
  { id: 5, name: '孙七', email: 'sunqi@edu.cn', phone: '135****7890', monthlyAllowance: 2200, registerTime: '2026-03-20 11:30:00', status: 'active' }
])
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
