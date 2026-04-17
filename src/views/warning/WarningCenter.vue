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

        <!-- 预警记录（紧凑列表） -->
        <el-card class="records-card fade-in-up" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">📝 预警记录</span>
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
                <el-button text size="small" @click="loadWarningRecords">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-badge>
            </div>
          </template>

          <!-- TODO [后端接口]: POST /api/warning/check -->
          <!-- <el-alert type="info" :closable="false" class="todo-alert-compact">
            <template #default>
              <strong>TODO [后端接口]</strong> POST /api/warning/check · GET /api/warning/records
            </template>
          </el-alert> -->

          <div class="records-list-compact">
            <div class="record-item" v-for="(record, i) in mockRecords" :key="i" :class="record.type">
              <span class="record-icon">{{ record.icon }}</span>
              <div class="record-content">
                <div class="record-title">{{ record.title }}</div>
                <div class="record-time">{{ record.time }}</div>
              </div>
              <el-tag :type="record.type" size="small">{{ record.tag }}</el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, TrendCharts } from '@element-plus/icons-vue'

// 核心数据
const statusInfo = ref({
  monthlyAllowance: 2000,
  monthlyBudget: 1800,
  currentSpent: 1450,
  remainingDays: 10,
  dailyBudget: 35,
  nonEssentialRatio: 0.35
})

// 消费前检查表单
const checkForm = ref({ amount: 0, categoryId: null })
const checking = ref(false)
const checkResult = ref(null)
const unreadCount = ref(2)

// 支出分类
const expenseCategories = ref([
  { id: 1, name: '食堂就餐', icon: '🍜', attribute: 1 },
  { id: 2, name: '水费电费', icon: '⚡', attribute: 1 },
  { id: 3, name: '话费流量', icon: '📱', attribute: 1 },
  { id: 4, name: '医疗药品', icon: '💊', attribute: 1 },
  { id: 5, name: '校车/通勤', icon: '🚌', attribute: 1 },
  { id: 6, name: '考研资料', icon: '📚', attribute: 1 },
  { id: 7, name: '水果零食', icon: '🍎', attribute: 2 },
  { id: 8, name: '服饰鞋包', icon: '👕', attribute: 2 },
  { id: 9, name: '图书购买', icon: '📖', attribute: 2 },
  { id: 10, name: '电影/展会', icon: '🎬', attribute: 2 },
  { id: 11, name: '奶茶咖啡', icon: '🥤', attribute: 3 },
  { id: 12, name: '游戏氪金', icon: '🎮', attribute: 3 },
  { id: 13, name: '盲盒手办', icon: '🧸', attribute: 3 },
  { id: 14, name: '追星/周边', icon: '🌟', attribute: 3 }
])

// 模拟预警记录
const mockRecords = ref([
  { icon: '🟡', title: '预算使用达 80%', time: '今天 14:30', type: 'warning', tag: '阈值预警' },
  { icon: '🔴', title: '欲望消费占比过高', time: '昨天 09:15', type: 'danger', tag: '占比预警' },
  { icon: '🟡', title: '单笔大额消费提醒', time: '昨天 18:20', type: 'warning', tag: '大额预警' }
])

// 核心卡片数据（紧凑版）
const coreCards = computed(() => [
  { icon: '💰', label: '生活费', value: `¥${statusInfo.value.monthlyAllowance}`, desc: '家长给的' },
  { icon: '📉', label: '已消费', value: `¥${statusInfo.value.currentSpent}`, desc: `占预算 ${budgetUsage.value}%` },
  { icon: '📅', label: '剩余', value: `${statusInfo.value.remainingDays} 天`, desc: `每日 ¥${statusInfo.value.dailyBudget}` },
  { icon: '🎮', label: '欲望占比', value: `${(statusInfo.value.nonEssentialRatio * 100).toFixed(0)}%`, desc: '建议 ≤ 20%' }
])

const budgetUsage = computed(() => {
  if (!statusInfo.value.monthlyBudget) return 0
  return Math.round((statusInfo.value.currentSpent / statusInfo.value.monthlyBudget) * 100)
})

const budgetUsed = computed(() => statusInfo.value.currentSpent)
const monthlyBudget = computed(() => statusInfo.value.monthlyBudget)

const overForecast = computed(() => {
  const daysPassed = 30 - statusInfo.value.remainingDays
  if (daysPassed <= 0) return 0
  const dailyAvg = statusInfo.value.currentSpent / daysPassed
  const forecastMonth = dailyAvg * 30
  return Math.max(0, Math.round(forecastMonth - statusInfo.value.monthlyBudget))
})

const progressGradient = computed(() => {
  const usage = budgetUsage.value
  if (usage >= 100) return 'linear-gradient(90deg, #f56c6c, #e64343)'
  if (usage >= 80) return 'linear-gradient(90deg, #e6a23c, #f56c6c)'
  if (usage >= 60) return 'linear-gradient(90deg, #409eff, #e6a23c)'
  return 'linear-gradient(90deg, #67c23a, #409eff)'
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

const getAttributeType = (attr) => attr === 1 ? 'success' : attr === 2 ? 'warning' : 'danger'
const getAttributeName = (attr) => attr === 1 ? '必需' : attr === 2 ? '改善' : '欲望'

onMounted(() => { loadStatusInfo() })

const loadStatusInfo = () => {
  // TODO [后端接口]: GET /api/budget/status
  statusInfo.value = { monthlyAllowance: 2000, monthlyBudget: 1800, currentSpent: 1450, remainingDays: 10, dailyBudget: 35, nonEssentialRatio: 0.35 }
}

// 消费前预警检查（核心功能）
const checkPreWarning = async () => {
  if (!checkForm.value.amount || checkForm.value.amount <= 0) {
    ElMessage.warning('请输入消费金额')
    return
  }
  if (!checkForm.value.categoryId) {
    ElMessage.warning('请选择消费分类')
    return
  }

  checking.value = true
  await new Promise(resolve => setTimeout(resolve, 600))

  const category = expenseCategories.value.find(c => c.id === checkForm.value.categoryId)
  const attribute = category?.attribute || 1
  const attributeName = getAttributeName(attribute)
  const remaining = statusInfo.value.monthlyBudget - statusInfo.value.currentSpent
  const afterSpend = remaining - checkForm.value.amount
  const dailyBudget = statusInfo.value.dailyBudget

  let result = {}

  if (afterSpend < 0) {
    result = {
      level: 'danger', icon: '🚫', title: '不建议消费', levelText: '红灯 - 超支风险',
      reason: `这笔消费将导致预算超支 ¥${Math.abs(afterSpend).toFixed(2)}！`,
      suggestion: attribute === 1 ? '虽是必需，但预算已不足。建议确认是否紧急必需。' : '强烈建议放弃！等下月生活费再说。',
      details: [
        { label: '消费属性', value: attributeName },
        { label: '剩余预算', value: `¥${remaining.toFixed(2)}` },
        { label: '消费后余额', value: `¥${afterSpend.toFixed(2)}` }
      ]
    }
  } else if (budgetUsage.value >= 80 && attribute >= 2) {
    result = {
      level: 'warning', icon: '⚠️', title: '谨慎消费', levelText: '黄灯 - 预警期',
      reason: `预算已达 ${budgetUsage.value}%，这笔${attributeName}消费会进一步压缩后续额度。`,
      suggestion: '建议三思：是否真的必要？能否等到下月？',
      details: [
        { label: '消费属性', value: attributeName },
        { label: '剩余预算', value: `¥${remaining.toFixed(2)}` },
        { label: '剩余天数', value: `${statusInfo.value.remainingDays} 天` },
        { label: '每日可用', value: `¥${dailyBudget}` }
      ]
    }
  } else if (attribute === 3 && checkForm.value.amount > dailyBudget * 2) {
    result = {
      level: 'warning', icon: '💭', title: '请三思', levelText: '黄灯 - 欲望消费提醒',
      reason: `欲望消费 ¥${checkForm.value.amount}，超过日均预算的 2 倍。`,
      suggestion: '冲动消费是超支主因。建议冷静 24 小时后再决定。',
      details: [
        { label: '消费属性', value: attributeName },
        { label: '消费金额', value: `¥${checkForm.value.amount}` },
        { label: '日均预算', value: `¥${dailyBudget}` },
        { label: '倍数', value: `${(checkForm.value.amount / dailyBudget).toFixed(1)}x` }
      ]
    }
  } else {
    result = {
      level: 'success', icon: '✅', title: '可以消费', levelText: '绿灯 - 安全范围',
      reason: '当前预算充足，这笔消费在合理范围内。',
      suggestion: attribute === 1 ? '必需消费，放心进行。' : '在预算范围内，建议理性消费。',
      details: [
        { label: '消费属性', value: attributeName },
        { label: '剩余预算', value: `¥${remaining.toFixed(2)}` },
        { label: '消费后剩余', value: `¥${afterSpend.toFixed(2)}` }
      ]
    }
  }

  checkResult.value = result
  checking.value = false
}

const loadWarningRecords = () => {
  // TODO [后端接口]: GET /api/warning/records
  ElMessage.info('预警记录功能需要后端接口支持')
}
</script>

<style scoped lang="scss">
.warning-center-container {
  padding: 0;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

  .todo-alert-compact {
    margin-bottom: 10px;
    border-radius: 6px;
    font-size: 11px;
    padding: 8px 12px;
  }

  .records-list-compact {
    .record-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      margin-bottom: 6px;

      &.warning { background: #fff8e1; }
      &.danger { background: #ffebee; }

      .record-icon { font-size: 16px; }

      .record-content {
        flex: 1;
        .record-title { font-size: 12px; font-weight: 600; color: #303133; }
        .record-time { font-size: 10px; color: #909399; }
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
