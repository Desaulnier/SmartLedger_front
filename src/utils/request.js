import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  const publicPaths = ['/users/login', '/users/register', '/users/send-code']

  if (token && !publicPaths.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, error => Promise.reject(error))

request.interceptors.response.use(response => {
  return response.data
}, error => {
  if (error.response) {
    const { status } = error.response

    switch (status) {
      case 401:
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
        break
      case 403:
        ElMessage.error('没有权限访问')
        break
      case 404:
        ElMessage.error('请求资源不存在')
        break
      case 500:
        ElMessage.error('服务器内部错误')
        break
      default:
        ElMessage.error('请求失败')
        break
    }
  } else {
    ElMessage.error('请检查网络连接')
  }

  return Promise.reject(error)
})

export default request
