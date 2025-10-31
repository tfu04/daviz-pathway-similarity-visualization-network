import { useState, useEffect } from 'react'
import NetworkVisualization from './components/NetworkVisualization'
import DetailPanel from './components/DetailPanel'
import FilterPanel from './components/FilterPanel'
import { getNetworkData, getStatistics } from './services/api'
import './App.css'

function App() {
  const [networkData, setNetworkData] = useState(null)
  const [filteredData, setFilteredData] = useState(null)
  const [selectedElement, setSelectedElement] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [focusNodeId, setFocusNodeId] = useState(null)
  const [filters, setFilters] = useState({
    minWeight: 0.75, // 从 75th percentile 开始
    interpretability: 'all', // 'all', 'YES', 'NO'
    limit: 500
  })

  // 加载初始数据和统计信息
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 并行获取数据和统计信息
        const [data, stats] = await Promise.all([
          getNetworkData({ min_weight: filters.minWeight, limit: filters.limit }),
          getStatistics()
        ])
        
        setNetworkData(data)
        setFilteredData(data)
        setStatistics(stats)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError(err.message || '加载数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 应用过滤器
  useEffect(() => {
    if (!networkData) return

    const applyFilters = async () => {
      try {
        setLoading(true)
        
        const params = {
          min_weight: filters.minWeight,
          limit: filters.limit
        }
        
        if (filters.interpretability !== 'all') {
          params.interpretability = filters.interpretability
        }
        
        const data = await getNetworkData(params)
        setFilteredData(data)
      } catch (err) {
        console.error('Failed to apply filters:', err)
        setError(err.message || '应用过滤器失败')
      } finally {
        setLoading(false)
      }
    }

    applyFilters()
  }, [filters.minWeight, filters.interpretability, filters.limit])

  const handleElementSelect = (element) => {
    setSelectedElement(element)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleSearchSelect = (diseaseId) => {
    setFocusNodeId(diseaseId)
    // 清除focusNodeId以便下次搜索能再次触发
    setTimeout(() => setFocusNodeId(null), 100)
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>错误</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重新加载</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Disease Network Visualization</h1>
        <div className="header-stats">
          {statistics && (
            <>
              <span>节点: {statistics.total_nodes}</span>
              <span>边: {statistics.total_edges}</span>
              <span>可解释: {statistics.interpretable_count} ({statistics.interpretable_percentage})</span>
            </>
          )}
        </div>
      </header>

      <div className="app-content">
        <div className="left-panel">
          <FilterPanel
            filters={filters}
            statistics={statistics}
            onFilterChange={handleFilterChange}
            onSearchSelect={handleSearchSelect}
            loading={loading}
          />
        </div>

        <div className="main-content">
          <NetworkVisualization
            data={filteredData}
            loading={loading}
            onElementSelect={handleElementSelect}
            focusNodeId={focusNodeId}
          />
        </div>

        <div className="right-panel">
          <DetailPanel
            element={selectedElement}
          />
        </div>
      </div>
    </div>
  )
}

export default App
