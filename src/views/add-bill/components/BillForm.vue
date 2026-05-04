<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createBill } from '@/api/bill'
import { allCategories } from '../constants'

const props = defineProps({
  billType: { type: String, required: true },
  modelValue: { type: Object, required: true },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:submitting'])

const selectedCategoryInfo = computed(() => {
  if (!props.modelValue.categoryId) return null
  const cat = allCategories.find((c) => c.id === props.modelValue.categoryId)
  if (!cat) return null
  const map = { 1: '生存必需', 2: '改善生活', 3: '欲望消费' }
  return {
    name: cat.name,
    attribute: cat.attribute,
    attributeText: map[cat.attribute]
  }
})

const handleSubmit = async () => {
  if (!props.modelValue.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (!props.modelValue.amount || props.modelValue.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }

  emit('update:submitting', true)

  try {
    const dateTime = props.modelValue.billTime.includes('T') 
      ? props.modelValue.billTime 
      : props.modelValue.billTime + 'T' + new Date().toTimeString().split(' ')[0];

    const params = {
      amount: props.modelValue.amount,
      categoryId: props.modelValue.categoryId,
      occurTime: dateTime,
      remark: props.modelValue.remark || '',
      billType: props.billType
    }

    const res = await createBill(params)
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '保存失败')
      return
    }

    window.dispatchEvent(new Event('warning-count-refresh'))
ElMessage.success('记账成功')
    emit('update:modelValue', {
      amount: 0,
      categoryId: null,
      billTime: new Date().toISOString().split('T')[0],
      remark: ''
    })
  } catch (e) {
    console.error('记账失败', e)
    ElMessage.error('记账失败，请稍后重试')
  } finally {
    emit('update:submitting', false)
  }
}
</script>

<template>
  <div class="amount-section">
    <div class="amount-input-group">
      <span class="currency-symbol">¥</span>
      <el-input-number
        v-model="modelValue.amount"
        :precision="2"
        :controls="false"
        placeholder="0.00"
        class="amount-input"
      />
    </div>
  </div>

  <div class="detail-section">
    <el-form :model="modelValue" label-position="top" class="bill-form">
      <el-form-item label="日期">
        <el-date-picker
          v-model="props.modelValue.billTime"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="props.modelValue.remark"
          type="textarea"
          :rows="2"
          placeholder="记一下这笔账单的故事..."
        />
      </el-form-item>
    </el-form>

    <div v-if="selectedCategoryInfo && billType === 'EXPENSE'" class="attribute-hint">
      <span class="hint-text">系统识别：</span>
      <span class="attribute-tag" :class="`attribute-${selectedCategoryInfo.attribute}`">
        {{ selectedCategoryInfo.attributeText }}
      </span>
    </div>
  </div>

  <el-button
    type="primary"
    class="submit-btn"
    :loading="submitting"
    @click="handleSubmit"
  >
    {{ submitting ? '记账中...' : '✨ 确认记账' }}
  </el-button>
</template>

<style scoped lang="scss">
.amount-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .amount-input-group {
    display: flex;
    align-items: center;

    .currency-symbol {
      font-size: 28px;
      font-weight: 700;
      color: #2F4F4F;
      margin-right: 8px;
    }

    :deep(.amount-input) {
      flex: 1;

      .el-input__wrapper {
        box-shadow: none;
        padding: 0;
      }

      .el-input__inner {
        font-size: 36px;
        font-weight: 700;
        color: #303133;
      }
    }
  }
}

.detail-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;

  .bill-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      font-size: 13px;
      margin-bottom: 6px;
    }

    :deep(.el-input__wrapper) {
      border-radius: 8px;
    }
  }

  .attribute-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 8px;

    .hint-text {
      font-size: 13px;
      color: #606266;
    }

    .attribute-tag {
      padding: 4px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;

      &.attribute-1 {
        background: #e8f5e9;
        color: #2e7d32;
      }

      &.attribute-2 {
        background: #fff3e0;
        color: #ef6c00;
      }

      &.attribute-3 {
        background: #fce4ec;
        color: #c62828;
      }
    }
  }
}

.submit-btn {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #2F4F4F 0%, #4a7c7c 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(47, 79, 79, 0.3);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(47, 79, 79, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>