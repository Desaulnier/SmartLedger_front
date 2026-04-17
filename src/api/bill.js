import request from '@/utils/request'
export function createBill(data){
  return request.post('/bills',data)
}

export function getBillList(params) {
  return request.get('/bills', { params })
}

export function importBill(formData) {
  return request.post('/bills/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function deleteBill(id) {
  return request.delete('/bills/delete_bill',{id})
}

export function confirmImport(data) {
  return request.post('/bills/confirm-import', data)
}