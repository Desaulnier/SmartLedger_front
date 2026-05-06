import request from '@/utils/request'

export function getLeaderboard(period) {
  return request({
    url: '/rank/leaderboard',
    method: 'get',
    params: { period }
  })
}
export function getAchievements() {
  return request({
    url: '/rank/achievements',
    method: 'get'
  })
}
