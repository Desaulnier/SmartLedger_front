import request from '@/utils/request'

// 获取月度消费分析数据
export function getMonthlyAnalysis(month) {
  return request({
    url: '/analysis/monthly',
    method: 'get',
    params: { month }
  })
}

// 获取消费属性分析数据
export function getAttributeAnalysis(month) {
  return request({
    url: '/analysis/attribute',
    method: 'get',
    params: { month }
  })
}

// 获取消费趋势数据
export function getTrendAnalysis(month) {
  return request({
    url: '/analysis/trend',
    method: 'get',
    params: { month }
  })
}

// 获取智能消费建议
export function getAnalysisSuggestions(month) {
  return request({
    url: '/analysis/suggestions',
    method: 'get',
    params: { month }
  })
}