<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { allCategories } from '../constants'

const props = defineProps({
  modelValue: { type: String, default: 'EXPENSE' },
  billForm: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue'])

const localCategories = ref([...allCategories])
const isDeleteMode = ref(false)
const showAddDialog = ref(false)
const newCategoryForm = ref({
  name: '',
  icon: '🧾',
  attribute: 1
})

const displayCategories = computed(() => {
  return localCategories.value.filter((item) => item.type === props.modelValue)
})

const switchType = (type) => {
  emit('update:modelValue', type)
  props.billForm.categoryId = null
}

const selectCategory = (category) => {
  if (isDeleteMode.value) {
    if (category.is_default) {
      ElMessage.warning('系统默认分类不可删除')
      return
    }

    ElMessageBox.confirm(
      `确定要删除分类“${category.name}”吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      localCategories.value = localCategories.value.filter((c) => c.id !== category.id)
      ElMessage.success('删除成功')
    }).catch(() => {})
    return
  }

  props.billForm.categoryId = category.id
}

const addNewCategory = () => {
  if (!newCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  const newCat = {
    id: Date.now(),
    name: newCategoryForm.value.name,
    icon: newCategoryForm.value.icon,
    type: props.modelValue,
    is_default: 0,
    attribute: newCategoryForm.value.attribute
  }

  localCategories.value.push(newCat)
  ElMessage.success('分类添加成功')
  showAddDialog.value = false
  newCategoryForm.value = { name: '', icon: '🧾', attribute: 1 }
}
</script>

<template>
  <div class="bill-type-tabs">
    <div
      class="tab-item"
      :class="{ active: modelValue === 'EXPENSE' }"
      @click="switchType('EXPENSE')"
    >
      <span class="tab-icon">💸</span>
      <span class="tab-text">支出</span>
    </div>

    <div
      class="tab-item"
      :class="{ active: modelValue === 'INCOME' }"
      @click="switchType('INCOME')"
    >
      <span class="tab-icon">💰</span>
      <span class="tab-text">收入</span>
    </div>
  </div>

  <div class="category-section">
    <div class="section-header">
      <span class="section-title">选择分类</span>

      <div class="header-actions">
        <el-button
          text
          size="small"
          :type="isDeleteMode ? 'danger' : 'default'"
          @click="isDeleteMode = !isDeleteMode"
        >
          <el-icon><Delete /></el-icon>
          {{ isDeleteMode ? '完成' : '管理' }}
        </el-button>

        <el-button text size="small" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          自定义
        </el-button>
      </div>
    </div>

    <div class="category-wrapper">
      <el-scrollbar class="category-scroll">
        <div class="category-grid">
          <div
            v-for="cat in displayCategories"
            :key="cat.id"
            class="category-card"
            :class="{
              active: billForm.categoryId === cat.id && !isDeleteMode,
              deleteMode: isDeleteMode && !cat.is_default,
              disabled: isDeleteMode && cat.is_default
            }"
            @click="selectCategory(cat)"
          >
            <div class="card-icon">{{ cat.icon }}</div>
            <div class="card-name">{{ cat.name }}</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>

  <el-dialog v-model="showAddDialog" title="添加自定义分类" width="500px">
    <el-form :model="newCategoryForm" label-width="100px">
      <el-form-item label="分类名称">
        <el-input v-model="newCategoryForm.name" placeholder="例如：追星周边" />
      </el-form-item>

      <el-form-item label="消费属性">
        <div class="attribute-options">
          <div
            class="attribute-option"
            :class="{ active: newCategoryForm.attribute === 1 }"
            @click="newCategoryForm.attribute = 1"
          >
            <div>生存必需</div>
          </div>

          <div
            class="attribute-option"
            :class="{ active: newCategoryForm.attribute === 2 }"
            @click="newCategoryForm.attribute = 2"
          >
            <div>改善生活</div>
          </div>

          <div
            class="attribute-option"
            :class="{ active: newCategoryForm.attribute === 3 }"
            @click="newCategoryForm.attribute = 3"
          >
            <div>欲望消费</div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showAddDialog = false">取消</el-button>
      <el-button type="primary" @click="addNewCategory">添加</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.bill-type-tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
    color: #606266;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: linear-gradient(135deg, #2F4F4F 0%, #4a7c7c 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(47, 79, 79, 0.3);
    }

    .tab-icon {
      font-size: 20px;
    }

    .tab-text {
      font-size: 14px;
      font-weight: 600;
    }
  }
}

.category-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;
  display: flex;
  flex-direction: column;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      position: relative;
      padding-left: 10px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 14px;
        background: linear-gradient(180deg, #2F4F4F, #4a7c7c);
        border-radius: 2px;
      }
    }

    .header-actions {
      display: flex;
      gap: 6px;

      .delete-mode-btn {
        font-size: 12px;

        &.el-button--danger {
          color: #f56c6c;
        }
      }

      .add-category-btn {
        color: #2F4F4F;
        font-size: 12px;

        &:hover {
          color: #4a7c7c;
        }
      }
    }
  }
}

.category-wrapper {
  flex: 1;
  min-height: 0;

  .category-scroll {
    height: 100%;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 10px;
    padding-bottom: 8px;
  }

  .category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    background: #f8f9fa;
    position: relative;
    border: 2px solid transparent;

    &:hover {
      background: #e8f5f0;
      transform: translateY(-2px);
    }

    &.active {
      background: linear-gradient(135deg, #e8f5f0 0%, #d4ede3 100%);
      border-color: #2F4F4F;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(47, 79, 79, 0.2);

      .card-name {
        color: #2F4F4F;
        font-weight: 600;
      }
    }

    &.deleteMode {
      background: #fff1f0;
      border: 2px dashed #ff4d4f;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(50%);
    }

    .card-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .card-name {
      font-size: 11px;
      color: #606266;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
  }
}

.attribute-options {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .attribute-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid #e4e7ed;
    background: #f8f9fa;

    &:hover {
      background: #e8f5f0;
      border-color: #b2dfdb;
    }

    &.active {
      background: #e8f5f0;
      border-color: #2F4F4F;
      box-shadow: 0 2px 8px rgba(47, 79, 79, 0.2);
    }
  }
}
</style>