import request from '@/utils/request'

export function getCategoryList() {
  return request.get('/categories/list')
}

export function addCategory(data) {
  return request.post('/categories/add', data)
}

export function deleteCategory(id) {
  return request.delete(`/categories/${id}`)
}
