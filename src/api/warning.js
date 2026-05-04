import request from '@/utils/request'

export function getBudgetWarning() {
  return request({
    url: '/warningRecords/budget-warning',
    method: 'get'
  })
}

export function checkConsumptionWarning(data) {
  return request({
    url: '/warningRecords/check',
    method: 'post',
    data
  })
}

export function getWarningRecords() {
  return request({
    url: '/warningRecords/records',
    method: 'get'
  })
}

export function getWarningUnreadCount() {
  return request({
    url: '/warningRecords/unread-count',
    method: 'get'
  })
}

export function markAllWarningsAsRead() {
  return request({
    url: '/warningRecords/read-all',
    method: 'put'
  })
}
