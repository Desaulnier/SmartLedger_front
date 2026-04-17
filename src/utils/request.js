import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api', // 使用相对路径，走 Vite 代理
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})
//响应拦截器 
request.interceptors.response.use(response => {
  return response.data  
}, error => {
  if(error.response){//统一处理错误码
    const {status} = error.response
    switch(status){
    case 401:ElMessage.error('登录过期，请重新登录')
    localStorage.removeItem('token')//移除token
    router.push('/login')//跳转登录页
      break;
    case 403:ElMessage.error('没有权限访问')
      break;
    case 404:ElMessage.error('请求资源不存在')
      break;
    case 500:ElMessage.error('服务器内部错误')
      break;
    default:ElMessage.error('请求失败')
      break;    }
  }
   else{
      ElMessage.error('请检查网络连接')
    }
    return Promise.reject(error)//返回错误信息
})

export default request
