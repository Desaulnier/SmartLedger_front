<template>
  <div class="analysis-report-container">
    <div class="page-header">
      <h2 class="page-title">📊 消费分析</h2>
      <p class="page-subtitle">了解你的消费习惯，做更理性的消费者</p>
    </div>

    <!-- 月度消费概览 -->
    <el-card class="monthly-overview-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">📅 月度消费概览</span>
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            size="small"
            @change="loadMonthlyData"
          />
        </div>
      </template>

      <!-- TODO [后端接口]: GET /api/analysis/monthly -->
      <!-- <el-alert type="info" :closable="false" class="todo-alert">
        <template #default>
          <strong>TODO [后端接口]</strong><br>
          GET /api/analysis/monthly?month=YYYY-MM - 获取月度消费统计（总收入、总支出、分类明细等）
        </template>
      </el-alert> -->

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

      <!-- TODO [后端接口]: GET /api/analysis/attribute -->
      <!-- <el-alert
        title="TODO [后端接口]"
        type="info"
        :closable="false"
        class="todo-alert"
      >
        <template #default>
          <p>需要后端实现消费分析接口</p>
          <p>GET /api/analysis/attribute - 获取必需/非必需消费统计</p>
          <p>GET /api/analysis/trend - 获取消费趋势数据</p>
        </template>
      </el-alert> -->

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
    <el-card class="smart-suggestion-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">💡 智能消费建议</span>
        </div>
      </template>

      <!-- TODO [后端接口]: GET /api/analysis/suggestions -->
      <!-- <el-alert type="info" :closable="false" class="todo-alert">
        <template #default>
          <strong>TODO [后端接口]</strong> GET /api/analysis/suggestions
        </template>
      </el-alert> -->

      <div class="suggestion-list">
        <div class="suggestion-item">
          <div class="suggestion-icon">📊</div>
          <div class="suggestion-content">
            <div class="suggestion-title">消费结构分析</div>
            <div class="suggestion-text">本月欲望消费占比偏高（35%），建议下月控制在 20% 以内</div>
          </div>
        </div>
        <div class="suggestion-item">
          <div class="suggestion-icon">🎯</div>
          <div class="suggestion-content">
            <div class="suggestion-title">预算规划建议</div>
            <div class="suggestion-text">按照当前消费速度，预计本月将超支 200 元，建议减少非必要支出</div>
          </div>
        </div>
        <div class="suggestion-item">
          <div class="suggestion-icon">💰</div>
          <div class="suggestion-content">
            <div class="suggestion-title">节约小贴士</div>
            <div class="suggestion-text">尝试用食堂就餐替代外卖，每月可节约约 150 元</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 智能消费检测（孤立森林算法落地） -->
    <el-card class="anomaly-detect-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">🤖 智能消费检测</span>
          <el-tag type="danger" size="small" effect="dark">
            发现 {{ anomalyCount }} 笔异常消费
          </el-tag>
        </div>
      </template>

      <!-- TODO [后端接口]: 孤立森林算法 -->
      <!-- <el-alert type="info" :closable="false" class="todo-alert">
        <template #default>
          <strong>TODO [后端接口] 孤立森林算法</strong><br>
          GET /api/analysis/anomaly - 获取异常消费检测结果<br>
          算法：Isolation Forest，多维特征（金额/频率/时间/类别）异常检测
        </template>
      </el-alert> -->

      <!-- 消费健康度 -->
      <div class="health-score">
        <div class="score-circle" :class="healthScoreClass">
          <span class="score-num">{{ healthScore }}</span>
          <span class="score-label">健康分</span>
        </div>
        <div class="score-desc">
          <strong>本月消费健康度：{{ healthLevel }}</strong>
          <p>{{ healthDesc }}</p>
        </div>
      </div>

      <!-- 异常消费列表 -->
      <div class="anomaly-list">
        <div class="anomaly-item" v-for="(item, i) in anomalyBills" :key="i" :class="item.severity">
          <div class="anomaly-badge">
            <span class="badge-icon">{{ item.severity === 'high' ? '🔴' : '🟡' }}</span>
            <span class="badge-type">{{ item.type }}</span>
          </div>
          <div class="anomaly-info">
            <div class="anomaly-bill">
              <span class="bill-icon">{{ item.icon }}</span>
              <span class="bill-name">{{ item.category }}</span>
              <span class="bill-amount">¥{{ item.amount }}</span>
            </div>
            <div class="anomaly-reason">{{ item.reason }}</div>
            <div class="anomaly-time">{{ item.time }}</div>
          </div>
        </div>
      </div>

      <!-- 检测维度说明 -->
      <div class="detect-dimensions">
        <div class="dim-title">检测维度</div>
        <div class="dim-list">
          <span class="dim-tag" v-for="dim in detectDims" :key="dim">
            {{ dim }}
          </span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PieChart, TrendCharts } from '@element-plus/icons-vue'

// 选中的月份
const selectedMonth = ref(new Date())

// 月度统计数据
const monthlyStats = ref({
  totalIncome: 2000,
  totalExpense: 1500,
  balance: 500,
  necessaryExpense: 900,
  improveExpense: 375,
  desireExpense: 225
})

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

onMounted(() => {
  loadMonthlyData()
})

// 加载月度数据
const loadMonthlyData = () => {
  // TODO [后端接口]: GET /api/analysis/monthly?month=YYYY-MM
  monthlyStats.value = {
    totalIncome: 2000, totalExpense: 1500, balance: 500,
    necessaryExpense: 900, improveExpense: 375, desireExpense: 225
  }
}

// ===== 智能消费检测（孤立森林算法） =====
const healthScore = ref(72)
const healthLevel = ref('一般')
const healthDesc = ref('检测到 3 笔异常消费，主要因深夜高频外卖导致')
const anomalyCount = computed(() => anomalyBills.value.length)
const detectDims = ['金额异常', '频率异常', '时间异常', '类别异常']

const healthScoreClass = computed(() => {
  if (healthScore.value >= 80) return 'good'
  if (healthScore.value >= 60) return 'warn'
  return 'danger'
})

// 模拟异常消费数据
const anomalyBills = ref([
  { severity: 'high', type: '金额异常', icon: '🎮', category: '游戏氪金', amount: 648, reason: '远超历史平均（平时 20-50 元），孤立森林异常得分 0.92', time: '2026-04-10 23:30' },
  { severity: 'warn', type: '频率异常', icon: '🥤', category: '奶茶咖啡', amount: 18, reason: '1 小时内连续 3 笔奶茶消费，频率异常得分 0.78', time: '2026-04-09 14:00-15:00' },
  { severity: 'warn', type: '时间异常', icon: '🛵', category: '外卖溢价', amount: 45, reason: '凌晨 2:30 下单外卖，非正常消费时段', time: '2026-04-08 02:30' }
])
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

// ===== 智能消费检测（孤立森林） =====
.anomaly-detect-card {
  margin-bottom: 20px;
  border-radius: 12px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .card-title { font-size: 16px; font-weight: 600; color: #303133; }
  }

  .health-score {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 16px;

    .score-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 4px solid;
      flex-shrink: 0;

      &.good { border-color: #67c23a; background: #f0f9f0; }
      &.warn { border-color: #e6a23c; background: #fff8e1; }
      &.danger { border-color: #f56c6c; background: #ffebee; }

      .score-num { font-size: 28px; font-weight: 700; }
      .score-label { font-size: 11px; color: #909399; }
    }

    .score-desc {
      strong { font-size: 15px; color: #303133; display: block; margin-bottom: 4px; }
      p { font-size: 12px; color: #606266; margin: 0; }
    }
  }

  .anomaly-list {
    margin-bottom: 16px;

    .anomaly-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      margin-bottom: 8px;

      &.high { background: #fff5f5; border-color: #f56c6c; }
      &.warn { background: #fffdf5; border-color: #e6a23c; }

      .anomaly-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;

        .badge-icon { font-size: 18px; }
        .badge-type { font-size: 10px; color: #909399; white-space: nowrap; }
      }

      .anomaly-info { flex: 1; }

      .anomaly-bill {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;

        .bill-icon { font-size: 16px; }
        .bill-name { font-size: 13px; font-weight: 600; color: #303133; }
        .bill-amount { font-size: 14px; font-weight: 700; color: #f56c6c; margin-left: auto; }
      }

      .anomaly-reason { font-size: 11px; color: #606266; line-height: 1.4; margin-bottom: 2px; }
      .anomaly-time { font-size: 10px; color: #909399; }
    }
  }

  .detect-dimensions {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;

    .dim-title { font-size: 12px; font-weight: 600; color: #303133; margin-bottom: 8px; }

    .dim-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .dim-tag {
        padding: 4px 10px;
        background: white;
        border: 1px solid #dcdfe6;
        border-radius: 12px;
        font-size: 11px;
        color: #606266;
      }
    }
  }
}
</style>
