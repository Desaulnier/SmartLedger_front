<template>
  <div class="analysis-report-container">
    <div class="page-header">
      <h2 class="page-title">消费分析</h2>
      <p class="page-subtitle">了解你的消费习惯，做更理性的消费者</p>
    </div>

    <el-card class="monthly-overview-card" shadow="hover" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">月度消费概览</span>
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            value-format="YYYY-MM"
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

    <el-card class="attribute-compare-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">消费结构分析</span>
          <span class="card-tip">三级消费属性占比，了解你的消费习惯</span>
        </div>
      </template>

      <div ref="attributeChartRef" style="width: 100%; height: 350px;"></div>

      <div class="compare-stats">
        <div class="compare-item necessary">
          <div class="compare-label">
            <span class="label-icon">✓</span>
            <span>必需消费</span>
          </div>
          <div class="compare-bar">
            <div class="bar-fill" :style="{ width: necessaryPercent + '%' }"></div>
          </div>
          <div class="compare-value">{{ necessaryPercent }}%</div>
        </div>

        <div class="compare-item improve">
          <div class="compare-label">
            <span class="label-icon">★</span>
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

    <el-card class="trend-analysis-card" shadow="hover" :loading="trendLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">消费趋势分析</span>
          <span class="card-tip">每日支出波动情况</span>
        </div>
      </template>

      <div ref="trendChartRef" style="width: 100%; height: 350px;"></div>
    </el-card>

    <el-card class="smart-suggestion-card" shadow="hover" :loading="suggestionsLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">智能消费建议</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  getMonthlyAnalysis,
  getTrendAnalysis,
  getAnalysisSuggestions
} from '@/api/analysis'

// 处理图表重置
const handleResize = () => {
  attributeChart?.resize()
  trendChart?.resize()
}

const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const selectedMonth = ref(getCurrentMonth())

const loading = ref(false)
const trendLoading = ref(false)
const suggestionsLoading = ref(false)

const monthlyStats = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  necessaryExpense: 0,
  improveExpense: 0,
  desireExpense: 0
})
const resetMonthlyStats = () => {
  monthlyStats.value = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    necessaryExpense: 0,
    improveExpense: 0,
    desireExpense: 0
  }
}


const suggestions = ref([])

const attributeChartRef = ref(null)
const trendChartRef = ref(null)
let attributeChart = null
let trendChart = null

const formatMoney = (value) => {
  const num = Number(value || 0)
  return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const getMonthStr = () => {
  if (!selectedMonth.value) return getCurrentMonth()
  if (typeof selectedMonth.value === 'string') return selectedMonth.value.slice(0, 7)

  const date = new Date(selectedMonth.value)
  if (Number.isNaN(date.getTime())) return getCurrentMonth()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const overviewStats = computed(() => [
  { icon: '💰', label: '总收入', value: `¥${formatMoney(monthlyStats.value.totalIncome)}`, class: 'income', valueClass: '' },
  { icon: '📤', label: '总支出', value: `¥${formatMoney(monthlyStats.value.totalExpense)}`, class: 'expense', valueClass: '' },
  {
    icon: '📈',
    label: '结余',
    value: `¥${formatMoney(monthlyStats.value.balance)}`,
    class: 'balance',
    valueClass: Number(monthlyStats.value.balance) >= 0 ? 'positive' : 'negative'
  },
  { icon: '✓', label: '必需消费', value: `¥${formatMoney(monthlyStats.value.necessaryExpense)}`, class: 'necessary', valueClass: '' },
  { icon: '🎮', label: '欲望消费', value: `¥${formatMoney(monthlyStats.value.desireExpense)}`, class: 'desire', valueClass: '' }
])

const necessaryPercent = computed(() => {
  const total = Number(monthlyStats.value.totalExpense || 0)
  if (!total) return 0
  return Math.round((Number(monthlyStats.value.necessaryExpense || 0) / total) * 100)
})

const improvePercent = computed(() => {
  const total = Number(monthlyStats.value.totalExpense || 0)
  if (!total) return 0
  return Math.round((Number(monthlyStats.value.improveExpense || 0) / total) * 100)
})

const desirePercent = computed(() => {
  const total = Number(monthlyStats.value.totalExpense || 0)
  if (!total) return 0
  return Math.round((Number(monthlyStats.value.desireExpense || 0) / total) * 100)
})

const initCharts = () => {
  if (attributeChartRef.value) {
    attributeChart = echarts.init(attributeChartRef.value)
  }
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
}

const renderAttributeChart = () => {
  if (!attributeChart) return

  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: '消费属性',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        data: [
          { value: Number(monthlyStats.value.necessaryExpense || 0), name: '必需消费', itemStyle: { color: '#67c23a' } },
          { value: Number(monthlyStats.value.improveExpense || 0), name: '改善消费', itemStyle: { color: '#e6a23c' } },
          { value: Number(monthlyStats.value.desireExpense || 0), name: '欲望消费', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }

  attributeChart.setOption(option)
}

const renderTrendChart = (data) => {
  if (!trendChart) return

  const safeData = Array.isArray(data) ? data : []
  const dates = safeData.map(item => item.date)
  const amounts = safeData.map(item => item.amount)

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: { type: 'value', name: '金额(元)' },
    series: [
      {
        name: '每日支出',
        type: 'line',
        smooth: true,
        data: amounts,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        itemStyle: { color: '#409eff' }
      }
    ]
  }

  trendChart.setOption(option)
}

const loadTrendData = async (monthStr) => {
  try {
    trendLoading.value = true
    const response = await getTrendAnalysis(monthStr)

    if (response?.code === 200 && Array.isArray(response.data)) {
      renderTrendChart(response.data)
    } else {
      renderTrendChart([])
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    renderTrendChart([])
  } finally {
    trendLoading.value = false
  }
}

const loadSuggestions = async (monthStr) => {
  try {
    suggestionsLoading.value = true
    const response = await getAnalysisSuggestions(monthStr)

    if (response?.code === 200 && Array.isArray(response.data)) {
      suggestions.value = response.data.map((item, index) => {
        if (typeof item === 'string') {
          return {
            title: `建议 ${index + 1}`,
            content: item,
            icon: '💡'
          }
        }
        return item
      })
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

const loadMonthlyData = async () => {
  try {
    loading.value = true
    const monthStr = getMonthStr()

    const response = await getMonthlyAnalysis(monthStr)

    if (response?.code === 200 && response.data) {
      monthlyStats.value = {
        totalIncome: Number(response.data.totalIncome || 0),
        totalExpense: Number(response.data.totalExpense || 0),
        balance: Number(response.data.balance || 0),
        necessaryExpense: Number(response.data.necessaryExpense || 0),
        improveExpense: Number(response.data.improveExpense || 0),
        desireExpense: Number(response.data.desireExpense || 0)
      }
    } else {
      resetMonthlyStats()
    }

    renderAttributeChart()
    await loadTrendData(monthStr)
    await loadSuggestions(monthStr)
  } catch (error) {
    console.error('加载月度分析数据失败:', error)
    resetMonthlyStats()
    renderAttributeChart()
    await loadTrendData(getMonthStr())
    suggestions.value = []
    ElMessage.warning('加载消费分析数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initCharts()
  loadMonthlyData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.analysis-report-container { padding: 0; }
.page-header { margin-bottom: 20px; .page-title { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #303133; } .page-subtitle { margin: 0; font-size: 13px; color: #909399; } }
.monthly-overview-card, .attribute-compare-card, .trend-analysis-card, .smart-suggestion-card { margin-bottom: 20px; border-radius: 12px; .card-header { display: flex; align-items: center; justify-content: space-between; .card-title { font-size: 16px; font-weight: 600; color: #303133; } } }
.overview-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; .stat-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 10px; transition: all 0.3s; &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); } .stat-icon { font-size: 32px; } .stat-content { flex: 1; .stat-label { font-size: 13px; color: #909399; margin-bottom: 4px; } .stat-value { font-size: 18px; font-weight: 700; color: #303133; &.positive { color: #67c23a; } &.negative { color: #f56c6c; } } } } }
.compare-stats { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; .compare-item { display: flex; align-items: center; gap: 12px; .compare-label { display: flex; align-items: center; gap: 8px; min-width: 100px; font-size: 14px; color: #606266; font-weight: 500; .label-icon { font-size: 18px; } } .compare-bar { flex: 1; height: 12px; background: #f0f0f0; border-radius: 6px; overflow: hidden; .bar-fill { height: 100%; border-radius: 6px; transition: width 0.3s; } } &.necessary .bar-fill { background: linear-gradient(90deg, #67c23a, #85ce61); } &.improve .bar-fill { background: linear-gradient(90deg, #e6a23c, #ebb563); } &.desire .bar-fill { background: linear-gradient(90deg, #f56c6c, #f78989); } .compare-value { min-width: 50px; text-align: right; font-size: 14px; font-weight: 600; color: #303133; } } }
.suggestion-list { display: flex; flex-direction: column; gap: 16px; .suggestion-item { display: flex; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #409eff; .suggestion-icon { font-size: 24px; } .suggestion-content { flex: 1; } .suggestion-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 6px; } .suggestion-text { font-size: 13px; color: #606266; line-height: 1.6; } } }
.no-suggestions { padding: 40px 20px; text-align: center; }
</style>
