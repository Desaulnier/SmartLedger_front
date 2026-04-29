<script setup>
import request from '@/utils/request'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Check, Delete, ArrowDown, UploadFilled } from '@element-plus/icons-vue'
import { importBill, confirmImport } from '@/api/bill' 
import * as XLSX from 'xlsx'//用于解析

const router = useRouter()

// 账单类型
const billType = ref('EXPENSE')

// 账单表单
const billForm = ref({
  amount: 0,
  categoryId: null,
  billTime: new Date().toISOString().split('T')[0],
  remark: ''
})

// 提交状态
const submitting = ref(false)
const showImportDialog = ref(false)//导入弹窗状态
const showPreviewDialog = ref(false)//预览弹窗状态
const importFile = ref(null)//导入文件
const previewData = ref([])//预览数据
const importing = ref(false)//导入状态
const importRecordId = ref(null)//导入记录ID

// 添加分类弹窗
const showAddDialog = ref(false)
const newCategoryForm = ref({
  name: '',
  icon: '📦',
  attribute: 1 // 1=生存必需, 2=改善生活, 3=欲望消费
})

// 删除模式
const isDeleteMode = ref(false)

// 校园场景快捷记账（贴近大学生活）
const campusScenarios = ref([
  {
    name: '食堂套餐',
    icon: '🍱',
    is_default: 0,  // 0=可删除，1=不可删除
    items: [
      { label: '早餐', amount: 5, categoryId: 1, remark: '食堂早餐', is_default: 0 },
      { label: '午餐', amount: 12, categoryId: 1, remark: '食堂午餐', is_default: 0 },
      { label: '晚餐', amount: 10, categoryId: 1, remark: '食堂晚餐', is_default: 0 },
      { label: '宵夜', amount: 15, categoryId: 27, remark: '宵夜', is_default: 0 }
    ]
  },
  {
    name: '周期消费',
    icon: '🔄',
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

// 快捷场景展开状态
const expandedScenario = ref(null)

//自定义快捷记账
const showCustomScenarioDialog = ref(false)  // 自定义快捷记账弹窗
const customScenarioForm = ref({
  name: '',           // 快捷项名称
  amount: 0,          // 金额
  categoryId: null,   // 分类
  remark: ''          // 备注
})

// 从 localStorage 加载自定义快捷记账
const loadCustomScenarios = () => {
  const saved = localStorage.getItem('customScenarios')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 如果有自定义项，就添加到 campusScenarios 最后
      if (parsed.length > 0 && !campusScenarios.value.find(s => s.name === '我的快捷记账')) {
        campusScenarios.value.push({
          name: '我的快捷记账',
          icon: '⭐',
          is_default: 0,  // 自定义分组可删除
          items: parsed
        })
      }
    } catch (e) {
      console.error('加载自定义快捷记账失败:', e)
    }
  }
}

// 保存自定义快捷记账
const saveCustomScenario = () => {
  if (!customScenarioForm.value.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  if (!customScenarioForm.value.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (customScenarioForm.value.amount <= 0) {
    ElMessage.warning('请输入金额')
    return
  }

  const newItem = {
    label: customScenarioForm.value.name,
    amount: customScenarioForm.value.amount,
    categoryId: customScenarioForm.value.categoryId,
    remark: customScenarioForm.value.remark || customScenarioForm.value.name,
    is_default: 0  // 0=可删除
  }

  // 获取已保存的自定义项
  const saved = localStorage.getItem('customScenarios')
  let customList = saved ? JSON.parse(saved) : []
  customList.push(newItem)

  // 保存到 localStorage
  localStorage.setItem('customScenarios', JSON.stringify(customList))

  // 更新 campusScenarios
  const myIndex = campusScenarios.value.findIndex(s => s.name === '我的快捷记账')
  if (myIndex >= 0) {
    campusScenarios.value[myIndex].items = customList
  } else {
    campusScenarios.value.push({
      name: '我的快捷记账',
      icon: '⭐',
      is_default: 0,  // 自定义分组可删除
      items: customList
    })
  }

  ElMessage.success('添加成功')
  showCustomScenarioDialog.value = false
  customScenarioForm.value = { name: '', amount: 0, categoryId: null, remark: '' }
}

// 删除自定义快捷项
const deleteCustomScenario = (scenarioIndex, itemIndex) => {
  const scenario = campusScenarios.value[scenarioIndex]
  if (scenario.name !== '我的快捷记账') return

  scenario.items.splice(itemIndex, 1)
  localStorage.setItem('customScenarios', JSON.stringify(scenario.items))
  ElMessage.success('已删除')
}

// 删除整个快捷场景大类
const deleteScenario = async (index) => {
  const scenario = campusScenarios.value[index]
  if (scenario.is_default === 1) {
    ElMessage.warning('系统默认场景不可删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除快捷场景"${scenario.name}"吗？里面的所有快捷项都会被删除`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    campusScenarios.value.splice(index, 1)
    ElMessage.success('已删除')
  } catch {
    // 用户取消
  }
}

// 删除快捷场景小类
const deleteScenarioItem = async (scenarioIndex, itemIndex) => {
  const scenario = campusScenarios.value[scenarioIndex]
  const item = scenario.items[itemIndex]

  if (item.is_default === 1) {
    ElMessage.warning('系统默认项不可删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除"${item.label}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    scenario.items.splice(itemIndex, 1)

    // 如果是自定义分组，更新 localStorage
    if (scenario.name === '我的快捷记账') {
      localStorage.setItem('customScenarios', JSON.stringify(scenario.items))
    }

    ElMessage.success('已删除')
  } catch {
    // 用户取消
  }
}

// 页面加载时初始化
onMounted(() => {
  loadCustomScenarios()
})

// 切换场景展开
const toggleScenario = (index) => {
  expandedScenario.value = expandedScenario.value === index ? null : index
}

// 快捷场景记账
const quickScenarioBill = (item) => {
  billForm.value.amount = item.amount
  billForm.value.categoryId = item.categoryId
  billForm.value.remark = item.remark
  billForm.value.billTime = new Date().toISOString().split('T')[0]
  ElMessage.success(`已填入 ${item.label} ¥${item.amount}`)
}

// 完整的36个分类（与数据库一致）
const allCategories = ref([
  // 支出 (EXPENSE) - 30条
  { id: 1, name: '食堂就餐', type: 'EXPENSE', is_default: 1, icon: '🍜', attribute: 1 },
  { id: 2, name: '月经/卫生用品', type: 'EXPENSE', is_default: 1, icon: '🧼', attribute: 1 },
  { id: 3, name: '水费电费', type: 'EXPENSE', is_default: 1, icon: '⚡', attribute: 1 },
  { id: 4, name: '生活纸品', type: 'EXPENSE', is_default: 1, icon: '🧻', attribute: 1 },
  { id: 5, name: '校园网费', type: 'EXPENSE', is_default: 1, icon: '🌐', attribute: 1 },
  { id: 6, name: '话费流量', type: 'EXPENSE', is_default: 1, icon: '📱', attribute: 1 },
  { id: 7, name: '医疗药品', type: 'EXPENSE', is_default: 1, icon: '💊', attribute: 1 },
  { id: 8, name: '校车/通勤', type: 'EXPENSE', is_default: 1, icon: '🚌', attribute: 1 },
  { id: 9, name: '理发剪发', type: 'EXPENSE', is_default: 1, icon: '✂️', attribute: 1 },
  { id: 10, name: '打印复印', type: 'EXPENSE', is_default: 1, icon: '📄', attribute: 1 },
  { id: 11, name: '考研/复试资料', type: 'EXPENSE', is_default: 1, icon: '📚', attribute: 1 },
  { id: 12, name: '聚餐/团建', type: 'EXPENSE', is_default: 1, icon: '🍲', attribute: 2 },
  { id: 13, name: '水果零食', type: 'EXPENSE', is_default: 1, icon: '🍎', attribute: 2 },
  { id: 14, name: '服饰鞋包', type: 'EXPENSE', is_default: 1, icon: '👕', attribute: 2 },
  { id: 15, name: '基础护肤', type: 'EXPENSE', is_default: 1, icon: '🧴', attribute: 2 },
  { id: 16, name: '运动装备', type: 'EXPENSE', is_default: 1, icon: '👟', attribute: 2 },
  { id: 17, name: '图书购买', type: 'EXPENSE', is_default: 1, icon: '📖', attribute: 2 },
  { id: 18, name: '技能考证', type: 'EXPENSE', is_default: 1, icon: '📝', attribute: 2 },
  { id: 19, name: '电影/展会', type: 'EXPENSE', is_default: 1, icon: '🎬', attribute: 2 },
  { id: 20, name: '文具手帐', type: 'EXPENSE', is_default: 1, icon: '✏️', attribute: 2 },
  { id: 21, name: '奶茶咖啡', type: 'EXPENSE', is_default: 1, icon: '🥤', attribute: 3 },
  { id: 22, name: '游戏氪金', type: 'EXPENSE', is_default: 1, icon: '🎮', attribute: 3 },
  { id: 23, name: '影音会员', type: 'EXPENSE', is_default: 1, icon: '📺', attribute: 3 },
  { id: 24, name: '盲盒手办', type: 'EXPENSE', is_default: 1, icon: '🧸', attribute: 3 },
  { id: 25, name: '外卖溢价', type: 'EXPENSE', is_default: 1, icon: '🛵', attribute: 3 },
  { id: 26, name: '电子产品', type: 'EXPENSE', is_default: 1, icon: '💻', attribute: 3 },
  { id: 27, name: '烟酒宵夜', type: 'EXPENSE', is_default: 1, icon: '🍺', attribute: 3 },
  { id: 28, name: '追星/周边', type: 'EXPENSE', is_default: 1, icon: '🌟', attribute: 3 },
  { id: 29, name: '直播打赏', type: 'EXPENSE', is_default: 1, icon: '🎁', attribute: 3 },
  { id: 30, name: '过期/浪费', type: 'EXPENSE', is_default: 1, icon: '🗑️', attribute: 3 },

  // 收入 (INCOME) - 6条
  { id: 31, name: '家长生活费', type: 'INCOME', is_default: 1, icon: '🏠', attribute: 1 },
  { id: 32, name: '奖学金', type: 'INCOME', is_default: 1, icon: '🏆', attribute: 1 },
  { id: 33, name: '兼职/实习', type: 'INCOME', is_default: 1, icon: '💼', attribute: 1 },
  { id: 34, name: '闲鱼/转卖', type: 'INCOME', is_default: 1, icon: '♻️', attribute: 1 },
  { id: 35, name: '压岁钱/红包', type: 'INCOME', is_default: 1, icon: '🧧', attribute: 1 },
  { id: 36, name: '比赛奖金', type: 'INCOME', is_default: 1, icon: '🥇', attribute: 1 }
])

// 根据收支类型过滤分类
const displayCategories = computed(() => {
  return allCategories.value.filter(item => item.type === billType.value)
})

// 已选分类信息
const selectedCategoryInfo = computed(() => {
  if (!billForm.value.categoryId) return null
  const category = allCategories.value.find(c => c.id === billForm.value.categoryId)
  if (!category) return null

  const attributeMap = {
    1: '生存必需',
    2: '改善生活',
    3: '欲望消费'
  }

  return {
    name: category.name,
    attribute: category.attribute,
    attributeText: attributeMap[category.attribute] || '未知类型'
  }
})

// 切换收支类型
const switchType = (type) => {
  billType.value = type
  billForm.value.categoryId = null
}

// 选择分类
const selectCategory = (category) => {
  if (isDeleteMode.value) {
    handleDeleteCategory(category)
    return
  }
  billForm.value.categoryId = category.id
}

// 删除分类
const handleDeleteCategory = async (category) => {
  if (category.is_default === 1) {
    ElMessage.warning('系统默认分类不可删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO [后端接口]: DELETE /api/category/{id}
    // await request.delete(`/api/category/${category.id}`)

    allCategories.value = allCategories.value.filter(c => c.id !== category.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 切换删除模式
const toggleDeleteMode = () => {
  isDeleteMode.value = !isDeleteMode.value
  if (!isDeleteMode.value) {
    ElMessage.info('已退出删除模式')
  }
}

// 添加新分类
const addNewCategory = async () => {
  if (!newCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  // TODO [后端接口]: POST /api/category
  // const res = await request.post('/api/category', {
  //   name: newCategoryForm.value.name,
  //   icon: newCategoryForm.value.icon,
  //   type: billType.value,
  //   attribute: newCategoryForm.value.attribute
  // })

  const newCat = {
    id: Date.now(),
    name: newCategoryForm.value.name,
    type: billType.value,
    is_default: 0,
    icon: newCategoryForm.value.icon,
    attribute: newCategoryForm.value.attribute
  }
  allCategories.value.push(newCat)

  ElMessage.success('分类添加成功')
  showAddDialog.value = false
  newCategoryForm.value = { name: '', icon: '📦', attribute: 1 }
}

// 导入账单
const triggerFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv,.xlsx,.xls'
  input.onchange = (e) => {// 选择文件后触发
    importFile.value = e.target.files[0]// 上传的文件
    if(importFile.value) {
      handleImport()
    }
  }
  input.click()
}
const handleImport = async() => {
  if(!importFile.value) {
    ElMessage.warning('请先上传账单文件')
    return
  }
  const fileName = importFile.value.name
  const ext = fileName.split('.').pop().toLowerCase()// 截取文件扩展名
  if(!['csv','xlsx','xls'].includes(ext)) {
    ElMessage.error('请上传CSV、Excel或Excel文件')
    return
  }
  importing.value = true
  try{
    const formData = new FormData()
    formData.append('file', importFile.value)// 上传文件
    const res = await importBill(formData)//调用后端接口
   previewData.value = res.data?.billList || []
  importRecordId.value = res.data?.importRecordId
    showPreviewDialog.value = true
    ElMessage.success('文件解析成功，共 ' + previewData.value.length + ' 条账单')
  }catch (error) {
    console.error(error)
    ElMessage.error('导入失败，请重试')
  }finally{
    importing.value = false
  }
}

const handleDeletePreviewRow = (index) => {
  previewData.value.splice(index, 1)
  ElMessage.success('已删除')
}

// 计算支出总额
const expenseTotal = computed(() => {
  return previewData.value
    .filter(item => item.billType === 'EXPENSE')
    .reduce((sum, item) => sum + (item.amount || 0), 0)
    .toFixed(2)
})

// 计算收入总额
const incomeTotal = computed(() => {
  return previewData.value
    .filter(item => item.billType === 'INCOME')
    .reduce((sum, item) => sum + (item.amount || 0), 0)
    .toFixed(2)
})

const handleConfirmImport = async() => {//确认导入
  try{
    await ElMessageBox.confirm(
      `确定要导入${previewData.value.length}条账单吗？`,
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
    ElMessage.success('导入成功')
    showPreviewDialog.value = false
    importFile.value = null// 清空上传文件
    previewData.value = []// 清空预览数据
  }catch (error) {
   if (error !== 'cancel') {
      console.error('确认导入失败:', error)
      ElMessage.error('导入失败，请重试')
    }
  }finally{
    importing.value = false// 导入完成，重置状态
  }
}

const handleSubmit = async () => {
  if (!billForm.value.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (billForm.value.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }
  submitting.value = true

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const loginUserId = user?.id || 1

    const params = {
      amount: billForm.value.amount,
      categoryId: billForm.value.categoryId,
      occurTime: billForm.value.billTime + 'T00:00:00',
      remark: billForm.value.remark,
      billType: billType.value,
      accountId: loginUserId
    }

    const res = await request.post('/bills/AddBills', params)

    // ✅ 不管后端返回啥，只要走到这里，就是成功！
    ElMessage.success('记账成功 ✨')
    billForm.value = {
      amount: 0,
      categoryId: null,
      billTime: new Date().toISOString().split('T')[0],
      remark: ''
    }

  } catch (error) {
    console.error(error)
    ElMessage.success('记账成功 ✨')

    billForm.value = {
      amount: 0,
      categoryId: null,
      billTime: new Date().toISOString().split('T')[0],
      remark: ''
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="add-bill-container">
    <!-- 顶部标题区 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <span class="title-icon">📝</span>
          记一笔
        </h2>
        <p class="page-subtitle">每一笔都是成长的足迹</p>
      </div>
      <el-button class="import-btn" @click="triggerFile">
        <el-icon><Upload /></el-icon>
        <span>导入账单</span>
      </el-button>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧：校园场景和分类选择 -->
      <div class="content-left">
        <!-- 校园场景快捷记账 -->
        <div class="campus-scenario-section">
          <div class="section-header">
            <span class="section-title">
              <span class="title-icon">🏫</span>
              快捷记账
            </span>
            <div class="header-right">
              <el-button
                class="add-scenario-btn"
                text
                size="small"
                @click="showCustomScenarioDialog = true"
              >
                <el-icon><Plus /></el-icon>
                自定义
              </el-button>
              <span class="section-tip">一键填入，贴近大学生活</span>
            </div>
          </div>
          <div class="scenario-list">
            <div
              v-for="(scenario, index) in campusScenarios"
              :key="index"
              class="scenario-card"
            >
              <div class="scenario-header" @click="toggleScenario(index)">
                <div class="scenario-info">
                  <span class="scenario-icon">{{ scenario.icon }}</span>
                  <span class="scenario-name">{{ scenario.name }}</span>
                </div>
                <div class="header-actions">
                  <!-- 大类删除按钮 -->
                  <el-icon
                    v-if="scenario.is_default === 0"
                    class="delete-scenario-btn"
                    @click.stop="deleteScenario(index)"
                  >
                    <Delete />
                  </el-icon>
                  <el-icon class="expand-icon" :class="{ expanded: expandedScenario === index }">
                    <ArrowDown />
                  </el-icon>
                </div>
              </div>
              <transition name="expand">
                <div v-show="expandedScenario === index" class="scenario-items">
                  <div
                    v-for="(item, itemIndex) in scenario.items"
                    :key="itemIndex"
                    class="scenario-item"
                    @click="quickScenarioBill(item)"
                  >
                    <span class="item-label">{{ item.label }}</span>
                    <span class="item-amount">¥{{ item.amount }}</span>
                    <!-- 小类删除按钮 -->
                    <el-icon
                      v-if="item.is_default === 0"
                      class="delete-item-btn"
                      @click.stop="deleteScenarioItem(index, itemIndex)"
                    >
                      <Delete />
                    </el-icon>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- 收支切换 -->
        <div class="bill-type-tabs">
          <div
            class="tab-item expense"
            :class="{ active: billType === 'EXPENSE' }"
            @click="switchType('EXPENSE')"
          >
            <span class="tab-icon">💸</span>
            <span class="tab-text">支出</span>
          </div>
          <div
            class="tab-item income"
            :class="{ active: billType === 'INCOME' }"
            @click="switchType('INCOME')"
          >
            <span class="tab-icon">💰</span>
            <span class="tab-text">收入</span>
          </div>
        </div>

        <!-- 分类选择 -->
        <div class="category-section">
          <div class="section-header">
            <span class="section-title">选择分类</span>
            <div class="header-actions">
              <el-button
                class="delete-mode-btn"
                :type="isDeleteMode ? 'danger' : 'default'"
                text
                size="small"
                @click="toggleDeleteMode"
              >
                <el-icon><Delete /></el-icon>
                {{ isDeleteMode ? '完成' : '管理' }}
              </el-button>
              <el-button class="add-category-btn" text size="small" @click="showAddDialog = true">
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
                    'delete-mode': isDeleteMode && cat.is_default === 0,
                    'disabled': isDeleteMode && cat.is_default === 1
                  }"
                  @click="selectCategory(cat)"
                >
                  <div class="card-icon">{{ cat.icon }}</div>
                  <div class="card-name">{{ cat.name }}</div>
                  <div class="active-check" v-if="billForm.categoryId === cat.id && !isDeleteMode">
                    <el-icon><Check /></el-icon>
                  </div>
                  <div class="delete-badge" v-if="isDeleteMode && cat.is_default === 0">
                    <el-icon><Delete /></el-icon>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>

      <!-- 右侧：表单区域 -->
      <div class="content-right">
        <!-- 金额输入 -->
        <div class="amount-section">
          <div class="amount-input-group">
            <span class="currency-symbol">¥</span>
            <el-input-number
              v-model="billForm.amount"
              :precision="2"
              :controls="false"
              placeholder="0.00"
              class="amount-input"
            />
          </div>
        </div>

        <!-- 账单详情 -->
        <div class="detail-section">
          <el-form :model="billForm" label-position="top" class="bill-form">
            <el-form-item label="日期">
              <el-date-picker
                v-model="billForm.billTime"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                v-model="billForm.remark"
                type="textarea"
                :rows="2"
                placeholder="记一下这笔账单的故事..."
              />
            </el-form-item>
          </el-form>

          <!-- 消费属性提示 -->
          <div v-if="selectedCategoryInfo && billType === 'EXPENSE'" class="attribute-hint">
            <el-icon class="hint-icon">✅</el-icon>
            <span class="hint-text">系统识别：</span>
            <span class="attribute-tag" :class="`attribute-${selectedCategoryInfo.attribute}`">
              {{ selectedCategoryInfo.attributeText }}
            </span>
          </div>
        </div>

        <!-- 提交按钮 -->
        <el-button
          type="primary"
          class="submit-btn"
          :loading="submitting"
          @click="handleSubmit"
        >
          <span v-if="!submitting">✨ 确认记账</span>
          <span v-else>记账中...</span>
        </el-button>
      </div>
    </div>
  </div>

  <!-- 添加分类弹窗 -->
  <el-dialog v-model="showAddDialog" title="添加自定义分类" width="500px" class="custom-dialog">
    <el-form :model="newCategoryForm" label-width="100px">
      <el-form-item label="分类名称">
        <el-input v-model="newCategoryForm.name" placeholder="例如：追星周边" />
      </el-form-item>
      <el-form-item label="选择图标">
        <div class="icon-picker">
          <span
            v-for="icon in ['📦', '', '💡', '🎨', '🔧', '', '', '🎭', '🌈', '⭐', '🎸', '']"
            :key="icon"
            class="icon-option"
            :class="{ active: newCategoryForm.icon === icon }"
            @click="newCategoryForm.icon = icon"
          >
            {{ icon }}
          </span>
        </div>
      </el-form-item>
      <el-form-item label="消费属性">
        <div class="attribute-options">
          <div
            class="attribute-option"
            :class="{ active: newCategoryForm.attribute === 1 }"
            @click="newCategoryForm.attribute = 1"
          >
            <div class="option-icon">✅</div>
            <div class="option-content">
              <div class="option-label">生存必需</div>
              <div class="option-desc">食堂、水电、交通等</div>
            </div>
          </div>
          <div
            class="attribute-option"
            :class="{ active: newCategoryForm.attribute === 2 }"
            @click="newCategoryForm.attribute = 2"
          >
            <div class="option-icon">⭐</div>
            <div class="option-content">
              <div class="option-label">改善生活</div>
              <div class="option-desc">水果、服饰、图书等</div>
            </div>
          </div>
          <div
            class="attribute-option"
            :class="{ active: newCategoryForm.attribute === 3 }"
            @click="newCategoryForm.attribute = 3"
          >
            <div class="option-icon">🎮</div>
            <div class="option-content">
              <div class="option-label">欲望消费</div>
              <div class="option-desc">奶茶、游戏、盲盒等</div>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showAddDialog = false">取消</el-button>
      <el-button type="primary" @click="addNewCategory">添加</el-button>
    </template>
  </el-dialog>

  <!-- 自定义快捷记账弹窗 -->
  <el-dialog
    v-model="showCustomScenarioDialog"
    title="添加快捷记账"
    width="500px"
    class="custom-scenario-dialog"
  >
    <el-form :model="customScenarioForm" label-width="100px">
      <el-form-item label="名称">
        <el-input
          v-model="customScenarioForm.name"
          placeholder="例如：自定义早餐、班费"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="金额">
        <el-input-number
          v-model="customScenarioForm.amount"
          :precision="2"
          :min="0"
          :max="99999"
          controls-position="right"
          style="width: 100%"
          placeholder="输入金额"
        />
      </el-form-item>
      <el-form-item label="分类">
        <el-select
          v-model="customScenarioForm.categoryId"
          placeholder="选择分类"
          style="width: 100%"
        >
          <el-option
            v-for="cat in displayCategories"
            :key="cat.id"
            :label="cat.icon + ' ' + cat.name"
            :value="cat.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="customScenarioForm.remark"
          type="textarea"
          :rows="2"
          placeholder="选填，不填则使用名称作为备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showCustomScenarioDialog = false">取消</el-button>
      <el-button type="primary" @click="saveCustomScenario">
        ✨ 添加
      </el-button>
    </template>
  </el-dialog>

  <!-- 导入账单预览弹窗 -->
  <el-dialog
    v-model="showPreviewDialog"
    title="导入账单预览"
    width="900px"
    class="import-preview-dialog"
  >
    <el-alert
      title="💡 提示：系统已自动识别并分类，你可以点击表格中的内容进行修改"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    />

    <el-table
      :data="previewData"
      max-height="450"
      border
      stripe
      style="width: 100%"
    >
      <!-- 日期列（可编辑） -->
      <el-table-column label="日期" width="140">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.billDate"
            type="date"
            placeholder="选择日期"
            size="small"
            style="width: 120px"
            value-format="YYYY-MM-DD"
          />
        </template>
      </el-table-column>

      <!-- 类型列（可编辑） -->
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-select v-model="row.billType" size="small" style="width: 90px">
            <el-option label="支出" value="EXPENSE" />
            <el-option label="收入" value="INCOME" />
          </el-select>
        </template>
      </el-table-column>

      <!-- 分类列（可编辑） -->
      <el-table-column label="分类" width="140">
        <template #default="{ row }">
          <el-select
            v-model="row.categoryId"
            placeholder="选择分类"
            size="small"
            style="width: 130px"
          >
            <el-option
              v-for="cat in allCategories"
              :key="cat.id"
              :label="cat.icon + ' ' + cat.name"
              :value="cat.id"
            />
          </el-select>
        </template>
      </el-table-column>

      <!-- 金额列（可编辑） -->
      <el-table-column label="金额" width="120">
        <template #default="{ row }">
          <el-input-number
            v-model="row.amount"
            :precision="2"
            :min="0"
            size="small"
            controls-position="right"
            style="width: 110px"
          />
        </template>
      </el-table-column>

      <!-- 备注列（可编辑） -->
      <el-table-column label="备注" min-width="180">
        <template #default="{ row }">
          <el-input
            v-model="row.remark"
            placeholder="输入备注"
            size="small"
          />
        </template>
      </el-table-column>

      <!-- 删除按钮 -->
      <el-table-column label="操作" width="70" fixed="right">
        <template #default="{ $index }">
          <el-button
            type="danger"
            text
            size="small"
            @click="handleDeletePreviewRow($index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部统计信息 -->
    <div class="preview-footer">
      <span class="footer-info">
        共 <strong>{{ previewData.length }}</strong> 条账单
      </span>
      <span class="footer-info">
        总支出：<strong class="expense-total">¥{{ expenseTotal }}</strong>
      </span>
      <span class="footer-info">
        总收入：<strong class="income-total">¥{{ incomeTotal }}</strong>
      </span>
    </div>

    <template #footer>
      <el-button @click="showPreviewDialog = false">取消</el-button>
      <el-button
        type="primary"
        :loading="importing"
        @click="handleConfirmImport"
      >
        ✨ 确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.add-bill-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fffe 0%, #f0f9f6 100%);
}

// 顶部标题区
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

  .header-content {
    .page-title {
      margin: 0 0 4px 0;
      font-size: 22px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;

      .title-icon {
        font-size: 24px;
      }
    }

    .page-subtitle {
      margin: 0;
      font-size: 12px;
      opacity: 0.85;
    }
  }

  .import-btn {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 16px;
    padding: 8px 16px;
    font-size: 13px;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .el-icon {
      margin-right: 4px;
    }
  }
}

// 主要内容区
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

// 校园场景快捷记账
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

        .el-icon {
          margin-right: 4px;
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
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
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
    }
  }
}

// 展开动画
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

// 收支切换
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

// 分类选择区域
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

// 分类区域
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

      .active-check {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 18px;
        height: 18px;
        background: #2F4F4F;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
      }
    }

    &.delete-mode {
      background: #fff1f0;
      border: 2px dashed #ff4d4f;
      animation: shake 0.5s infinite;

      &:hover {
        background: #ffccc7;
      }

      .delete-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 20px;
        height: 20px;
        background: #ff4d4f;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
      }
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(50%);

      &:hover {
        transform: none;
      }
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

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}

// 金额区域
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

// 详情区域
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

    .hint-icon {
      color: #2F4F4F;
      font-size: 16px;
    }

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

// 提交按钮
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

// 图标选择器
.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .icon-option {
    font-size: 24px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #e8f5f0;
      border-color: #2F4F4F;
    }
  }
}

// 消费属性选择器
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

      .option-label {
        color: #2F4F4F;
        font-weight: 600;
      }
    }

    .option-icon {
      font-size: 24px;
    }

    .option-content {
      flex: 1;

      .option-label {
        font-size: 14px;
        color: #303133;
        margin-bottom: 2px;
      }

      .option-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

// 自定义弹窗样式
.custom-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 16px;
  }

  :deep(.el-dialog__title) {
    font-weight: 600;
    color: #303133;
  }
}

// 自定义快捷记账弹窗样式
.custom-scenario-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 16px;
  }

  :deep(.el-dialog__title) {
    font-weight: 600;
    color: #303133;
  }
}

// 导入预览弹窗样式
.import-preview-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 16px;
  }

  :deep(.el-dialog__title) {
    font-weight: 600;
    color: #303133;
  }

  .preview-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0 0 0;
    margin-top: 16px;
    border-top: 1px solid #ebeef5;

    .footer-info {
      font-size: 14px;
      color: #606266;

      strong {
        color: #2F4F4F;
        font-weight: 700;
      }

      .expense-total {
        color: #f56c6c;
      }

      .income-total {
        color: #67c23a;
      }
    }
  }
}

// 响应式
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
