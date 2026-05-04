<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Bell,
  Check,
  DataAnalysis,
  PieChart,
  TrendCharts,
  Histogram,
  MagicStick,
  ChatDotRound,
  Clock
} from '@element-plus/icons-vue'
import { getBudgetInfo, updateBudget } from '@/api/budget'

// 预算设置数据
const budgetSetting = ref({
  monthly: 0,
  categories: {}
})

// 预警设置数据
const alertSettings = ref({
  budget80: true,
  budget100: true,
  largeAmount: true,
  unnecessaryRatio: true
})

// 加载状态
const loading = ref(false)
const savingBudget = ref(false)
const savingAlerts = ref(false)

// 加载预算信息
const loadBudgetInfo = async () => {
  try {
    loading.value = true
    const response = await getBudgetInfo()
    if (response.data) {
      budgetSetting.value = {
        monthly: response.data.monthly || 0,
        categories: response.data.categories || {}
      }
    }
  } catch (error) {
    console.error('加载预算信息失败:', error)
    ElMessage.warning('加载预算信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 保存预算设置
const saveBudget = async () => {
  try {
    savingBudget.value = true
    await updateBudget(budgetSetting.value)
    ElMessage.success('预算设置保存成功')
  } catch (error) {
    console.error('保存预算设置失败:', error)
    ElMessage.error('保存预算设置失败，请重试')
  } finally {
    savingBudget.value = false
  }
}

// 保存预警设置
const saveAlertSettings = async () => {
  try {
    savingAlerts.value = true
    // TODO: 调用预警设置API
    console.log('保存预警设置：', alertSettings.value)
    ElMessage.success('预警设置保存成功')
  } catch (error) {
    console.error('保存预警设置失败:', error)
    ElMessage.error('保存预警设置失败，请重试')
  } finally {
    savingAlerts.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadBudgetInfo()
})
</script>

<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2 class="page-title">⚠️ 消费预警</h2>
    </div>

    <!-- 预算设置 -->
    <el-card class="budget-setting-card" shadow="hover" :loading="loading">
      <template #header>
        <div class="card-title">
          <el-icon><Setting /></el-icon>
          <span>预算设置</span>
        </div>
      </template>

      <el-form :model="budgetSetting" label-width="120px">
        <el-form-item label="月度总预算">
          <el-input-number
            v-model="budgetSetting.monthly"
            :min="0"
            :precision="2"
            :step="100"
            :disabled="loading"
          />
          <span class="form-tip">元/月</span>
        </el-form-item>

        <el-divider />

        <el-form-item label="分类预算">
          <div class="category-budget-list">
            <div
              v-for="(amount, category) in budgetSetting.categories"
              :key="category"
              class="category-budget-item"
            >
              <span class="category-name">{{ category }}</span>
              <el-input-number
                v-model="budgetSetting.categories[category]"
                :min="0"
                :precision="0"
                :step="50"
                size="small"
                :disabled="loading"
              />
              <span class="form-tip">元</span>
            </div>
          </div>
          <div v-if="Object.keys(budgetSetting.categories).length === 0 && !loading" class="no-data">
            暂无分类预算数据，请先设置预算
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="saveBudget"
            :loading="savingBudget"
            :disabled="loading"
          >
            <el-icon><Check /></el-icon>
            保存预算设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预警设置 -->
    <el-card class="alert-setting-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon><Bell /></el-icon>
          <span>预警设置</span>
        </div>
      </template>

      <el-form :model="alertSettings" label-width="200px">
        <el-form-item label="预算使用达 80%">
          <el-switch v-model="alertSettings.budget80" />
          <span class="form-tip">黄色预警</span>
        </el-form-item>

        <el-form-item label="预算使用达 100%">
          <el-switch v-model="alertSettings.budget100" />
          <span class="form-tip">红色警告</span>
        </el-form-item>

        <el-form-item label="单笔大额消费">
          <el-switch v-model="alertSettings.largeAmount" />
          <span class="form-tip">超过 100 元自动提醒</span>
        </el-form-item>

        <el-form-item label="非必要消费占比过高">
          <el-switch v-model="alertSettings.unnecessaryRatio" />
          <span class="form-tip">超过 40% 时提醒</span>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="saveAlertSettings"
            :loading="savingAlerts"
          >
            <el-icon><Check /></el-icon>
            保存预警设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 消费分析 -->
    <el-card class="analysis-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>消费分析</span>
        </div>
      </template>

      <div class="analysis-placeholder">
        <el-icon size="48" class="placeholder-icon"><DataAnalysis /></el-icon>
        <h4>消费分析功能开发中</h4>
        <p>正在开发强大的消费分析功能，包括消费趋势、预算对比等</p>
        <el-button type="primary" plain disabled size="small">
          <el-icon><Clock /></el-icon>
          敬请期待
        </el-button>
      </div>
    </el-card>

    <!-- 智能建议 -->
    <el-card class="advice-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>智能建议</span>
        </div>
      </template>

      <div class="advice-placeholder">
        <el-icon size="48" class="placeholder-icon"><ChatDotRound /></el-icon>
        <h4>智能建议功能开发中</h4>
        <p>基于您的消费数据，我们将为您提供个性化的消费建议</p>
        <el-alert
          title="暂无建议"
          description="设置预算并记录消费后，系统将自动生成智能建议"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.statistics-page {
  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 28px;
      font-weight: bold;
      color: #2F4F4F;
      margin: 0;
    }
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;

    .el-icon {
      font-size: 20px;
      color: #2F4F4F;
    }
  }

  .budget-setting-card,
  .alert-setting-card,
  .analysis-card,
  .advice-card {
    margin-bottom: 24px;
    border-radius: 12px;
  }

  .form-tip {
    margin-left: 8px;
    color: #909399;
    font-size: 14px;
  }

  .category-budget-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .category-budget-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .category-name {
        min-width: 60px;
        font-size: 14px;
      }
    }
  }

  .no-data {
    text-align: center;
    color: #909399;
    font-size: 14px;
    padding: 20px;
  }

  .analysis-placeholder,
  .advice-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;

    .placeholder-icon {
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0 0 20px 0;
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}
</style>
