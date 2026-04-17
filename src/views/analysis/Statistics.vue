<script setup>
import { ref } from 'vue'

const budgetSetting = ref({
  monthly: 2000,
  categories: {
    '餐饮': 800,
    '交通': 200,
    '购物': 400,
    '娱乐': 300,
    '学习': 200,
    '其他': 100
  }
})

const alertSettings = ref({
  budget80: true,
  budget100: true,
  largeAmount: true,
  unnecessaryRatio: true
})

const saveBudget = () => {
  console.log('保存预算：', budgetSetting.value)
}

const saveAlertSettings = () => {
  console.log('保存预警设置：', alertSettings.value)
}
</script>

<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2 class="page-title">⚠️ 消费预警</h2>
    </div>

    <!-- 预算设置 -->
    <el-card class="budget-setting-card" shadow="hover">
      <div class="card-title">
        <el-icon><Setting /></el-icon>
        <span>预算设置</span>
      </div>

      <el-form :model="budgetSetting" label-width="120px">
        <el-form-item label="月度总预算">
          <el-input-number
            v-model="budgetSetting.monthly"
            :min="0"
            :precision="2"
            :step="100"
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
              />
              <span class="form-tip">元</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveBudget">
            <el-icon><Check /></el-icon>
            保存预算设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预警设置 -->
    <el-card class="alert-setting-card" shadow="hover">
      <div class="card-title">
        <el-icon><Bell /></el-icon>
        <span>预警设置</span>
      </div>

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
          <el-button type="primary" @click="saveAlertSettings">
            <el-icon><Check /></el-icon>
            保存预警设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 消费分析 -->
    <el-card class="analysis-card" shadow="hover">
      <div class="card-title">
        <el-icon><DataAnalysis /></el-icon>
        <span>消费分析</span>
      </div>

      <el-row :gutter="24">
        <el-col :span="12">
          <div class="chart-placeholder">
            <el-icon><PieChart /></el-icon>
            <span>消费分类占比饼图</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-placeholder">
            <el-icon><TrendCharts /></el-icon>
            <span>每日消费趋势折线图</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="24" style="margin-top: 24px">
        <el-col :span="12">
          <div class="chart-placeholder">
            <el-icon><Histogram /></el-icon>
            <span>预算 vs 实际支出对比</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-placeholder">
            <el-icon><MagicStick /></el-icon>
            <span>必要/非必要消费对比</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 智能建议 -->
    <el-card class="advice-card" shadow="hover">
      <div class="card-title">
        <el-icon><ChatDotRound /></el-icon>
        <span>智能建议</span>
      </div>

      <el-alert
        title="本月餐饮支出偏高"
        description="建议减少外卖次数，多去食堂就餐，预计可节省 150 元"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      />

      <el-alert
        title="非必要消费占比 35%"
        description="在合理范围内，继续保持理性消费"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      />

      <el-alert
        title="预计本月结余 750 元"
        description="按当前消费速度，月底可结余约 750 元，可用于下月规划"
        type="info"
        :closable="false"
        show-icon
      />
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

  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: #f5f7fa;
    border-radius: 12px;
    color: #909399;

    .el-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    span {
      font-size: 14px;
    }
  }
}
</style>
