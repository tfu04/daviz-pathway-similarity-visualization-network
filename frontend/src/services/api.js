import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.url, response.status)
    return response.data
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message)
    const message = error.response?.data?.detail || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

/**
 * Get network data
 * @param {Object} params - Query parameters
 * @param {number} params.min_weight - Minimum weight threshold
 * @param {string} params.interpretability - Interpretability filter ('YES' or 'NO')
 * @param {number} params.limit - Maximum edge count
 * @returns {Promise<Object>} Network data (Cytoscape format)
 */
export const getNetworkData = async (params = {}) => {
  return api.get('/network', { params })
}

/**
 * Get all edges for a specific disease
 * @param {string} diseaseId - Disease ID
 * @returns {Promise<Array>} Array of edges
 */
export const getDiseaseEdges = async (diseaseId) => {
  return api.get(`/disease/${diseaseId}`)
}

/**
 * Get detailed information for a specific edge
 * @param {string} edgeId - Edge ID
 * @returns {Promise<Object>} Edge details
 */
export const getEdgeDetails = async (edgeId) => {
  return api.get(`/edge/${edgeId}`)
}

/**
 * Search diseases
 * @param {string} keyword - Search keyword
 * @param {number} limit - Maximum result count
 * @returns {Promise<Array>} List of matching diseases
 */
export const searchDiseases = async (keyword, limit = 10) => {
  const response = await api.get('/search', { 
    params: { keyword } 
  })
  return response.results.slice(0, limit)
}

/**
 * Get network statistics
 * @returns {Promise<Object>} Statistics data
 */
export const getStatistics = async () => {
  return api.get('/stats')
}

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  return api.get('/health')
}

export default api
