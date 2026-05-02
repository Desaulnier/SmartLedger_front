import request from '@/utils/request'

/**
 * 获取账户列表
 */
export function getAccountList() {
  return request.get('/accounts/list')
}

/**
 * 新增账户
 */
export function createAccount(data) {
  return request.post('/accounts', data)
}

/**
 * 修改账户
 */
export function updateAccount(id, data) {
  return request.put(`/accounts/${id}`, data)
}

/**
 * 删除账户
 */
export function deleteAccount(id) {
  return request.delete(`/accounts/${id}`)
}

/**
 * 设置默认账户
 */
export function setDefaultAccount(id) {
  return request.put(`/accounts/${id}/set-default`)
}
