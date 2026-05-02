<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, ArrowDown } from '@element-plus/icons-vue'
import { allCategories } from '../constants'

const props = defineProps({
  modelValue: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue'])

const campusScenarios = ref([
  {
    name: '食堂套餐',
    icon: '🍱',
    is_default: 0,
    items: [
      { label: '早餐', amount: 5, categoryId: 1, remark: '食堂早餐', is_default: 0 },
      { label: '午餐', amount: 12, categoryId: 1, remark: '食堂午餐', is_default: 0 },
      { label: '晚餐', amount: 10, categoryId: 1, remark: '食堂晚餐', is_default: 0 },
      { label: '宵夜', amount: 15, categoryId: 27, remark: '宵夜', is_default: 0 }
    ]
  },
  {
    name: '周期消费',
    icon: '🔁',
    is_default: 0,
    items: [
      { label: '话费充值', amount: 50, categoryId: 6, remark: '月话费', is_default: 0 },
      { label: '校园网费', amount: 30, categoryId: 5, remark: '月网费', is_default: 0 },
      { label: '水卡充值', amount: 50, categoryId: 3, remark: '水费充值', is_default: 0 },
      { label: '电费充值', amount: 50, categoryId: 3, remark: '电费充值', is_default: 0 }
    ]
  },
  {
    name: '校园生活',
    icon: '🏫',
    is_default: 0,
    items: [
      { label: '快递代取', amount: 3, categoryId: 8, remark: '快递费', is_default: 0 },
      { label: '打印资料', amount: 5, categoryId: 10, remark: '打印复印', is_default: 0 },
      { label: '理发', amount: 20, categoryId: 9, remark: '理发剪发', is_default: 0 },
      { label: '奶茶续命', amount: 15, categoryId: 21, remark: '奶茶', is_default: 0 }
    ]
  }
])

const expandedScenario = ref(null)
const showCustomScenarioDialog = ref(false)
const customScenarioForm = ref({
  name: '',
  amount: 0,
  categoryId: null,
  remark: ''
})

const loadCustomScenarios = () => {
  const saved = localStorage.getItem('customScenarios')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.length && !campusScenarios.value.find((s) => s.name === '我的快捷记账')) {
        campusScenarios.value.push({
          name: '我的快捷记账',
          icon: '⭐',
          is_default: 0,
          items: parsed
        })
      }
    } catch (e) {}
  }
}

const saveCustomScenario = () => {
  if (!customScenarioForm.value.name) return ElMessage.warning('请输入名称')
  if (!customScenarioForm.value.categoryId) return ElMessage.warning('请选择分类')
  if (customScenarioForm.value.amount <= 0) return ElMessage.warning('请输入金额')

  const newItem = {
    label: customScenarioForm.value.name,
    amount: customScenarioForm.value.amount,
    categoryId: customScenarioForm.value.categoryId,
    remark: customScenarioForm.value.remark || customScenarioForm.value.name,
    is_default: 0
  }

  let customList = JSON.parse(localStorage.getItem('customScenarios') || '[]')
  customList.push(newItem)
  localStorage.setItem('customScenarios', JSON.stringify(customList))

  const idx = campusScenarios.value.findIndex((s) => s.name === '我的快捷记账')
  if (idx >= 0) {
    campusScenarios.value[idx].items = customList
  } else {
    campusScenarios.value.push({
      name: '我的快捷记账',
      icon: '⭐',
      is_default: 0,
      items: customList
    })
  }

  ElMessage.success('添加成功')
  showCustomScenarioDialog.value = false
  customScenarioForm.value = { name: '', amount: 0, categoryId: null, remark: '' }
}

const deleteScenario = async (idx) => {
  const scenario = campusScenarios.value[idx]
  if (scenario.is_default) return ElMessage.warning('系统默认不可删除')

  await ElMessageBox.confirm('确定删除该快捷场景吗？', '删除确认', { type: 'warning' })
  campusScenarios.value.splice(idx, 1)
  ElMessage.success('已删除')
}

const deleteScenarioItem = async (scenarioIndex, itemIndex) => {
  const scenario = campusScenarios.value[scenarioIndex]
  const item = scenario.items[itemIndex]
  if (item.is_default) return ElMessage.warning('系统默认不可删除')

  await ElMessageBox.confirm('确定删除该快捷项吗？', '删除确认', { type: 'warning' })
  scenario.items.splice(itemIndex, 1)

  if (scenario.name === '我的快捷记账') {
    localStorage.setItem('customScenarios', JSON.stringify(scenario.items))
  }

  ElMessage.success('已删除')
}

const toggleScenario = (idx) => {
  expandedScenario.value = expandedScenario.value === idx ? null : idx
}

const quickScenarioBill = (item) => {
  emit('update:modelValue', {
    ...props.modelValue,
    amount: item.amount,
    categoryId: item.categoryId,
    remark: item.remark,
    billTime: new Date().toISOString().split('T')[0]
  })
  ElMessage.success(`已填入 ${item.label}`)
}

onMounted(() => loadCustomScenarios())
</script>

<template>
  <div class="campus-scenario-section">
    <div class="section-header">
      <span class="section-title">
        <span class="title-icon">🏫</span>
        校园场景
      </span>
      <div class="header-right">
        <el-button text size="small" @click="showCustomScenarioDialog = true">
          <el-icon><Plus /></el-icon>
          自定义
        </el-button>
        <span class="section-tip">一键填入，贴近大学生活</span>
      </div>
    </div>

    <div class="scenario-list">
      <div v-for="(s, idx) in campusScenarios" :key="idx" class="scenario-card">
        <div class="scenario-header" @click="toggleScenario(idx)">
          <div class="scenario-info">
            <span class="scenario-icon">{{ s.icon }}</span>
            <span class="scenario-name">{{ s.name }}</span>
          </div>

          <div class="header-actions">
            <el-icon
              v-if="!s.is_default"
              class="delete-scenario-btn"
              @click.stop="deleteScenario(idx)"
            >
              <Delete />
            </el-icon>

            <el-icon class="expand-icon" :class="{ expanded: expandedScenario === idx }">
              <ArrowDown />
            </el-icon>
          </div>
        </div>

        <transition name="expand">
          <div v-show="expandedScenario === idx" class="scenario-items">
            <div
              v-for="(item, iidx) in s.items"
              :key="iidx"
              class="scenario-item"
              @click="quickScenarioBill(item)"
            >
              <span class="item-label">{{ item.label }}</span>
              <span class="item-amount">¥{{ item.amount }}</span>

              <el-icon
                v-if="!item.is_default"
                class="delete-item-btn"
                @click.stop="deleteScenarioItem(idx, iidx)"
              >
                <Delete />
              </el-icon>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>

  <el-dialog v-model="showCustomScenarioDialog" title="添加快捷记账" width="500px">
    <el-form :model="customScenarioForm" label-width="100px">
      <el-form-item label="名称">
        <el-input v-model="customScenarioForm.name" maxlength="20" show-word-limit />
      </el-form-item>

      <el-form-item label="金额">
        <el-input-number
          v-model="customScenarioForm.amount"
          :precision="2"
          :min="0"
          style="width:100%"
        />
      </el-form-item>

      <el-form-item label="分类">
        <el-select v-model="customScenarioForm.categoryId" style="width:100%">
          <el-option
            v-for="c in allCategories"
            :key="c.id"
            :label="`${c.icon} ${c.name}`"
            :value="c.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="customScenarioForm.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showCustomScenarioDialog = false">取消</el-button>
      <el-button type="primary" @click="saveCustomScenario">添加</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.campus-scenario-section {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 6px;

      .title-icon {
        font-size: 15px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;

      .add-scenario-btn {
        color: #2F4F4F;
        font-size: 12px;
        padding: 4px 8px;

        &:hover {
          color: #4a7c7c;
          background: #e8f5f0;
        }
      }

      .section-tip {
        font-size: 11px;
        color: #909399;
      }
    }
  }

  .scenario-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .scenario-card {
    border: 1px solid #ebeef5;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #2F4F4F;
      box-shadow: 0 2px 8px rgba(47, 79, 79, 0.1);
    }

    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      cursor: pointer;
      background: #fafafa;
      transition: background 0.3s;
      position: relative;

      &:hover {
        background: #f5f5f5;

        .delete-scenario-btn {
          opacity: 1;
        }
      }

      .scenario-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .scenario-icon {
          font-size: 18px;
        }

        .scenario-name {
          font-size: 13px;
          font-weight: 600;
          color: #303133;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;

        .delete-scenario-btn {
          color: #f56c6c;
          font-size: 14px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s;
          padding: 4px;
          border-radius: 4px;

          &:hover {
            background: #fef0f0;
          }
        }

        .expand-icon {
          font-size: 14px;
          color: #909399;
          transition: transform 0.3s;

          &.expanded {
            transform: rotate(180deg);
          }
        }
      }
    }

    .scenario-items {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      padding: 10px 12px;
      background: white;
    }

    .scenario-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      padding-right: 28px;
      background: linear-gradient(135deg, #f8fffe 0%, #f0f9f6 100%);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid transparent;
      position: relative;

      &:hover {
        background: linear-gradient(135deg, #e8f5f0 0%, #d4ede3 100%);
        border-color: #2F4F4F;
        transform: translateX(2px);

        .delete-item-btn {
          opacity: 1;
        }
      }

      .item-label {
        font-size: 12px;
        color: #606266;
      }

      .item-amount {
        font-size: 13px;
        font-weight: 700;
        color: #2F4F4F;
      }

      .delete-item-btn {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        color: #f56c6c;
        font-size: 14px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
        padding: 4px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.9);

        &:hover {
          background: #fef0f0;
        }
      }
    }
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
  opacity: 1;
}
</style>