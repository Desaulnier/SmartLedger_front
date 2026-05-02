<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const showAddDialog = ref(false)
const newCategoryForm = ref({ name: '', icon: '📦', attribute: 1 })

const addNewCategory = () => {
  if (!newCategoryForm.value.name) return ElMessage.warning('请输入分类名称')
  ElMessage.success('分类添加成功')
  showAddDialog.value = false
}
</script>

<template>
  <el-dialog v-model="showAddDialog" title="添加自定义分类" width="500px">
    <el-form :model="newCategoryForm" label-width="100px">
      <el-form-item label="分类名称">
        <el-input v-model="newCategoryForm.name" placeholder="例如：追星周边" />
      </el-form-item>
      <el-form-item label="消费属性">
        <div class="attribute-options">
          <div class="attribute-option" :class="{ active: newCategoryForm.attribute === 1 }" @click="newCategoryForm.attribute = 1">
            <div>生存必需</div>
          </div>
          <div class="attribute-option" :class="{ active: newCategoryForm.attribute === 2 }" @click="newCategoryForm.attribute = 2">
            <div>改善生活</div>
          </div>
          <div class="attribute-option" :class="{ active: newCategoryForm.attribute === 3 }" @click="newCategoryForm.attribute = 3">
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