<template>
  <div class="budget-setting-container">
    <div class="page-header fade-in-up">
      <h2 class="page-title">
        <span class="title-icon pulse">💰</span>
        预算与生活费管理
      </h2>
      <p class="page-subtitle">合理规划生活费，让每一分钱都花得值</p>
    </div>

    <!-- 核心概念说明 -->
    <el-alert
      title="💡 核心概念"
      type="info"
      :closable="false"
      class="concept-alert fade-in-up"
    >
      <template #default>
        <div class="concept-content">
          <div class="concept-item">
            <span class="concept-label glow-green">生活费</span>
            <span class="concept-desc">家长给的，客观收入，你的生存硬约束</span>
          </div>
          <div class="concept-divider arrow-pulse">→</div>
          <div class="concept-item">
            <span class="concept-label glow-blue">预算</span>
            <span class="concept-desc">你自己规划的消费上限，建议 ≤ 生活费</span>
          </div>
        </div>
      </template>
    </el-alert>

    <!-- 本月概况 -->
    <el-card class="overview-card fade-in-up" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">本月概况</span>
          <el-tag :type="statusTagType" size="default" class="status-tag" :class="{ 'pulse-tag': budgetUsagePercent >= 80 }">{{ statusText }}</el-tag>
        </div>
      </template>

      <div class="overview-grid">
        <div class="overview-item income" v-for="(item, index) in overviewItems" :key="index">
          <div class="item-icon" :style="{ animationDelay: index * 0.1 + 's' }">{{ item.icon }}</div>
          <div class="item-content">
            <div class="item-label">{{ item.label }}</div>
            <div class="item-value count-up" :data-target="item.value">¥{{ item.value }}</div>
            <div class="item-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 预算使用进度 -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">预算使用进度</span>
          <span class="progress-value">{{ budgetUsagePercent }}%</span>
        </div>
        <div class="progress-bar-wrapper">
          <el-progress
            :percentage="budgetUsagePercent"
            :color="progressColor"
            :stroke-width="12"
            :show-text="false"
            class="animated-progress"
          />
          <div class="progress-glow" :style="{ width: budgetUsagePercent + '%' }"></div>
        </div>
        <div class="progress-tips">
          <span class="tip-item" v-if="budgetUsagePercent >= 100" key="over">🔴 已超支</span>
          <span class="tip-item" v-else-if="budgetUsagePercent >= 80" key="warning">🟡 即将用完</span>
          <span class="tip-item" v-else-if="budgetUsagePercent >= 60" key="half"> 使用过半</span>
          <span class="tip-item" v-else key="normal">🟢 余额充足</span>
        </div>
      </div>
    </el-card>

    <!-- 设置表单 -->
    <el-row :gutter="20" class="fade-in-up">
      <!-- 生活费设置 -->
      <el-col :span="12">
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">💰 生活费设置</span>
              <span class="card-tip">家长给的生活费总额</span>
            </div>
          </template>

          <el-form :model="allowanceForm" label-position="top" class="setting-form">
            <el-form-item label="本月生活费">
              <el-input-number
                v-model="allowanceForm.monthlyAllowance"
                :min="0"
                :precision="2"
                :step="100"
                placeholder="请输入本月生活费"
                style="width: 100%"
                class="glow-input"
              >
                <template #prepend>¥</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="每日生存保障">
              <el-input-number
                v-model="allowanceForm.dailySurvivalCost"
                :min="0"
                :precision="2"
                :step="5"
                placeholder="食堂保底三餐等必需开支"
                style="width: 100%"
                class="glow-input"
              >
                <template #prepend>¥</template>
              </el-input-number>
              <div class="form-hint">每日必须花这么多才能保证基本生活</div>
            </el-form-item>

            <el-form-item label="应急资金">
              <el-input-number
                v-model="allowanceForm.emergencyFund"
                :min="0"
                :precision="2"
                :step="50"
                placeholder="不可动用的底线资金"
                style="width: 100%"
                class="glow-input"
              >
                <template #prepend>¥</template>
              </el-input-number>
              <div class="form-hint emergency-hint">⚠️ 这笔钱不到万不得已不要用！</div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="savingAllowance"
                @click="handleSaveAllowance"
                class="btn-glow btn-gradient-green"
              >
                <span v-if="!savingAllowance" class="btn-content">
                  <span class="btn-icon">💾</span>
                  保存生活费设置
                </span>
                <span v-else>保存中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 预算设置 -->
      <el-col :span="12">
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">🎯 预算设置</span>
              <span class="card-tip">你自己规划的消费上限</span>
            </div>
          </template>

          <el-form :model="budgetForm" label-position="top" class="setting-form">
            <el-form-item label="月度预算">
              <el-input-number
                v-model="budgetForm.monthlyBudget"
                :min="0"
                :precision="2"
                :step="100"
                placeholder="请输入月度预算"
                style="width: 100%"
                class="glow-input"
              >
                <template #prepend>¥</template>
              </el-input-number>
              <div class="form-hint warning-hint" v-if="budgetForm.monthlyBudget > allowanceForm.monthlyAllowance && allowanceForm.monthlyAllowance > 0">
                ⚠️ 预算超过了生活费，建议调整
              </div>
            </el-form-item>

            <el-form-item label="预警阈值">
              <el-slider
                v-model="budgetForm.warningThreshold"
                :min="50"
                :max="100"
                :step="5"
                show-input
                input-size="small"
                class="glow-slider"
              />
              <div class="form-hint">预算使用达到该比例时发出预警</div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="savingBudget"
                @click="handleSaveBudget"
                class="btn-glow btn-gradient-blue"
              >
                <span v-if="!savingBudget" class="btn-content">
                  <span class="btn-icon">🎯</span>
                  保存预算设置
                </span>
                <span v-else>保存中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 周预算拆解 -->
    <el-card class="weekly-budget-card fade-in-up" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">📅 周预算拆解</span>
          <span class="card-tip">月度预算 ÷ 4 周，每周花多少一目了然</span>
        </div>
      </template>

      <div class="weekly-budget-list">
        <div
          v-for="(week, index) in weeklyBreakdown"
          :key="index"
          class="week-item"
          :class="week.status"
        >
          <div class="week-header">
            <span class="week-label">{{ week.week }}</span>
            <el-tag :type="getWeekTagType(week.status)" size="small">
              {{ getWeekStatusText(week.status) }}
            </el-tag>
          </div>
          <div class="week-content">
            <div class="week-info">
              <span>预算：</span>
              <strong>¥{{ week.budget }}</strong>
            </div>
            <div class="week-info">
              <span>已花：</span>
              <strong :class="week.spent > week.budget ? 'over-budget' : ''">¥{{ week.spent }}</strong>
            </div>
            <div class="week-info">
              <span>剩余：</span>
              <strong class="remaining">¥{{ Math.max(0, week.budget - week.spent) }}</strong>
            </div>
          </div>
          <el-progress
            :percentage="Math.min(100, Math.round((week.spent / week.budget) * 100))"
            :color="week.spent > week.budget ? '#f56c6c' : '#67c23a'"
            :stroke-width="8"
            :show-text="false"
          />
        </div>
      </div>
    </el-card>

    <!-- 分类预算设置（占位） -->
    <el-card class="category-budget-card fade-in-up" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">📊 分类预算设置</span>
          <span class="card-tip">细分各类别预算，更精准控制消费（可选）</span>
        </div>
      </template>

      <!-- TODO [后端接口]: POST /api/budget/category -->
      <!-- <el-alert type="info" :closable="false" class="todo-alert">
        <template #default>
          <strong>TODO [后端接口]</strong><br>
          POST /api/budget/category - 设置分类预算<br>
          GET /api/budget/category - 获取分类预算列表
        </template>
      </el-alert> -->

      <div class="empty-placeholder">
        <div class="empty-icon-wrapper">
          <el-icon class="empty-icon bounce"><Wallet /></el-icon>
        </div>
        <p class="empty-text">分类预算功能开发中...</p>
        <p class="empty-hint">需要先实现后端接口</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Wallet, Clock, Check, Warning } from '@element-plus/icons-vue'

// 本月概况数据
const overviewInfo = ref({
  monthlyAllowance: 2000,
  monthlyBudget: 1800,
  currentSpent: 1250,
  budgetRemaining: 550,
  remainingDays: 15,
  dailyBudget: 36.67,
  emergencyFund: 200,       // 应急资金
  weeklyBudget: 450,        // 周预算
  currentWeek: 2            // 当前第几周
})

// 概况卡片配置
const overviewItems = computed(() => [
  { icon: '💰', label: '本月生活费', value: overviewInfo.value.monthlyAllowance, desc: '家长给的' },
  { icon: '🎯', label: '月度预算', value: overviewInfo.value.monthlyBudget, desc: '你规划的' },
  { icon: '📉', label: '已消费', value: overviewInfo.value.currentSpent, desc: '本月支出' },
  { icon: '💵', label: '预算剩余', value: overviewInfo.value.budgetRemaining, desc: '还能花多少' },
  { icon: '📅', label: '每日可用', value: overviewInfo.value.dailyBudget, desc: `剩余 ${overviewInfo.value.remainingDays} 天` }
])

// 周预算拆解（按 4 周平均分配）
const weeklyBreakdown = computed(() => {
  const total = overviewInfo.value.monthlyBudget
  const weekly = Math.round(total / 4)
  return [
    { week: '第 1 周', budget: weekly, spent: 380, status: 'completed' },
    { week: '第 2 周', budget: weekly, spent: 420, status: 'current' },
    { week: '第 3 周', budget: weekly, spent: 0, status: 'upcoming' },
    { week: '第 4 周', budget: weekly, spent: 0, status: 'upcoming' }
  ]
})

// 生活费表单
const allowanceForm = ref({
  monthlyAllowance: 2000,
  dailySurvivalCost: 30,
  emergencyFund: 200        // 新增：应急资金
})

// 预算表单
const budgetForm = ref({
  monthlyBudget: 1800,
  warningThreshold: 80
})

// 保存状态
const savingAllowance = ref(false)
const savingBudget = ref(false)

// 预算使用百分比
const budgetUsagePercent = computed(() => {
  if (!overviewInfo.value.monthlyBudget) return 0
  return Math.round((overviewInfo.value.currentSpent / overviewInfo.value.monthlyBudget) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  const percent = budgetUsagePercent.value
  if (percent >= 100) return '#f56c6c'
  if (percent >= 80) return '#e6a23c'
  if (percent >= 60) return '#409eff'
  return '#67c23a'
})

// 状态标签类型
const statusTagType = computed(() => {
  const percent = budgetUsagePercent.value
  if (percent >= 100) return 'danger'
  if (percent >= 80) return 'warning'
  return 'success'
})

// 状态文本
const statusText = computed(() => {
  const percent = budgetUsagePercent.value
  if (percent >= 100) return '已超支'
  if (percent >= 80) return '预警中'
  return '正常'
})

// 获取周状态标签类型
const getWeekTagType = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'current') return 'warning'
  return 'info'
}

// 获取周状态文本
const getWeekStatusText = (status) => {
  if (status === 'completed') return '已完成'
  if (status === 'current') return '进行中'
  return '未开始'
}

onMounted(() => {
  loadBudgetInfo()
  animateNumbers()
})

// 加载预算信息
const loadBudgetInfo = () => {
  // TODO [后端接口]: GET /api/budget/info
  overviewInfo.value = {
    monthlyAllowance: 2000,
    monthlyBudget: 1800,
    currentSpent: 1250,
    budgetRemaining: 550,
    remainingDays: 15,
    dailyBudget: 36.67
  }
  
  allowanceForm.value = {
    monthlyAllowance: 2000,
    dailySurvivalCost: 30
  }
  
  budgetForm.value = {
    monthlyBudget: 1800,
    warningThreshold: 80
  }
}

// 数字滚动动画
const animateNumbers = () => {
  const counters = document.querySelectorAll('.count-up')
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'))
    if (!target) return
    
    const duration = 1000
    const step = target / (duration / 16)
    let current = 0
    
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      counter.textContent = '¥' + current.toFixed(2)
    }, 16)
  })
}

// 保存生活费设置
const handleSaveAllowance = async () => {
  if (!allowanceForm.value.monthlyAllowance || allowanceForm.value.monthlyAllowance <= 0) {
    ElMessage.warning('请输入有效的月度生活费')
    return
  }

  savingAllowance.value = true
  
  try {
    // TODO [后端接口]: PUT /api/budget/allowance
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('生活费设置已保存')
    loadBudgetInfo()
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    savingAllowance.value = false
  }
}

// 保存预算设置
const handleSaveBudget = async () => {
  if (!budgetForm.value.monthlyBudget || budgetForm.value.monthlyBudget <= 0) {
    ElMessage.warning('请输入有效的月度预算')
    return
  }

  if (budgetForm.value.monthlyBudget > allowanceForm.value.monthlyAllowance && allowanceForm.value.monthlyAllowance > 0) {
    ElMessage.warning('预算超过了生活费，确定要保存吗？')
  }

  savingBudget.value = true
  
  try {
    // TODO [后端接口]: PUT /api/budget
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('预算设置已保存')
    loadBudgetInfo()
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    savingBudget.value = false
  }
}
</script>

<style scoped lang="scss">
.budget-setting-container {
  padding: 0;
}

// ===== 页面加载动画 =====
.fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 延迟动画
.fade-in-up:nth-child(2) { animation-delay: 0.1s; }
.fade-in-up:nth-child(3) { animation-delay: 0.2s; }
.fade-in-up:nth-child(4) { animation-delay: 0.3s; }

// ===== 标题区域 =====
.page-header {
  margin-bottom: 20px;

  .page-title {
    margin: 0 0 6px 0;
    font-size: 22px;
    font-weight: 700;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 10px;

    .title-icon {
      font-size: 28px;
    }
  }

  .page-subtitle {
    margin: 0;
    font-size: 13px;
    color: #909399;
  }
}

// ===== 图标脉冲动画 =====
.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

// ===== 核心概念区域 =====
.concept-alert {
  margin-bottom: 20px;
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.2);

  .concept-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .concept-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .concept-label {
        font-weight: 600;
        color: #303133;
        padding: 4px 12px;
        border-radius: 20px;
        
        &.glow-green {
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          box-shadow: 0 0 10px rgba(103, 194, 58, 0.3);
        }
        
        &.glow-blue {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
        }
      }

      .concept-desc {
        color: #606266;
        font-size: 13px;
      }
    }

    .concept-divider {
      font-size: 20px;
      color: #909399;
      
      &.arrow-pulse {
        animation: arrowPulse 1.5s ease-in-out infinite;
      }
    }
  }
}

@keyframes arrowPulse {
  0%, 100% { opacity: 0.5; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(5px); }
}

// ===== 卡片通用样式 =====
.overview-card,
.form-card,
.category-budget-card {
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .card-tip {
      font-size: 12px;
      color: #909399;
    }
  }
}

// ===== 状态标签脉冲 =====
.status-tag {
  transition: all 0.3s;
  
  &.pulse-tag {
    animation: tagPulse 1.5s ease-in-out infinite;
  }
}

@keyframes tagPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(245, 108, 108, 0); }
}

// ===== 概况卡片网格 =====
.overview-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .overview-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &:hover::before {
      opacity: 1;
    }
    
    &:hover {
      transform: translateY(-4px) scale(1.02);
    }

    &.income {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    }

    &.budget {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    &.spent {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    &.remaining {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
    }

    &.daily {
      background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
    }

    .item-icon {
      font-size: 28px;
      animation: iconBounce 2s ease-in-out infinite;
    }

    .item-content {
      flex: 1;

      .item-label {
        font-size: 12px;
        color: #606266;
        margin-bottom: 4px;
      }

      .item-value {
        font-size: 20px;
        font-weight: 700;
        color: #303133;
        margin-bottom: 2px;
      }

      .item-desc {
        font-size: 11px;
        color: #909399;
      }
    }
  }
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

// ===== 进度条区域 =====
.progress-section {
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    .progress-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }

    .progress-value {
      font-size: 14px;
      color: #303133;
      font-weight: 600;
    }
  }
  
  .progress-bar-wrapper {
    position: relative;
    height: 12px;
    background: #f0f0f0;
    border-radius: 6px;
    overflow: hidden;
    
    .progress-glow {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: progressGlow 2s linear infinite;
      pointer-events: none;
    }
  }
  
  .progress-tips {
    margin-top: 8px;
    text-align: center;

    .tip-item {
      font-size: 12px;
      color: #909399;
    }
  }
}

@keyframes progressGlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

// ===== 表单区域 =====
.setting-form {
  .form-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    transition: all 0.3s;
    
    &.warning-hint {
      color: #f56c6c;
      animation: hintShake 0.5s ease-in-out;
    }
  }
}

@keyframes hintShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

// ===== 输入框发光效果 =====
.glow-input {
  :deep(.el-input__wrapper) {
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px #409eff inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #409eff inset, 0 0 12px rgba(64, 158, 255, 0.2);
    }
  }
}

// ===== 滑块发光效果 =====
.glow-slider {
  :deep(.el-slider__bar) {
    background: linear-gradient(90deg, #2F4F4F, #4a7c7c);
  }
  
  :deep(.el-slider__button) {
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 0 12px rgba(47, 79, 79, 0.4);
    }
  }
}

// ===== 按钮特效 =====
.btn-glow {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .btn-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    .btn-icon {
      font-size: 18px;
    }
  }
}

// 绿色渐变按钮
.btn-gradient-green {
  background: linear-gradient(135deg, #2F4F4F 0%, #4a7c7c 100%);
  box-shadow: 0 4px 12px rgba(47, 79, 79, 0.3);
  
  &:hover {
    box-shadow: 0 6px 20px rgba(47, 79, 79, 0.4);
  }
}

// 蓝色渐变按钮
.btn-gradient-blue {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  
  &:hover {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  }
}

// ===== TODO 提示 =====
.todo-alert {
  margin-bottom: 20px;
  border-radius: 8px;
}

// ===== 周预算拆解 =====
.weekly-budget-card {
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

    .card-tip {
      font-size: 12px;
      color: #909399;
    }
  }
}

.weekly-budget-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  .week-item {
    padding: 16px;
    border: 2px solid #ebeef5;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    &.completed {
      background: #f0f9f0;
      border-color: #67c23a;
    }

    &.current {
      background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%);
      border-color: #e6a23c;
    }

    &.upcoming {
      background: #fafafa;
      opacity: 0.7;
    }

    .week-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .week-label {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .week-content {
      margin-bottom: 12px;

      .week-info {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 13px;
        color: #606266;

        strong {
          color: #303133;

          &.over-budget {
            color: #f56c6c;
          }

          &.remaining {
            color: #67c23a;
          }
        }
      }
    }
  }
}

// ===== 应急资金提示 =====
.emergency-hint {
  color: #f56c6c !important;
  font-weight: 500;
}

// ===== 空状态占位 =====
.empty-placeholder {
  text-align: center;
  padding: 60px 20px;

  .empty-icon-wrapper {
    margin-bottom: 16px;
  }
  
  .empty-icon {
    font-size: 48px;
    color: #c0c4cc;
    
    &.bounce {
      animation: bounce 2s ease-in-out infinite;
    }
  }

  .empty-text {
    font-size: 14px;
    color: #606266;
    margin: 0 0 8px 0;
  }

  .empty-hint {
    font-size: 12px;
    color: #909399;
    margin: 0;
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

// ===== 响应式 =====
@media (max-width: 1200px) {
  .overview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
