import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.params)
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.url, response.status)
    return response.data
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message)
    const message = error.response?.data?.detail || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

/**
 * 获取网络数据
 * @param {Object} params - 查询参数
 * @param {number} params.min_weight - 最小权重阈值
 * @param {string} params.interpretability - 可解释性过滤 ('YES' 或 'NO')
 * @param {number} params.limit - 最大边数限制
 * @returns {Promise<Object>} 网络数据 (Cytoscape 格式)
 */
export const getNetworkData = async (params = {}) => {
  return api.get('/network', { params })
}

/**
 * 获取特定疾病的所有连接边
 * @param {string} diseaseId - 疾病 ID
 * @returns {Promise<Array>} 边数组
 */
export const getDiseaseEdges = async (diseaseId) => {
  return api.get(`/disease/${diseaseId}`)
}

/**
 * 获取特定边的详细信息
 * @param {string} edgeId - 边 ID
 * @returns {Promise<Object>} 边的详细信息
 */
export const getEdgeDetails = async (edgeId) => {
  return api.get(`/edge/${edgeId}`)
}

/**
 * 搜索疾病
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 最大结果数
 * @returns {Promise<Array>} 匹配的疾病列表
 */
export const searchDiseases = async (keyword, limit = 10) => {
  const response = await api.get('/search', { 
    params: { keyword } 
  })
  // 返回 results 数组，并限制数量
  return response.results.slice(0, limit)
}

/**
 * 获取网络统计信息
 * @returns {Promise<Object>} 统计数据
 */
export const getStatistics = async () => {
  return api.get('/stats')
}

/**
 * 健康检查
 * @returns {Promise<Object>} 健康状态
 */
export const healthCheck = async () => {
  return api.get('/health')
}

export default api
