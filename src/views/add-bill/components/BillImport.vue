<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Delete } from '@element-plus/icons-vue'
import { importBill, confirmImport } from '@/api/bill'
import { allCategories } from '../constants'

const showPreviewDialog = ref(false)
const importFile = ref(null)
const previewData = ref([])
const importing = ref(false)
const importRecordId = ref(null)

const triggerFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv,.xlsx,.xls'
  input.onchange = (e) => {
    importFile.value = e.target.files[0]
    if (importFile.value) handleImport()
  }
  input.click()
}

const handleImport = async () => {
  if (!importFile.value) return

  importing.value = true
  try {
    const fd = new FormData()
    fd.append('file', importFile.value)
    const res = await importBill(fd)

    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '导入失败')
      return
    }

    previewData.value = (res.data?.billList || []).map(item => ({
      ...item,
      occurTime: item.occurTime ? item.occurTime.replace(' ', 'T') : new Date().toISOString()
    }))
    importRecordId.value = res.data?.importRecordId
    showPreviewDialog.value = true
    ElMessage.success('解析成功：' + previewData.value.length + ' 条')
  } catch (e) {
    console.error('导入失败', e)
    ElMessage.error('导入失败，请检查文件格式')
  } finally {
    importing.value = false
  }
}

const handleDeletePreviewRow = (idx) => {
  previewData.value.splice(idx, 1)
  ElMessage.success('已删除')
}

const expenseTotal = computed(() => {
  return previewData.value
    .filter((i) => i.billType === 'EXPENSE')
    .reduce((s, i) => s + Number(i.amount || 0), 0)
    .toFixed(2)
})

const incomeTotal = computed(() => {
  return previewData.value
    .filter((i) => i.billType === 'INCOME')
    .reduce((s, i) => s + Number(i.amount || 0), 0)
    .toFixed(2)
})

const handleConfirmImport = async () => {
  try {
    if (!importRecordId.value) {
      ElMessage.warning('请先解析账单文件')
      return
    }

    if (!previewData.value.length) {
      ElMessage.warning('没有可导入的账单')
      return
    }

    await ElMessageBox.confirm(
      `确定要导入 ${previewData.value.length} 条账单吗？`,
      '确认导入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    importing.value = true
    const res = await confirmImport({
      importRecordId: importRecordId.value,
      billList: previewData.value
    })

    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '导入失败')
      return
    }

    window.dispatchEvent(new Event('warning-count-refresh'))
ElMessage.success('导入成功')
    importRecordId.value = null
    importFile.value = null
    previewData.value = []
    showPreviewDialog.value = false
  } catch (e) {
    if (e !== 'cancel') {
      console.error('导入失败', e)
      ElMessage.error('导入失败，请稍后重试')
    }
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <el-button class="import-btn" @click="triggerFile">
    <el-icon><Upload /></el-icon>
    导入账单
  </el-button>

  <el-dialog v-model="showPreviewDialog" title="导入账单预览" width="900px">
    <el-table :data="previewData" border max-height="450">
      <el-table-column label="日期" width="180">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.occurTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            size="small"
            style="width: 100%"
          />
        </template>
      </el-table-column>

      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-select v-model="row.billType" size="small" style="width: 100%">
            <el-option label="支出" value="EXPENSE" />
            <el-option label="收入" value="INCOME" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="分类" width="140">
        <template #default="{ row }">
          <el-select v-model="row.categoryId" size="small" style="width: 100%">
            <el-option
              v-for="c in allCategories"
              :key="c.id"
              :label="`${c.icon} ${c.name}`"
              :value="c.id"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="金额" width="120">
        <template #default="{ row }">
          <el-input-number 
            v-model="row.amount" 
            :precision="2" 
            :min="0.01"
            size="small" 
            style="width: 100%"
          />
        </template>
      </el-table-column>

      <el-table-column label="备注" min-width="180">
        <template #default="{ row }">
          <el-input v-model="row.remark" size="small" placeholder="请输入备注" />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="70">
        <template #default="{ $index }">
          <el-button type="danger" text size="small" @click="handleDeletePreviewRow($index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <span>共 {{ previewData.length }} 条 · 支出 ¥{{ expenseTotal }} · 收入 ¥{{ incomeTotal }}</span>
      <div>
        <el-button @click="showPreviewDialog = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="handleConfirmImport">
          确认导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.import-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  border-radius: 16px;
}
</style>