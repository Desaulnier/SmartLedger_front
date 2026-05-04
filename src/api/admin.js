import request from '@/utils/request'

export function getAdminStats() {
  return request.get('/admin/stats')
}

export function getAdminTrend() {
  return request.get('/admin/trend')
}

export function getAdminCategoryStats() {
  return request.get('/admin/category-stats')
}

export function getAdminUsers(params) {
  return request.get('/admin/users', { params })
}

export function updateAdminUserStatus(id, data) {
  return request.put(`/admin/users/${id}/status`, data)
}

export function deleteAdminUser(id) {
  return request.delete(`/admin/users/${id}`)
}

export function getAdminBills(params) {
  return request.get('/admin/bills', { params })
}

export function deleteAdminBill(id) {
  return request.delete(`/admin/bills/${id}`)
}
