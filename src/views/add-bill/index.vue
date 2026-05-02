<script setup>
import { ref } from 'vue'
import BillQuickScene from './components/BillQuickScene.vue'
import BillCategory from './components/BillCategory.vue'
import BillForm from './components/BillForm.vue'
import BillImport from './components/BillImport.vue'
import BillDialog from './components/BillDialog.vue'

const billType = ref('EXPENSE')
const billForm = ref({
  amount: 0,
  categoryId: null,
  billTime: new Date().toISOString().split('T')[0],
  remark: ''
})
const submitting = ref(false)
</script>

<template>
  <div class="add-bill-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <span class="title-icon">📝</span>
          记一笔
        </h2>
        <p class="page-subtitle">每一笔都是成长的足迹</p>
      </div>
      <BillImport class="import-btn" />
    </div>

    <div class="main-content">
      <div class="content-left">
        <BillQuickScene v-model="billForm" />
        <BillCategory v-model="billType" :bill-form="billForm" />
      </div>

      <div class="content-right">
        <BillForm
          :bill-type="billType"
          v-model="billForm"
          v-model:submitting="submitting"
        />
      </div>
    </div>

    <BillDialog />
  </div>
</template>

<style scoped lang="scss">
.add-bill-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fffe 0%, #f0f9f6 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #2F4F4F 0%, #3a6363 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(47, 79, 79, 0.2);
}

.header-content {
  .page-title {
    margin: 0 0 4px 0;
    font-size: 22px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .page-subtitle {
    margin: 0;
    font-size: 12px;
    opacity: 0.85;
  }
}

.main-content {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;

  .content-left {
    flex: 1.5;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .content-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;

    .content-left,
    .content-right {
      flex: none;
    }
  }
}
</style>