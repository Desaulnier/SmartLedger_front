<template>
  <div class="admin-dashboard-container">
    <div class="page-header">
      <h2 class="page-title">📊 数据看板</h2>
      <p class="page-subtitle">系统整体运行数据概览</p>
    </div>

    <!-- TODO [后端接口]: GET /api/admin/stats -->
    <!-- <el-alert type="info" :closable="false" class="todo-alert">
      <template #default>
        <strong>TODO [后端接口]</strong><br>
        GET /api/admin/stats - 获取系统统计数据<br>
        GET /api/admin/trend - 获取用户增长趋势<br>
        GET /api/admin/category-stats - 获取分类消费统计
      </template>
    </el-alert> -->

    <!-- 总览卡片 -->
    <el-row :gutter="16">
      <el-col :span="6" v-for="(card, index) in overviewCards" :key="index">
        <div class="overview-card" :class="card.class">
          <div class="card-icon">{{ card.icon }}</div>
          <div class="card-content">
            <div class="card-label">{{ card.label }}</div>
            <div class="card-value">{{ card.value }}</div>
            <div class="card-desc">{{ card.desc }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表占位 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">📈 用户增长趋势</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="TODO: 集成 ECharts 展示用户增长趋势图" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">📊 分类消费统计</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="TODO: 集成 ECharts 展示分类消费占比图" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近用户 -->
    <el-card shadow="hover" class="recent-card">
      <template #header>
        <span class="card-title">👥 最近注册用户</span>
      </template>
      <el-table :data="recentUsers" stripe>
        <el-table-column prop="name" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="registerTime" label="注册时间" />
        <el-table-column label="状态">
          <template #default>
            <el-tag type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const overviewCards = ref([
  { icon: '👥', label: '总用户数', value: '1,234', desc: '本月新增 +56', class: 'user-card' },
  { icon: '📝', label: '总账单数', value: '45,678', desc: '本月新增 +3,456', class: 'bill-card' },
  { icon: '💰', label: '总消费金额', value: '¥123,456', desc: '本月 ¥23,456', class: 'amount-card' },
  { icon: '⚠️', label: '预警次数', value: '567', desc: '本月 +89', class: 'warning-card' }
])

const recentUsers = ref([
  { name: '张三', email: 'zhangsan@edu.cn', registerTime: '2026-04-12 10:30:00' },
  { name: '李四', email: 'lisi@edu.cn', registerTime: '2026-04-12 09:15:00' },
  { name: '王五', email: 'wangwu@edu.cn', registerTime: '2026-04-11 18:20:00' },
  { name: '赵六', email: 'zhaoliu@edu.cn', registerTime: '2026-04-11 15:45:00' }
])
</script>

<style scoped lang="scss">
.admin-dashboard-container {
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

  .overview-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 16px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .card-icon {
      font-size: 40px;
    }

    .card-content {
      .card-label {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 4px;
      }

      .card-value {
        font-size: 22px;
        font-weight: 700;
        color: white;
      }

      .card-desc {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }
    }

    &.user-card { background: linear-gradient(135deg, #409eff, #66b1ff); }
    &.bill-card { background: linear-gradient(135deg, #67c23a, #85ce61); }
    &.amount-card { background: linear-gradient(135deg, #e6a23c, #f5a623); }
    &.warning-card { background: linear-gradient(135deg, #f56c6c, #e64343); }
  }

  .chart-row {
    margin-bottom: 20px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .recent-card {
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
