<template>
  <div class="admin-dashboard-container">
    <div class="page-header">
      <h2 class="page-title">数据看板</h2>
      <p class="page-subtitle">系统整体运行数据概览</p>
    </div>

    <el-row :gutter="16">
      <el-col :span="6" v-for="(card, index) in overviewCards" :key="index">
        <div class="overview-card" :class="card.class">
          <div class="card-icon">{{ card.icon }}</div>
          <div class="card-content">
            <div class="card-label">{{ card.label }}</div>
            <div class="card-value">{{ card.value }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">用户增长趋势</span>
          </template>
          <div ref="userTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">分类消费统计</span>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="recent-card">
      <template #header>
        <span class="card-title">最近注册用户</span>
      </template>
      <el-table :data="recentUsers" stripe>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="createdAt" label="注册时间" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getAdminStats, getAdminTrend, getAdminCategoryStats } from '@/api/admin'

const overviewCards = ref([
  { icon: '👤', label: '总用户数', value: '0', class: 'user-card' },
  { icon: '🧾', label: '总账单数', value: '0', class: 'bill-card' },
  { icon: '💰', label: '总消费金额', value: '¥0', class: 'amount-card' },
  { icon: '⚠️', label: '预警次数', value: '0', class: 'warning-card' }
])

const recentUsers = ref([])
const userTrendData = ref([])
const categoryStatsData = ref([])

const userTrendChartRef = ref(null)
const categoryChartRef = ref(null)
let userTrendChart = null
let categoryChart = null

const getStatusLabel = (status) => {
  const map = {
    ACTIVE: '正常',
    DISABLED: '禁用',
    PENDING: '审核中',
    BANNED: '已封禁'
  }
  return map[status] || status || '-'
}

const getStatusType = (status) => {
  const map = {
    ACTIVE: 'success',
    DISABLED: 'danger',
    PENDING: 'warning',
    BANNED: 'danger'
  }
  return map[status] || 'info'
}

const initUserTrendChart = () => {
  if (!userTrendChartRef.value) return

  userTrendChart = echarts.init(userTrendChartRef.value)

  const dates = userTrendData.value.map(item => item.date)
  const counts = userTrendData.value.map(item => item.count)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}人'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#409eff',
          width: 2
        },
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }

  userTrendChart.setOption(option)
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)

  const topCategories = [...categoryStatsData.value]
    .sort((a, b) => Number(b.expenseAmount || 0) - Number(a.expenseAmount || 0))
    .slice(0, 8)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c}'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        fontSize: 11
      }
    },
    series: [
      {
        name: '消费金额',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: topCategories.map((item, index) => ({
          name: item.categoryName || '未分类',
          value: Number(item.expenseAmount || 0),
          itemStyle: {
            color: getColorByIndex(index)
          }
        }))
      }
    ]
  }

  categoryChart.setOption(option)
}

const getColorByIndex = (index) => {
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666',
    '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
    '#ea7ccc', '#5470c6'
  ]
  return colors[index % colors.length]
}

const fetchAdminStats = async () => {
  try {
    const res = await getAdminStats()
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '获取管理员统计失败')
      return
    }
    const data = res.data || {}
    overviewCards.value[0].value = data.totalUsers != null ? String(data.totalUsers) : '0'
    overviewCards.value[1].value = data.totalBills != null ? String(data.totalBills) : '0'
    overviewCards.value[2].value = `¥${data.totalExpense != null ? data.totalExpense : '0'}`
    overviewCards.value[3].value = data.warningCount != null ? String(data.warningCount) : '0'
    recentUsers.value = data.recentUsers || []
  } catch (error) {
    console.error(error)
    ElMessage.error('获取管理员统计失败')
  }
}

const fetchUserTrend = async () => {
  try {
    const res = await getAdminTrend()
    if (res.code === 200) {
      userTrendData.value = res.data || []
      setTimeout(() => {
        initUserTrendChart()
      }, 100)
    }
  } catch (error) {
    console.error('获取用户增长趋势失败', error)
  }
}

const fetchCategoryStats = async () => {
  try {
    const res = await getAdminCategoryStats()
    if (res.code === 200) {
      categoryStatsData.value = res.data || []
      setTimeout(() => {
        initCategoryChart()
      }, 100)
    }
  } catch (error) {
    console.error('获取分类统计失败', error)
  }
}

const handleResize = () => {
  userTrendChart?.resize()
  categoryChart?.resize()
}

onMounted(() => {
  fetchAdminStats()
  fetchUserTrend()
  fetchCategoryStats()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  userTrendChart?.dispose()
  categoryChart?.dispose()
})
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
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
      font-size: 24px;
      font-weight: 700;
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
        color: #fff;
      }

    }

    &.user-card { background: linear-gradient(135deg, #409eff, #66b1ff); }
    &.bill-card { background: linear-gradient(135deg, #67c23a, #85ce61); }
    &.amount-card { background: linear-gradient(135deg, #e6a23c, #f5a623); }
    &.warning-card { background: linear-gradient(135deg, #f56c6c, #e64343); }
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .chart-container {
    height: 350px;
    width: 100%;
  }

  .recent-card {
    margin-top: 20px;
  }
}
</style>
