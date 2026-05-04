<template>
  <div class="warning-center-container">
    <!-- 页面头部：紧凑一行 -->
    <div class="page-header fade-in-up">
      <div class="header-left">
        <h2 class="page-title">
          <span class="title-icon pulse">🚨</span>
          超前消费预警
        </h2>
        <p class="page-subtitle">记账前先问系统："这笔钱该不该花？"</p>
      </div>
      <el-tag :type="statusTagType" size="large" class="status-tag" :class="{ pulse: budgetUsage >= 80 }">
        {{ statusText }}
      </el-tag>
    </div>

    <div class="main-layout">
      <!-- 左侧：消费前预警（核心功能，占据主要位置） -->
      <div class="left-panel">
        <!-- 消费前预警表单 + 结果 -->
        <el-card class="pre-warning-card fade-in-up" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">💡 消费前预警</span>
              <span class="card-tip">输入金额和分类，系统帮你判断</span>
            </div>
          </template>

          <!-- 预警表单 -->
          <div class="pre-warning-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">消费金额</label>
                <el-input-number
                  v-model="checkForm.amount"
                  :min="0"
                  :precision="2"
                  placeholder="0.00"
                  class="amount-input"
                >
                  <template #prepend>¥</template>
                </el-input-number>
              </div>
              <div class="form-group">
                <label class="form-label">消费分类</label>
                <el-select v-model="checkForm.categoryId" placeholder="选择分类" class="category-select">
                  <el-option
                    v-for="cat in expenseCategories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  >
                    <span>{{ cat.icon }} {{ cat.name }}</span>
                    <el-tag size="small" :type="getAttributeType(cat.attribute)" style="margin-left: 8px">
                      {{ getAttributeName(cat.attribute) }}
                    </el-tag>
                  </el-option>
                </el-select>
              </div>
              <div class="form-group btn-group">
                <label class="form-label">&nbsp;</label>
                <el-button type="primary" class="check-btn" @click="checkPreWarning" :loading="checking">
                  {{ checking ? '分析中...' : '🔍 检查建议' }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 预警结果 -->
          <transition name="slide-fade">
            <div v-if="checkResult" class="check-result" :class="checkResult.level">
              <div class="result-header">
                <span class="result-icon">{{ checkResult.icon }}</span>
                <div class="result-title-area">
                  <div class="result-title">{{ checkResult.title }}</div>
                  <div class="result-level">{{ checkResult.levelText }}</div>
                </div>
              </div>
              <div class="result-body">
                <p class="result-reason">{{ checkResult.reason }}</p>
                <div class="result-suggestion">
                  <span>💡 {{ checkResult.suggestion }}</span>
                </div>
                <div class="result-details" v-if="checkResult.details">
                  <div class="detail-item" v-for="(detail, i) in checkResult.details" :key="i">
                    <span>{{ detail.label }}：</span>
                    <strong>{{ detail.value }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 快捷金额按钮 -->
          <div class="quick-amounts" v-if="!checkResult">
            <span class="quick-label">快捷输入：</span>
            <el-button
              v-for="amt in [10, 20, 50, 100, 200]"
              :key="amt"
              size="small"
              text
              class="quick-btn"
              @click="checkForm.amount = amt"
            >
              ¥{{ amt }}
            </el-button>
          </div>
        </el-card>

        <el-card class="health-card fade-in-up" shadow="hover">
  <template #header>
    <div class="card-header">
      <span class="card-title">🧠 智能消费检测</span>
      <el-tag size="small" type="danger" effect="light">
        发现 {{ anomalySummary.abnormalCount }} 笔异常消费
      </el-tag>
    </div>
  </template>

  <div class="smart-hints">
    <div
      v-for="(item, index) in smartDetectHints"
      :key="index"
      class="mini-hint"
    >
      <div class="mini-hint-icon">{{ item.icon }}</div>
      <div class="mini-hint-content">
        <div class="mini-hint-title">{{ item.title }}</div>
        <div class="mini-hint-text">{{ item.content }}</div>
      </div>
    </div>
  </div>

  <div class="detect-overview">
    <div class="score-ring" :class="anomalyScoreClass">
      <span class="score-num">{{ detectionScore }}</span>
      <span class="score-text">稳定分</span>
    </div>

    <div class="overview-text">
      <strong>{{ anomalySummary.levelText }}</strong>
      <p>{{ anomalySummary.desc }}</p>
    </div>
  </div>

  <div class="abnormal-list" v-if="abnormalBills.length">
    <div
      class="abnormal-item"
      v-for="item in abnormalBills.slice(0, 3)"
      :key="item.id"
      :class="getAbnormalItemClass(item)"
    >
      <div class="abnormal-left">
        <span class="abnormal-dot"></span>
        <div class="abnormal-info">
          <div class="abnormal-title">
            {{ getAnomalyTypeText(item.anomalyType) }}
          </div>
          <div class="abnormal-reason">
            {{ item.anomalyReason || '该笔消费与历史模式存在偏离' }}
          </div>
          <div class="abnormal-time">{{ formatRecordTime(item.occurTime || item.createdAt) }}</div>
        </div>
      </div>

      <div class="abnormal-right">
        <div class="abnormal-amount">¥{{ formatMoney(item.amount) }}</div>
        <div class="abnormal-score">评分 {{ formatMoney(item.anomalyScore) }}</div>
      </div>
    </div>
  </div>

  <div v-else class="empty-anomaly">
    本月暂无明显异常消费记录
  </div>
</el-card>

        <!-- 预警规则说明（紧凑版） -->
        <el-card class="rules-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">📋 预警规则</span>
          </template>
          <div class="rules-grid">
            <div class="rule-item green">
              <span class="rule-icon">🟢</span>
              <div class="rule-content">
                <strong>绿灯 - 安全</strong>
                <span>预算充足，合理消费</span>
              </div>
            </div>
            <div class="rule-item yellow">
              <span class="rule-icon">🟡</span>
              <div class="rule-content">
                <strong>黄灯 - 谨慎</strong>
                <span>预算≥80%，减少非必要</span>
              </div>
            </div>
            <div class="rule-item red">
              <span class="rule-icon">🔴</span>
              <div class="rule-content">
                <strong>红灯 - 停止</strong>
                <span>已超支，停止非必要消费</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：预算状态 + 预警记录 -->
      <div class="right-panel">
        <!-- 预算状态卡片 -->
        <el-card class="status-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">📊 本月预算</span>
          </template>

          <!-- 4 个核心指标 -->
          <div class="status-grid">
            <div class="status-item" v-for="(card, i) in coreCards" :key="i">
              <div class="status-icon">{{ card.icon }}</div>
              <div class="status-info">
                <div class="status-label">{{ card.label }}</div>
                <div class="status-value">{{ card.value }}</div>
                <div class="status-desc">{{ card.desc }}</div>
              </div>
            </div>
          </div>

          <!-- 预算进度条（紧凑） -->
          <div class="mini-progress">
            <div class="progress-label">
              <span>预算使用</span>
              <span>{{ budgetUsage }}%</span>
            </div>
            <div class="progress-bar-mini">
              <div class="progress-fill-mini" :style="{ width: budgetUsage + '%', background: progressGradient }"></div>
            </div>
            <div class="progress-forecast-mini">
              <span>预计月末超支 <strong>¥{{ overForecast }}</strong></span>
            </div>
          </div>
        </el-card>
        <!-- 预警记录 -->
<el-card class="records-card fade-in-up" shadow="hover">
  <template #header>
    <div class="card-header">
      <span class="card-title">📝 预警记录</span>
      <el-button text size="small" @click="loadWarningRecords">
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>
  </template>

  <div v-loading="loadingRecords">
    <div v-if="warningRecords.length" class="records-list-pretty">
      <div
        v-for="item in warningRecords"
        :key="item.id"
        class="record-pretty-item"
        :class="getRecordClass(item)"
      >
        <span class="record-dot" :class="getRecordClass(item)"></span>

        <div class="record-main">
          <div class="record-title">{{ getRecordTitle(item) }}</div>
          <div class="record-time">{{ formatRecordTime(item.createdAt) }}</div>
        </div>

        <span class="record-pill" :class="getRecordClass(item)">
          {{ getRecordTagText(item) }}
        </span>
      </div>
    </div>

    <div v-else class="records-empty">
      <el-empty description="暂无可显示的预警记录">
        <template #footer>
          <el-button type="primary" size="small" @click="loadWarningRecords">刷新</el-button>
        </template>
      </el-empty>
      <p class="hint-text">当前还没有触发新的消费预警记录。</p>
    </div>
  </div>
</el-card>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getBudgetInfo } from '@/api/budget'
import { getAbnormalBillList } from '@/api/bill'
import {
  getBudgetWarning,
  checkConsumptionWarning,
  getWarningRecords,
  markAllWarningsAsRead
} from '@/api/warning'

const warningRecords = ref([])
const loadingRecords = ref(false)

const abnormalBills = ref([])

const anomalySummary = computed(() => {
  if (!abnormalBills.value.length) {
    return {
      abnormalCount: 0,
      avgScore: 0,
      maxScore: 0,
      levelText: '本月消费稳定度较好',
      desc: '当前没有检测到明显异常消费行为，整体消费模式较稳定。'
    }
  }

  const scores = abnormalBills.value.map(item => Number(item.anomalyScore || 0))
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const maxScore = Math.max(...scores)

  let levelText = '本月消费稳定度：一般'
  let desc = '检测到少量异常消费，主要可能表现为金额波动或时段异常。'

  if (maxScore >= 0.85 || abnormalBills.value.length >= 4) {
    levelText = '本月消费稳定度：偏低'
    desc = '异常消费较为集中，建议优先关注高金额或非常规时段支出。'
  } else if (avgScore < 0.45) {
    levelText = '本月消费稳定度：良好'
    desc = '虽然存在轻微异常波动，但整体消费节奏仍然比较稳定。'
  }

  return {
    abnormalCount: abnormalBills.value.length,
    avgScore,
    maxScore,
    levelText,
    desc
  }
})

const detectionScore = computed(() => {
  if (!abnormalBills.value.length) return 92
  const score = 100 - anomalySummary.value.avgScore * 35 - anomalySummary.value.abnormalCount * 6
  return Math.max(45, Math.min(95, Math.round(score)))
})

const anomalyScoreClass = computed(() => {
  if (detectionScore.value >= 80) return 'good'
  if (detectionScore.value >= 60) return 'warn'
  return 'danger'
})

const smartDetectHints = computed(() => {
  const list = abnormalBills.value
  const amountCount = list.filter(item => item.anomalyType === 'AMOUNT_ABNORMAL').length
  const timeCount = list.filter(item => item.anomalyType === 'TIME_ABNORMAL').length
  const behaviorCount = list.filter(item =>
    item.anomalyType === 'BEHAVIOR_ABNORMAL' || item.anomalyType === 'COMPOSITE_ABNORMAL'
  ).length

  return [
    {
      icon: '📊',
      title: '金额波动分析',
      content: amountCount > 0
        ? `检测到 ${amountCount} 笔金额明显偏高消费，建议关注大额支出。`
        : '本月暂未发现明显金额异常消费。'
    },
    {
      icon: '⏰',
      title: '时段消费分析',
      content: timeCount > 0
        ? `发现 ${timeCount} 笔非常规时段消费，作息相关支出有波动。`
        : '夜间消费较少，消费时段整体稳定。'
    },
    {
      icon: '🧾',
      title: '行为偏离提醒',
      content: behaviorCount > 0
        ? `存在 ${behaviorCount} 笔偏离历史模式的消费记录，建议复查。`
        : '当前消费行为与历史习惯基本一致。'
    }
  ]
})

const getAnomalyTypeText = (type) => {
  if (type === 'AMOUNT_ABNORMAL') return '高金额异常'
  if (type === 'TIME_ABNORMAL') return '异常时段消费'
  if (type === 'COMPOSITE_ABNORMAL') return '复合异常消费'
  if (type === 'BEHAVIOR_ABNORMAL') return '行为偏离消费'
  return '异常消费'
}
const loadAbnormalBills = async () => {
  try {
    const res = await getAbnormalBillList({
      pageNum: 1,
      pageSize: 6
    })

    if (!res || res.code !== 200) {
      abnormalBills.value = []
      return
    }

    abnormalBills.value = res.data?.records || []
  } catch (error) {
    console.error(error)
    abnormalBills.value = []
  }
}
const getAbnormalItemClass = (item) => {
  const score = Number(item.anomalyScore || 0)
  if (score >= 0.85) return 'danger'
  return 'warning'
}

const statusInfo = ref({
  monthlyAllowance: 0,
  monthlyBudget: 0,
  currentSpent: 0,
  remainingDays: 0,
  dailyBudget: 0,
  nonEssentialRatio: 0.2,
  warningThreshold: 80
})

const checkForm = ref({
  amount: null,
  categoryId: null
})
const checking = ref(false)
const checkResult = ref(null)

const expenseCategories = ref([
  { id: 1, name: '食堂就餐', icon: '🍚', attribute: 1 },
  { id: 2, name: '水电网费', icon: '💡', attribute: 1 },
  { id: 3, name: '话费流量', icon: '📱', attribute: 1 },
  { id: 4, name: '医疗药品', icon: '💊', attribute: 1 },
  { id: 5, name: '交通通勤', icon: '🚌', attribute: 1 },
  { id: 6, name: '学习资料', icon: '📘', attribute: 1 },
  { id: 7, name: '水果零食', icon: '🍓', attribute: 2 },
  { id: 8, name: '服饰鞋包', icon: '🧥', attribute: 2 },
  { id: 9, name: '图书购买', icon: '📚', attribute: 2 },
  { id: 10, name: '电影娱乐', icon: '🎬', attribute: 2 },
  { id: 11, name: '奶茶咖啡', icon: '🧋', attribute: 3 },
  { id: 12, name: '游戏充值', icon: '🎮', attribute: 3 },
  { id: 13, name: '盲盒手办', icon: '🎁', attribute: 3 },
  { id: 14, name: '追星周边', icon: '🎀', attribute: 3 }
])

const detectDims = ref(['预算消耗', '非必要开支', '日均支出', '超支风险'])

const formatMoney = (value) => {
  const num = Number(value || 0)
  return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const getAttributeType = (attr) => {
  if (attr === 1) return 'success'
  if (attr === 2) return 'warning'
  return 'danger'
}

const getAttributeName = (attr) => {
  if (attr === 1) return '必要'
  if (attr === 2) return '改善'
  return '欲望'
}

const buildCheckDetails = (data) => [
  { label: '当前剩余预算', value: `¥${formatMoney(data.remainingBudget)}` },
  { label: '消费后预算结余', value: `¥${formatMoney(data.afterSpend)}` },
  { label: '当前日均可用', value: `¥${formatMoney(data.dailyBudget)}` },
  { label: '消费属性', value: getAttributeName(data.attribute) }
]

const coreCards = computed(() => [
  {
    icon: '💰',
    label: '月生活费',
    value: `¥${formatMoney(statusInfo.value.monthlyAllowance)}`,
    desc: '家长提供'
  },
  {
    icon: '📊',
    label: '已消费',
    value: `¥${formatMoney(statusInfo.value.currentSpent)}`,
    desc: `占预算 ${budgetUsage.value}%`
  },
  {
    icon: '⏳',
    label: '剩余天数',
    value: `${statusInfo.value.remainingDays} 天`,
    desc: `日均 ¥${formatMoney(statusInfo.value.dailyBudget)}`
  },
  {
    icon: '🎯',
    label: '欲望占比',
    value: `${(statusInfo.value.nonEssentialRatio * 100).toFixed(0)}%`,
    desc: '建议 ≤ 20%'
  }
])

const budgetUsage = computed(() => {
  if (!statusInfo.value.monthlyBudget) return 0
  return Math.round((statusInfo.value.currentSpent / statusInfo.value.monthlyBudget) * 100)
})

const healthScore = computed(() => {
  const usage = budgetUsage.value
  const nonEssentialPenalty = Math.round((statusInfo.value.nonEssentialRatio || 0) * 35)
  const score = 100 - usage - nonEssentialPenalty
  return Math.max(30, Math.min(100, score))
})

const healthScoreClass = computed(() => {
  if (healthScore.value >= 75) return 'good'
  if (healthScore.value >= 55) return 'warn'
  return 'danger'
})

const healthLevel = computed(() => {
  if (healthScore.value >= 75) return '当前消费较健康'
  if (healthScore.value >= 55) return '消费需要留意'
  return '存在超支风险'
})

const healthDesc = computed(() => {
  if (healthScore.value >= 75) return '本月预算使用平稳，建议继续保持合理节奏。'
  if (healthScore.value >= 55) return '预算消耗偏快，减少非必要支出会更稳。'
  return '预算压力较大，建议优先保留必要支出。'
})

const progressGradient = computed(() => {
  const usage = budgetUsage.value
  if (usage >= 100) return 'linear-gradient(90deg, #f56c6c, #e64343)'
  if (usage >= 80) return 'linear-gradient(90deg, #e6a23c, #f56c6c)'
  if (usage >= 60) return 'linear-gradient(90deg, #409eff, #e6a23c)'
  return 'linear-gradient(90deg, #67c23a, #409eff)'
})

const overForecast = computed(() => {
  const now = new Date()
  const currentDay = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  if (currentDay <= 1 || !statusInfo.value.currentSpent) return 0

  const dailyAvg = statusInfo.value.currentSpent / (currentDay - 1)
  const forecastMonth = dailyAvg * daysInMonth
  return Math.max(0, Math.round(forecastMonth - statusInfo.value.monthlyBudget))
})

const statusTagType = computed(() => {
  const usage = budgetUsage.value
  if (usage >= 100) return 'danger'
  if (usage >= 80) return 'warning'
  return 'success'
})

const statusText = computed(() => {
  const usage = budgetUsage.value
  if (usage >= 100) return '🔴 已超支'
  if (usage >= 80) return '🟡 预警中'
  return '🟢 正常'
})

const formatRecordTime = (value) => {
  if (!value) return ''

  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today - targetDay) / (24 * 60 * 60 * 1000))

  const timeText = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  if (diffDays === 0) return `今天 ${timeText}`
  if (diffDays === 1) return `昨天 ${timeText}`
  return `${date.getMonth() + 1}月${date.getDate()}日 ${timeText}`
}

const getRecordClass = (item) => {
  return item.warningType === 'RED' ? 'danger' : 'warning'
}

const getRecordTagText = (item) => {
  const msg = item.warningMsg || ''

  if (item.warningType === 'ANOMALY') return '异常预警'
  if (msg.includes('预算超支')) return '超支预警'
  if (msg.includes('阈值')) return '阈值预警'

  return '预算预警'
}
const getRecordTitle = (item) => {
  const msg = item.warningMsg || ''

  if (item.warningType === 'ANOMALY') {
    return msg.length > 18 ? `${msg.slice(0, 18)}...` : msg
  }
  if (item.warningType === 'YELLOW' && item.thresholdSnapshot != null) {
  return `预算使用达 ${item.thresholdSnapshot}%`
}
  if (msg.includes('预算超支')) return '预算超支预警'
  if (msg.includes('阈值')) return '预算阈值预警'

  return msg.length > 18 ? `${msg.slice(0, 18)}...` : msg
}

watch(
  () => [checkForm.value.amount, checkForm.value.categoryId],
  () => {
    checkResult.value = null
  }
)

onMounted(async () => {
  await Promise.all([loadStatusInfo(), loadWarningRecords(), loadAbnormalBills()])
  await handleReadAllWarnings()
})

const loadStatusInfo = async () => {
  try {
    const [budgetRes, warningRes] = await Promise.all([
      getBudgetInfo(),
      getBudgetWarning()
    ])

    if (budgetRes?.code === 200 && budgetRes.data) {
      statusInfo.value = {
  monthlyAllowance: parseFloat(budgetRes.data.monthlyAllowance) || 0,
  monthlyBudget: parseFloat(budgetRes.data.monthlyBudget) || 0,
  currentSpent: parseFloat(budgetRes.data.currentSpent) || 0,
  remainingDays: budgetRes.data.remainingDays ?? 0,
  dailyBudget: parseFloat(budgetRes.data.dailyBudget) || 0,
  nonEssentialRatio: 0.2,
  warningThreshold: parseInt(budgetRes.data.warningThreshold) || 80
}
    } else {
      ElMessage.warning(budgetRes?.message || '获取预算信息失败')
    }

    if (warningRes?.code === 200 && warningRes.data) {
      const warningData = warningRes.data
      if (warningData.warningLevel === 'RED') {
        statusInfo.value.nonEssentialRatio = 0.35
      } else if (warningData.warningLevel === 'YELLOW') {
        statusInfo.value.nonEssentialRatio = 0.25
      } else {
        statusInfo.value.nonEssentialRatio = 0.15
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取预警中心数据失败，请稍后重试')
  }
}

const checkPreWarning = async () => {
  if (!checkForm.value.amount || Number(checkForm.value.amount) <= 0) {
    ElMessage.warning('请输入消费金额')
    return
  }

  if (!checkForm.value.categoryId) {
    ElMessage.warning('请选择消费分类')
    return
  }

  const category = expenseCategories.value.find(item => item.id === checkForm.value.categoryId)
  const attribute = category?.attribute || 1

  checking.value = true
  try {
    const res = await checkConsumptionWarning({
      amount: checkForm.value.amount,
      attribute
    })

    if (!res || res.code !== 200 || !res.data) {
      ElMessage.error(res?.message || '检查失败')
      return
    }

    checkResult.value = {
      ...res.data,
      details: buildCheckDetails(res.data)
    }

    await Promise.all([loadWarningRecords(), loadStatusInfo()])
  } catch (error) {
    console.error(error)
    ElMessage.error('检查失败，请稍后重试')
  } finally {
    checking.value = false
  }
}

const loadWarningRecords = async () => {
  loadingRecords.value = true
  try {
    const res = await getWarningRecords()
    if (!res || res.code !== 200) {
      ElMessage.error(res?.message || '获取预警记录失败')
      return
    }

    warningRecords.value = (res.data || []).filter(
      item => ['RED', 'YELLOW', 'ANOMALY'].includes(item.warningType)
    )
  } catch (error) {
    console.error(error)
    ElMessage.error('获取预警记录失败，请稍后重试')
  } finally {
    loadingRecords.value = false
  }
}

const notifyWarningCountRefresh = () => {
  window.dispatchEvent(new Event('warning-count-refresh'))
}

const handleReadAllWarnings = async () => {
  try {
    const res = await markAllWarningsAsRead()
    if (!res || res.code !== 200) {
      return
    }
    notifyWarningCountRefresh()
  } catch (error) {
    console.error(error)
  }
}

</script>

<style scoped lang="scss">
.health-card {
  border-radius: 12px;

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

      &.good {
        border-color: #67c23a;
        background: #f0f9f0;
      }

      &.warn {
        border-color: #e6a23c;
        background: #fff8e1;
      }

      &.danger {
        border-color: #f56c6c;
        background: #ffebee;
      }

      .score-num {
        font-size: 28px;
        font-weight: 700;
      }

      .score-label {
        font-size: 11px;
        color: #909399;
      }
    }

    .score-desc {
      strong {
        font-size: 15px;
        color: #303133;
        display: block;
        margin-bottom: 4px;
      }

      p {
        font-size: 12px;
        color: #606266;
        margin: 0;
      }
    }
  }

  .health-summary {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: #fafbfc;
    border-radius: 8px;
    margin-bottom: 12px;

    .summary-item {
      text-align: center;
      font-size: 12px;
      color: #606266;

      strong {
        display: block;
        font-size: 14px;
        font-weight: 700;
        color: #303133;
        margin-top: 4px;
      }
    }
  }

  .detect-dimensions {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;

    .dim-title {
      font-size: 12px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

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

.warning-center-container {
  padding: 20px;
  height: auto;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

// 动画
.fade-in-up { animation: fadeInUp 0.5s ease-out both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

// 页面头部（紧凑一行）
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, #2F4F4F 0%, #3a6363 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 14px;
  flex-shrink: 0;

  .header-left {
    .page-title {
      margin: 0 0 2px 0;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      .title-icon { font-size: 24px; }
    }
    .page-subtitle { margin: 0; font-size: 12px; opacity: 0.85; }
  }

  .status-tag {
    font-size: 14px;
    padding: 6px 14px;
    font-weight: 600;
    &.pulse { animation: tagPulse 1.5s ease-in-out infinite; }
  }
}
@keyframes tagPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); } }

// 主布局：左右分栏
.main-layout {
  display: flex;
  gap: 14px;
  flex: 1;
  min-height: 0;

  .left-panel {
    flex: 1.4;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }
}

// 通用卡片
.pre-warning-card, .rules-card, .status-card, .records-card {
  border-radius: 12px;
  flex-shrink: 0;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .card-title { font-size: 15px; font-weight: 600; color: #303133; }
    .card-tip { font-size: 12px; color: #909399; }
  }
}

// 消费前预警表单
.pre-warning-form { margin-bottom: 14px; }

.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;

  .form-group { flex: 1; }

  .form-label {
    display: block;
    font-size: 13px;
    color: #606266;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .amount-input { width: 100%; }
  .category-select { width: 100%; }

  .btn-group { flex: 0 0 auto; }

  .check-btn {
    height: 40px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }
}

// 检查结果
.check-result {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  margin-bottom: 12px;

  &.success { background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e9 100%); border-color: #67c23a; }
  &.warning { background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%); border-color: #e6a23c; }
  &.danger { background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%); border-color: #f56c6c; animation: shake 0.5s ease-in-out; }

  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.05);

    .result-icon { font-size: 28px; }

    .result-title-area {
      flex: 1;
      .result-title { font-size: 16px; font-weight: 700; color: #303133; }
      .result-level { font-size: 12px; color: #909399; }
    }
  }

  .result-body {
    padding: 12px 16px;

    .result-reason {
      font-size: 14px;
      color: #606266;
      margin: 0 0 10px 0;
      line-height: 1.5;
    }

    .result-suggestion {
      padding: 10px 14px;
      background: rgba(255,255,255,0.6);
      border-radius: 8px;
      font-size: 13px;
      color: #303133;
      margin-bottom: 10px;
    }

    .result-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;

      .detail-item {
        font-size: 12px;
        color: #606266;
        span { color: #909399; }
        strong { color: #303133; }
      }
    }
  }
}
@keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }

// 快捷金额
.quick-amounts {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;

  .quick-label { font-size: 12px; color: #909399; white-space: nowrap; }

  .quick-btn {
    padding: 4px 12px;
    font-size: 13px;
    color: #2F4F4F;
    font-weight: 600;

    &:hover { background: #e8f5f0; }
  }
}

// 预警规则（紧凑）
.rules-card {
  .rules-grid {
    display: flex;
    gap: 8px;

    .rule-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;

      &.green { background: #e8f5e9; }
      &.yellow { background: #fff8e1; }
      &.red { background: #ffebee; }

      .rule-icon { font-size: 18px; }

      .rule-content {
        display: flex;
        flex-direction: column;
        strong { font-size: 12px; color: #303133; }
        span { font-size: 11px; color: #606266; }
      }
    }
  }
}

// 预算状态卡片
.status-card {
  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 14px;

    .status-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;

      .status-icon { font-size: 22px; }

      .status-info {
        flex: 1;
        .status-label { font-size: 11px; color: #909399; }
        .status-value { font-size: 16px; font-weight: 700; color: #303133; line-height: 1.2; }
        .status-desc { font-size: 10px; color: #909399; }
      }
    }
  }

  .mini-progress {
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #606266;
      margin-bottom: 6px;
    }

    .progress-bar-mini {
      height: 10px;
      background: #f0f0f0;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 6px;

      .progress-fill-mini {
        height: 100%;
        border-radius: 5px;
        transition: width 0.8s ease;
      }
    }

    .progress-forecast-mini {
      font-size: 11px;
      color: #ef6c00;
      text-align: center;

      strong { color: #f56c6c; }
    }
  }
}
.health-card {
  border-radius: 12px;

  .smart-hints {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .mini-hint {
    display: flex;
    gap: 10px;
    padding: 10px 12px;
    background: #f7f9fc;
    border-radius: 10px;
    border: 1px solid #eef2f7;
  }

  .mini-hint-icon {
    font-size: 18px;
    flex-shrink: 0;
    line-height: 1.2;
  }

  .mini-hint-title {
    font-size: 13px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 3px;
  }

  .mini-hint-text {
    font-size: 12px;
    color: #7a8394;
    line-height: 1.5;
  }

  .detect-overview {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px;
    background: #fbfcfe;
    border-radius: 12px;
    margin-bottom: 14px;
  }

  .score-ring {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 4px solid #dcdfe6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.good {
      border-color: #e6a23c;
      background: #fffaf0;
    }

    &.warn {
      border-color: #f5c04d;
      background: #fffaf2;
    }

    &.danger {
      border-color: #f56c6c;
      background: #fff1f0;
    }

    .score-num {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
      line-height: 1;
    }

    .score-text {
      margin-top: 4px;
      font-size: 11px;
      color: #909399;
    }
  }

  .overview-text {
    strong {
      display: block;
      font-size: 15px;
      color: #303133;
      margin-bottom: 4px;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #7a8394;
      line-height: 1.6;
    }
  }

  .abnormal-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .abnormal-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid transparent;

    &.danger {
      background: #fff3f3;
      border-color: #f6c8c8;
    }

    &.warning {
      background: #fffaf0;
      border-color: #f3dfaa;
    }
  }

  .abnormal-left {
    display: flex;
    gap: 10px;
    flex: 1;
  }

  .abnormal-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-top: 5px;
    background: #f56c6c;
    flex-shrink: 0;
  }

  .abnormal-info {
    flex: 1;
    min-width: 0;
  }

  .abnormal-title {
    font-size: 13px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 3px;
  }

  .abnormal-reason {
    font-size: 12px;
    color: #7a8394;
    line-height: 1.5;
    margin-bottom: 3px;
  }

  .abnormal-time {
    font-size: 11px;
    color: #a0a8b8;
  }

  .abnormal-right {
    text-align: right;
    flex-shrink: 0;
  }

  .abnormal-amount {
    font-size: 14px;
    font-weight: 700;
    color: #ff6b6b;
  }

  .abnormal-score {
    margin-top: 4px;
    font-size: 11px;
    color: #909399;
  }

  .empty-anomaly {
    padding: 16px 0 4px;
    text-align: center;
    font-size: 12px;
    color: #909399;
  }
}

// 预警记录（紧凑）
.records-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .records-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    color: #909399;
    text-align: center;
  }

  .records-list-pretty {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .record-pretty-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid transparent;
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    }

    &.warning {
      background: linear-gradient(135deg, #fff8e5 0%, #fff4d7 100%);
      border-color: #f6e2a8;
    }

    &.danger {
      background: linear-gradient(135deg, #ffe9ec 0%, #ffe1e6 100%);
      border-color: #f6c4cb;
    }

    .record-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;

      &.warning {
        background: radial-gradient(circle at 30% 30%, #ffd96b, #d89a14);
        box-shadow: 0 0 10px rgba(216, 154, 20, 0.35);
      }

      &.danger {
        background: radial-gradient(circle at 30% 30%, #ff7b8d, #d63a53);
        box-shadow: 0 0 10px rgba(214, 58, 83, 0.35);
      }
    }

    .record-main {
      flex: 1;
      min-width: 0;
    }

    .record-title {
      font-size: 15px;
      font-weight: 700;
      color: #4b5563;
      line-height: 1.3;
      white-space: normal;
      word-break: break-word;
    }

    .record-time {
      margin-top: 6px;
      font-size: 12px;
      color: #8f98aa;
    }

    .record-pill {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;

      &.warning {
        background: rgba(255, 255, 255, 0.55);
        color: #d89a14;
      }

      &.danger {
        background: rgba(255, 255, 255, 0.55);
        color: #e46a7b;
      }
    }
  }
}
// 响应式
@media (max-width: 1200px) {
  .main-layout { flex-direction: column; }
  .form-row { flex-direction: column; }
  .rules-grid { flex-direction: column; }
}
</style>
