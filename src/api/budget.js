import request from '@/utils/request'

// 获取预算信息
export function getBudgetInfo() {
  return request({
    url: '/budget/info',
    method: 'get'
  })
}

// 更新生活费设置
export function updateAllowance(data) {
  return request({
    url: '/budget/allowance',
    method: 'put',
    data
  })
}

// 更新预算设置
export function updateBudget(data) {
  return request({
    url: '/budget',
    method: 'put',
    data
  })
}