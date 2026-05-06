import request from '@/utils/request'

export const getAdminStats = () => request.get('/admin/stats')
export const getAdminTrend = () => request.get('/admin/trend')
export const getAdminCategoryStats = () => request.get('/admin/category-stats')

export const getAdminUsers = (params) => request.get('/admin/users', { params })
export const updateAdminUserStatus = (id, data) => request.put(`/admin/users/${id}/status`, data)
export const deleteAdminUser = (id) => request.delete(`/admin/users/${id}`)

export const getAdminBills = (params) => request.get('/admin/bills', { params })
export const deleteAdminBill = (id) => request.delete(`/admin/bills/${id}`)