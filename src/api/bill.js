import request from '@/utils/request'
export function createBill(data){
  return request.post('/bills/AddBills',data)
}

export function getBillList(params) {
  return request.get('/bills/list', { params })
}

export function importBill(formData) {
  return request.post('/bills/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export function updateBill(id, data) {
  return request.put(`/bills/${id}`, data)
}


export function deleteBill(id) {
  return request.delete(`/bills/${id}`)
}

export function confirmImport(data) {
  return request.post('/bills/confirm-import', data)
}

export function getAbnormalBillList(params) {
  return request.get('/bills/abnormal', { params })
}
