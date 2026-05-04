<template>
  <div class="analysis-report-container">
    <div class="page-header">
      <h2 class="page-title">📊 消费分析</h2>
      <p class="page-subtitle">了解你的消费习惯，做更理性的消费者</p>
    </div>

    <!-- 月度消费概览 -->
    <el-card class="monthly-overview-card" shadow="hover" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">📅 月度消费概览</span>
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            size="small"
            @change="loadMonthlyData"
            :disabled="loading"
          />
        </div>
      </template>

      <div class="overview-stats">
        <div class="stat-item" v-for="stat in overviewStats" :key="stat.label">
          <div class="stat-icon" :class="stat.class">{{ stat.icon }}</div>
          <div class="stat-content">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value" :class="stat.valueClass">{{ stat.value }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 必需 vs 非必需消费对比 -->
    <el-card class="attribute-compare-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">🎯 消费结构分析</span>
          <span class="card-tip">三级消费属性占比，了解你的消费习惯</span>
        </div>
      </template>

      <div class="compare-chart">
        <!-- 占位图表 -->
        <div class="chart-placeholder">
          <el-icon class="chart-icon"><PieChart /></el-icon>
          <p class="chart-text">必需/非必需消费占比图</p>
          <p class="chart-hint">需要集成 ECharts 图表库</p>
        </div>
      </div>

      <div class="compare-stats">
        <div class="compare-item necessary">
          <div class="compare-label">
            <span class="label-icon">✅</span>
            <span>必需消费</span>
          </div>
          <div class="compare-bar">
            <div class="bar-fill" :style="{ width: necessaryPercent + '%' }"></div>
          </div>
          <div class="compare-value">{{ necessaryPercent }}%</div>
        </div>
        <div class="compare-item improve">
          <div class="compare-label">
            <span class="label-icon">⭐</span>
            <span>改善消费</span>
          </div>
          <div class="compare-bar">
            <div class="bar-fill" :style="{ width: improvePercent + '%' }"></div>
          </div>
          <div class="compare-value">{{ improvePercent }}%</div>
        </div>
        <div class="compare-item desire">
          <div class="compare-label">
            <span class="label-icon">🎮</span>
            <span>欲望消费</span>
          </div>
          <div class="compare-bar">
            <div class="bar-fill" :style="{ width: desirePercent + '%' }"></div>
          </div>
          <div class="compare-value">{{ desirePercent }}%</div>
        </div>
      </div>
    </el-card>

    <!-- 消费趋势分析 -->
    <el-card class="trend-analysis-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">消费趋势分析</span>
        </div>
      </template>

      <div class="trend-chart">
        <!-- 占位图表 -->
        <div class="chart-placeholder">
          <el-icon class="chart-icon"><TrendCharts /></el-icon>
          <p class="chart-text">每日消费趋势折线图</p>
          <p class="chart-hint">需要集成 ECharts 图表库</p>
        </div>
      </div>
    </el-card>

    <!-- 智能消费建议 -->
    <el-card class="smart-suggestion-card" shadow="hover" :loading="suggestionsLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">💡 智能消费建议</span>
        </div>
      </template>

      <div class="suggestion-list" v-if="suggestions.length > 0">
        <div
          class="suggestion-item"
          v-for="(suggestion, index) in suggestions"
          :key="index"
        >
          <div class="suggestion-icon">{{ suggestion.icon || '💡' }}</div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ suggestion.title }}</div>
            <div class="suggestion-text">{{ suggestion.content }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="!suggestionsLoading" class="no-suggestions">
        <el-empty description="暂无消费建议，记录更多消费数据后将为您生成个性化建议" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PieChart, TrendCharts } from '@element-plus/icons-vue'
import {
  getMonthlyAnalysis,
  getAttributeAnalysis,
  getTrendAnalysis,
  getAnalysisSuggestions
} from '@/api/analysis'

// 选中的月份
const selectedMonth = ref(new Date())

// 加载状态
const loading = ref(false)
const suggestionsLoading = ref(false)

// 月度统计数据
const monthlyStats = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  necessaryExpense: 0,
  improveExpense: 0,
  desireExpense: 0
})

// 消费属性数据
const attributeStats = ref({
  necessary: 0,
  improve: 0,
  desire: 0
})

// 智能建议列表
const suggestions = ref([])

// 总览卡片数据
const overviewStats = computed(() => [
  { icon: '💰', label: '总收入', value: `¥${monthlyStats.value.totalIncome}`, class: 'income', valueClass: '' },
  { icon: '💸', label: '总支出', value: `¥${monthlyStats.value.totalExpense}`, class: 'expense', valueClass: '' },
  {
    icon: '📈',
    label: '结余',
    value: `¥${monthlyStats.value.balance}`,
    class: 'balance',
    valueClass: monthlyStats.value.balance >= 0 ? 'positive' : 'negative'
  },
  { icon: '✅', label: '必需消费', value: `¥${monthlyStats.value.necessaryExpense}`, class: 'necessary', valueClass: '' },
  { icon: '🎮', label: '欲望消费', value: `¥${monthlyStats.value.desireExpense}`, class: 'desire', valueClass: '' }
])

// 消费属性占比
const necessaryPercent = computed(() => {
  const total = monthlyStats.value.totalExpense
  if (!total) return 0
  return Math.round((monthlyStats.value.necessaryExpense / total) * 100)
})

const improvePercent = computed(() => {
  const total = monthlyStats.value.totalExpense
  if (!total) return 0
  return Math.round((monthlyStats.value.improveExpense / total) * 100)
})

const desirePercent = computed(() => {
  const total = monthlyStats.value.totalExpense
  if (!total) return 0
  return Math.round((monthlyStats.value.desireExpense / total) * 100)
})

// 加载月度数据
const loadMonthlyData = async () => {
  try {
    loading.value = true
    const monthStr = selectedMonth.value.toISOString().slice(0, 7) // YYYY-MM格式

    const response = await getMonthlyAnalysis(monthStr)
    if (response.data) {
      monthlyStats.value = {
        totalIncome: response.data.totalIncome || 0,
        totalExpense: response.data.totalExpense || 0,
        balance: response.data.balance || 0,
        necessaryExpense: response.data.necessaryExpense || 0,
        improveExpense: response.data.improveExpense || 0,
        desireExpense: response.data.desireExpense || 0
      }
    }
  } catch (error) {
    console.error('加载月度分析数据失败:', error)
    ElMessage.warning('加载消费分析数据失败，请稍后重试')
    // 设置默认值
    monthlyStats.value = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      necessaryExpense: 0,
      improveExpense: 0,
      desireExpense: 0
    }
  } finally {
    loading.value = false
  }
}

// 加载智能建议
const loadSuggestions = async () => {
  try {
    suggestionsLoading.value = true
    const monthStr = selectedMonth.value.toISOString().slice(0, 7)

    const response = await getAnalysisSuggestions(monthStr)
    if (response.data && Array.isArray(response.data)) {
      suggestions.value = response.data
    } else {
      suggestions.value = []
    }
  } catch (error) {
    console.error('加载智能建议失败:', error)
    suggestions.value = []
  } finally {
    suggestionsLoading.value = false
  }
}

onMounted(() => {
  loadMonthlyData()
  loadSuggestions()
})
</script>

<style scoped lang="scss">
.analysis-report-container {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    margin: 0 0 6px 0;
    font-size: 22px;
    font-weight: 700;
    color: #303133;
  }

  .page-subtitle {
    margin: 0;
    font-size: 13px;
    color: #909399;
  }
}

.monthly-overview-card,
.attribute-compare-card,
.trend-analysis-card,
.smart-suggestion-card {
  margin-bottom: 20px;
  border-radius: 12px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 10px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      font-size: 32px;

      &.income { }
      &.expense { }
      &.balance { }
      &.necessary { }
      &.desire { }
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 700;
        color: #303133;

        &.positive {
          color: #67c23a;
        }

        &.negative {
          color: #f56c6c;
        }
      }
    }
  }
}

.todo-alert {
  margin-bottom: 20px;
  border-radius: 8px;
}

.compare-chart {
  margin-bottom: 24px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 10px;

  .chart-icon {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }

  .chart-text {
    font-size: 14px;
    color: #606266;
    margin: 0 0 8px 0;
  }

  .chart-hint {
    font-size: 12px;
    color: #909399;
    margin: 0;
  }
}

.compare-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .compare-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .compare-label {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 100px;
      font-size: 14px;
      color: #606266;
      font-weight: 500;

      .label-icon {
        font-size: 18px;
      }
    }

    .compare-bar {
      flex: 1;
      height: 12px;
      background: #f0f0f0;
      border-radius: 6px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.3s;
      }
    }

    &.necessary .bar-fill {
      background: linear-gradient(90deg, #67c23a, #85ce61);
    }

    &.improve .bar-fill {
      background: linear-gradient(90deg, #e6a23c, #ebb563);
    }

    &.desire .bar-fill {
      background: linear-gradient(90deg, #f56c6c, #f78989);
    }

    .compare-value {
      min-width: 50px;
      text-align: right;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .suggestion-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 10px;
    border-left: 4px solid #409eff;

    .suggestion-icon { font-size: 24px; }
    .suggestion-content { flex: 1; }
    .suggestion-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 6px; }
    .suggestion-text { font-size: 13px; color: #606266; line-height: 1.6; }
  }
}

.no-suggestions {
  padding: 40px 20px;
  text-align: center;
}
</style>
