<template>
  <div class="consumption-rank-container">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up">
      <div class="header-left">
        <h2 class="page-title">
          <span class="title-icon pulse">🏆</span>
          消费排行榜
        </h2>
        <p class="page-subtitle">看看你这个月的消费习惯怎么样</p>
      </div>
      <el-radio-group v-model="rankPeriod" size="small">
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
      </el-radio-group>
    </div>

    <div class="main-layout">
      <!-- 左侧：评级 + 排行榜 -->
      <div class="left-panel">
        <!-- 我的消费评级 -->
        <el-card class="my-rank-card fade-in-up" shadow="hover">
          <div class="rank-content">
            <div class="rank-left">
              <div class="grade-circle" :class="rankInfo.gradeType">
                <div class="grade-text">{{ rankInfo.grade }}</div>
                <div class="grade-label">级</div>
              </div>
            </div>
            <div class="rank-right">
              <div class="rank-title">{{ rankInfo.title }}</div>
              <div class="rank-desc">{{ rankInfo.desc }}</div>
              <div class="rank-stats">
                <div class="stat-item" v-for="(stat, i) in rankInfo.stats" :key="i">
                  <span class="stat-label">{{ stat.label }}</span>
                  <span class="stat-value">{{ stat.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 排行榜 -->
        <el-card class="leaderboard-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">🏅 理智消费榜单</span>
          </template>

          <!-- TODO [后端接口]: GET /api/rank/my-grade -->
          <!-- <el-alert type="info" :closable="false" class="todo-alert-compact">
            <template #default>
              <strong>TODO [后端接口]</strong> GET /api/rank/my-grade · GET /api/rank/records
            </template>
          </el-alert> -->

          <div class="leaderboard-list">
            <div
              v-for="(item, index) in leaderboard"
              :key="item.id"
              class="leaderboard-item"
              :class="{ 'is-me': item.isMe }"
            >
              <div class="rank-badge" :class="getRankClass(index)">
                <span v-if="index < 3" class="rank-medal">{{ ['🥇', '', '🥉'][index] }}</span>
                <span v-else class="rank-num">{{ index + 1 }}</span>
              </div>
              <div class="user-info">
                <div class="user-avatar">{{ item.avatar }}</div>
                <div class="user-detail">
                  <div class="user-name">
                    {{ item.name }}
                    <el-tag v-if="item.isMe" type="primary" size="small" class="me-tag">我</el-tag>
                  </div>
                  <div class="user-grade">
                    <el-tag :type="item.gradeType" size="small">{{ item.grade }}级</el-tag>
                    <span class="user-desc">{{ item.desc }}</span>
                  </div>
                </div>
              </div>
              <div class="user-score">
                <div class="score-value">{{ item.score }}</div>
                <div class="score-label">健康分</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：习惯分析 + 成就 -->
      <div class="right-panel">
        <!-- 消费习惯分析 -->
        <el-card class="habit-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">🎯 消费习惯</span>
          </template>

          <div class="habit-list">
            <div class="habit-item" v-for="(habit, i) in habits" :key="i">
              <div class="habit-header">
                <span class="habit-icon">{{ habit.icon }}</span>
                <span class="habit-name">{{ habit.name }}</span>
              </div>
              <el-progress
                :percentage="habit.score"
                :color="habit.color"
                :stroke-width="8"
                :show-text="false"
              />
              <div class="habit-footer">
                <span class="habit-score">{{ habit.score }}分</span>
                <span class="habit-desc">{{ habit.desc }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 消费成就 -->
        <el-card class="achievement-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">🎖️ 成就</span>
          </template>
          <div class="achievement-list">
            <div
              v-for="(achievement, i) in achievements"
              :key="i"
              class="achievement-item"
              :class="{ unlocked: achievement.unlocked }"
            >
              <span class="achievement-icon">{{ achievement.icon }}</span>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-desc">{{ achievement.desc }}</div>
              </div>
              <el-tag v-if="achievement.unlocked" type="success" size="small">已解锁</el-tag>
              <el-tag v-else type="info" size="small">未解锁</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 升级攻略 -->
        <el-card class="upgrade-card fade-in-up" shadow="hover">
          <template #header>
            <span class="card-title">📈 升级攻略</span>
          </template>
          <div class="upgrade-tips">
            <div class="tip-item" v-for="(tip, i) in upgradeTips" :key="i">
              <span class="tip-text">{{ tip.text }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rankPeriod = ref('week')

const rankInfo = ref({
  grade: 'A',
  gradeType: 'success',
  title: '消费达人',
  desc: '消费习惯很棒！继续保持理性消费~',
  stats: [
    { label: '健康分', value: '85 分' },
    { label: '必需占比', value: '65%' },
    { label: '欲望占比', value: '15%' },
    { label: '预算使用', value: '72%' }
  ]
})

const leaderboard = ref([
  { id: 1, name: '张三', avatar: '😎', grade: 'S', gradeType: 'success', score: 95, desc: '极简消费', isMe: false },
  { id: 2, name: '我', avatar: '🤓', grade: 'A', gradeType: 'success', score: 85, desc: '消费达人', isMe: true },
  { id: 3, name: '李四', avatar: '😏', grade: 'A', gradeType: 'success', score: 82, desc: '理性消费', isMe: false },
  { id: 4, name: '王五', avatar: '😅', grade: 'B', gradeType: 'warning', score: 68, desc: '偶尔冲动', isMe: false },
  { id: 5, name: '赵六', avatar: '😰', grade: 'C', gradeType: 'warning', score: 52, desc: '需要控制', isMe: false }
])

const habits = ref([
  { icon: '🍱', name: '餐饮', score: 80, color: '#67c23a', desc: '以食堂为主' },
  { icon: '🎮', name: '娱乐', score: 60, color: '#e6a23c', desc: '偶尔充值' },
  { icon: '📚', name: '学习', score: 90, color: '#409eff', desc: '买书积极' },
  { icon: '👕', name: '购物', score: 70, color: '#67c23a', desc: '挺节制' },
  { icon: '🚌', name: '交通', score: 95, color: '#67c23a', desc: '基本坐校车' }
])

const achievements = ref([
  { icon: '💰', name: '存钱小能手', desc: '储蓄率达 30%', unlocked: true },
  { icon: '🍱', name: '食堂达人', desc: '食堂占比 >70%', unlocked: true },
  { icon: '🏆', name: '月度 S 级', desc: '连续一月 S 级', unlocked: false },
  { icon: '🎯', name: '预算控制者', desc: '预算使用 <80%', unlocked: true }
])

const upgradeTips = ref([
  { text: '减少奶茶、外卖等欲望消费' },
  { text: '多去食堂就餐，节约开支' },
  { text: '购物前列清单，避免冲动' },
  { text: '善用学生优惠' }
])

const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-normal'
}
</script>

<style scoped lang="scss">
.consumption-rank-container {
  padding: 0;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fade-in-up { animation: fadeInUp 0.5s ease-out both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, #2F4F4F 0%, #3a6363 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 12px;
  flex-shrink: 0;

  .header-left {
    .page-title {
      margin: 0 0 2px 0;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      .title-icon { font-size: 22px; }
    }
    .page-subtitle { margin: 0; font-size: 12px; opacity: 0.85; }
  }
}

// 主布局
.main-layout {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;

  .left-panel {
    flex: 1.3;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }
}

// 通用卡片
.el-card {
  border-radius: 12px;
  flex-shrink: 0;

  :deep(.el-card__header) {
    padding: 10px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.el-card__body) {
    padding: 12px 16px;
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.todo-alert-compact {
  margin-bottom: 10px;
  border-radius: 6px;
  font-size: 11px;
  padding: 6px 12px;
}

// 我的评级
.my-rank-card {
  .rank-content {
    display: flex;
    gap: 16px;
    align-items: center;

    .rank-left {
      .grade-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 4px solid;

        &.success { border-color: #67c23a; background: #f0f9f0; .grade-text { color: #67c23a; } }
        &.warning { border-color: #e6a23c; background: #fff8e1; .grade-text { color: #e6a23c; } }
        &.danger { border-color: #f56c6c; background: #ffebee; .grade-text { color: #f56c6c; } }

        .grade-text { font-size: 32px; font-weight: 700; line-height: 1; }
        .grade-label { font-size: 12px; margin-top: 2px; }
      }
    }

    .rank-right {
      flex: 1;
      .rank-title { font-size: 16px; font-weight: 700; color: #303133; margin-bottom: 4px; }
      .rank-desc { font-size: 12px; color: #606266; margin-bottom: 10px; }

      .rank-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 10px;
          background: #f8f9fa;
          border-radius: 6px;

          .stat-label { font-size: 11px; color: #909399; }
          .stat-value { font-size: 12px; font-weight: 600; color: #303133; }
        }
      }
    }
  }
}

// 排行榜
.leaderboard-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .leaderboard-list {
    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      margin-bottom: 6px;

      &.is-me {
        background: #e8f5f0;
        border-color: #2F4F4F;
      }

      .rank-badge {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        flex-shrink: 0;

        &.rank-gold { background: linear-gradient(135deg, #ffd700, #ffed4e); }
        &.rank-silver { background: linear-gradient(135deg, #c0c0c0, #e8e8e8); }
        &.rank-bronze { background: linear-gradient(135deg, #cd7f32, #e8a862); }
        &.rank-normal { background: #f0f0f0; color: #909399; }

        .rank-medal { font-size: 18px; }
        .rank-num { font-size: 14px; }
      }

      .user-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;

        .user-avatar { font-size: 24px; }

        .user-detail {
          .user-name {
            font-size: 13px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 2px;
            .me-tag { margin-left: 6px; }
          }
          .user-grade {
            display: flex;
            align-items: center;
            gap: 6px;
            .user-desc { font-size: 10px; color: #909399; }
          }
        }
      }

      .user-score {
        text-align: center;
        flex-shrink: 0;

        .score-value { font-size: 18px; font-weight: 700; color: #2F4F4F; }
        .score-label { font-size: 10px; color: #909399; }
      }
    }
  }
}

// 消费习惯
.habit-card {
  .habit-list {
    .habit-item {
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child { border-bottom: none; }

      .habit-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;

        .habit-icon { font-size: 14px; }
        .habit-name { font-size: 12px; font-weight: 600; color: #303133; }
      }

      .habit-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 3px;

        .habit-score { font-size: 11px; font-weight: 600; color: #303133; }
        .habit-desc { font-size: 10px; color: #909399; }
      }
    }
  }
}

// 成就
.achievement-card {
  .achievement-list {
    .achievement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border: 1px solid #ebeef5;
      border-radius: 6px;
      margin-bottom: 6px;

      &.unlocked { background: #f0f9f0; border-color: #67c23a; }

      .achievement-icon { font-size: 20px; }

      .achievement-info {
        flex: 1;
        .achievement-name { font-size: 12px; font-weight: 600; color: #303133; }
        .achievement-desc { font-size: 10px; color: #909399; }
      }
    }
  }
}

// 升级攻略
.upgrade-card {
  .upgrade-tips {
    .tip-item {
      padding: 5px 0;
      border-bottom: 1px solid #f5f5f5;
      font-size: 11px;
      color: #606266;

      &:last-child { border-bottom: none; }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .main-layout { flex-direction: column; }
}
</style>
