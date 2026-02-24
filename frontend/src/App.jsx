import { useState, useEffect, useRef } from 'react'
import NetworkVisualization from './components/NetworkVisualization'
import DetailPanel from './components/DetailPanel'
import FilterPanel from './components/FilterPanel'
import { getNetworkData, getStatistics } from './services/api'
import './App.css'

function App() {
  const pendingFilterDataRef = useRef(null)
  const [networkData, setNetworkData] = useState(null)
  const [filteredData, setFilteredData] = useState(null)
  const [selectedElement, setSelectedElement] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [focusNodeId, setFocusNodeId] = useState(null)
  const [rightPanelWidth, setRightPanelWidth] = useState(360)
  const [isResizing, setIsResizing] = useState(false)
  const [filters, setFilters] = useState({
    minWeight: 8400,
    interpretability: 'all', // 'all', 'YES', 'NO'
    limit: 500
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [data, stats] = await Promise.all([
          getNetworkData({ min_weight: filters.minWeight, limit: filters.limit }),
          getStatistics()
        ])
        
        setNetworkData(data)
        setFilteredData(data)
        setStatistics(stats)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!networkData) return

    const applyFilters = async () => {
      const pendingFilterData = pendingFilterDataRef.current
      if (
        pendingFilterData &&
        pendingFilterData.filters.minWeight === filters.minWeight &&
        pendingFilterData.filters.interpretability === filters.interpretability &&
        pendingFilterData.filters.limit === filters.limit
      ) {
        setFilteredData(pendingFilterData.data)
        pendingFilterDataRef.current = null
        setLoading(false)
        return
      }

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
        setError(err.message || 'Failed to apply filters')
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

  const focusNode = (diseaseId) => {
    setFocusNodeId(diseaseId)
    setTimeout(() => setFocusNodeId(null), 100)
  }

  const hasNodeInData = (data, diseaseId) => {
    return !!data?.nodes?.some((node) => node?.data?.id === diseaseId)
  }

  const handleSearchSelect = async (diseaseId) => {
    if (!diseaseId) return

    if (hasNodeInData(filteredData, diseaseId)) {
      focusNode(diseaseId)
      return
    }

    try {
      setLoading(true)

      const candidateFilters = [
        { ...filters, limit: 1055 },
        { ...filters, minWeight: 0, limit: 1055 },
        { minWeight: 0, interpretability: 'all', limit: 1055 }
      ]

      for (const nextFilters of candidateFilters) {
        const params = {
          min_weight: nextFilters.minWeight,
          limit: nextFilters.limit
        }

        if (nextFilters.interpretability !== 'all') {
          params.interpretability = nextFilters.interpretability
        }

        const data = await getNetworkData(params)
        if (hasNodeInData(data, diseaseId)) {
          pendingFilterDataRef.current = {
            filters: nextFilters,
            data
          }
          setFilteredData(data)
          setFilters(nextFilters)
          setTimeout(() => focusNode(diseaseId), 450)
          return
        }
      }

      focusNode(diseaseId)
    } catch (err) {
      console.error('Failed to focus searched disease:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (event) => {
      const minWidth = 300
      const maxWidth = 620
      const newWidth = window.innerWidth - event.clientX
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setRightPanelWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
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
              <span>Nodes: {statistics.total_nodes}</span>
              <span>Edges: {statistics.total_edges}</span>
              <span>Interpretable: {statistics.interpretable_count} ({statistics.interpretable_percentage})</span>
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

        <div
          className={`right-panel-resizer ${isResizing ? 'active' : ''}`}
          onMouseDown={() => setIsResizing(true)}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize details panel"
        />

        <div className="right-panel" style={{ width: `${rightPanelWidth}px` }}>
          <DetailPanel
            element={selectedElement}
          />
        </div>
      </div>
    </div>
  )
}

export default App
