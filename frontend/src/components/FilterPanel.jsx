import { useState, useEffect, useCallback } from 'react'
import { searchDiseases } from '../services/api'
import './FilterPanel.css'

const FilterPanel = ({ filters, statistics, onFilterChange, onSearchSelect, loading }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // 防抖搜索
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true)
        const results = await searchDiseases(searchQuery, 10)
        setSearchResults(results)
        setShowResults(true)
      } catch (err) {
        console.error('Search failed:', err)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleWeightChange = (e) => {
    onFilterChange({ minWeight: parseFloat(e.target.value) })
  }

  const handleInterpretabilityChange = (e) => {
    onFilterChange({ interpretability: e.target.value })
  }

  const handleLimitChange = (e) => {
    onFilterChange({ limit: parseInt(e.target.value) })
  }

  const handleSearchResultClick = (diseaseId) => {
    // 触发聚焦到选中的疾病
    if (onSearchSelect) {
      onSearchSelect(diseaseId)
    }
    setShowResults(false)
    setSearchQuery('')
  }

  const getWeightLabel = (weight) => {
    if (weight === 0) return '无过滤'
    if (weight === 0.5) return '中等'
    if (weight === 0.75) return '较高'
    if (weight === 0.9) return '很高'
    return weight.toFixed(2)
  }

  return (
    <div className="filter-panel">
      <div className="panel-section">
        <h3>搜索疾病</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="输入疾病名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            disabled={loading}
            className="search-input"
          />
          {searching && <div className="search-spinner"></div>}
          
          {showResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(result.id)}
                >
                  <div className="result-name">{result.label}</div>
                  <div className="result-meta">
                    {result.edge_count} 连接
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel-section">
        <h3>权重过滤</h3>
        <div className="filter-control">
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={filters.minWeight}
              onChange={handleWeightChange}
              disabled={loading}
              className="weight-slider"
            />
            <div className="slider-labels">
              <span>0</span>
              <span className="current-value">
                {getWeightLabel(filters.minWeight)}
              </span>
              <span>1</span>
            </div>
          </div>
          <p className="filter-description">
            最小权重: <strong>{filters.minWeight.toFixed(2)}</strong>
          </p>
          
          {statistics && (
            <div className="weight-info">
              <div className="info-row">
                <span>权重范围:</span>
                <span>
                  {statistics.weight_range?.min?.toFixed(2) || 'N/A'} - {statistics.weight_range?.max?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="info-row">
                <span>中位数:</span>
                <span>{statistics.weight_percentiles?.['50th']?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span>75th 百分位:</span>
                <span>{statistics.weight_percentiles?.['75th']?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span>90th 百分位:</span>
                <span>{statistics.weight_percentiles?.['90th']?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="quick-filters">
          <button
            onClick={() => onFilterChange({ minWeight: 0 })}
            disabled={loading}
            className={filters.minWeight === 0 ? 'active' : ''}
          >
            全部
          </button>
          <button
            onClick={() => onFilterChange({ minWeight: 0.5 })}
            disabled={loading}
            className={filters.minWeight === 0.5 ? 'active' : ''}
          >
            中等
          </button>
          <button
            onClick={() => onFilterChange({ minWeight: 0.75 })}
            disabled={loading}
            className={filters.minWeight === 0.75 ? 'active' : ''}
          >
            较高
          </button>
          <button
            onClick={() => onFilterChange({ minWeight: 0.9 })}
            disabled={loading}
            className={filters.minWeight === 0.9 ? 'active' : ''}
          >
            很高
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h3>可解释性</h3>
        <div className="filter-control">
          <select
            value={filters.interpretability}
            onChange={handleInterpretabilityChange}
            disabled={loading}
            className="interpretability-select"
          >
            <option value="all">全部</option>
            <option value="YES">仅可解释 (YES)</option>
            <option value="NO">仅不可解释 (NO)</option>
          </select>
          
          {statistics && (
            <div className="interpretability-stats">
              <div className="stat-bar">
                <div className="stat-bar-label">
                  <span className="stat-dot yes"></span>
                  可解释 ({statistics.interpretable_count || 0})
                </div>
                <div className="stat-bar-container">
                  <div
                    className="stat-bar-fill yes"
                    style={{ width: statistics.interpretable_percentage || '0%' }}
                  ></div>
                </div>
                <div className="stat-bar-value">
                  {statistics.interpretable_percentage || '0%'}
                </div>
              </div>
              
              <div className="stat-bar">
                <div className="stat-bar-label">
                  <span className="stat-dot no"></span>
                  不可解释 ({statistics.uninterpretable_count || 0})
                </div>
                <div className="stat-bar-container">
                  <div
                    className="stat-bar-fill no"
                    style={{ width: statistics.uninterpretable_percentage || '0%' }}
                  ></div>
                </div>
                <div className="stat-bar-value">
                  {statistics.uninterpretable_percentage || '0%'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel-section">
        <h3>显示限制</h3>
        <div className="filter-control">
          <select
            value={filters.limit}
            onChange={handleLimitChange}
            disabled={loading}
            className="limit-select"
          >
            <option value="100">100 条边</option>
            <option value="200">200 条边</option>
            <option value="500">500 条边</option>
            <option value="1000">1000 条边</option>
            <option value="2000">2000 条边</option>
            <option value="5000">5000 条边</option>
          </select>
          <p className="filter-description">
            限制显示的边数量以提高性能
          </p>
        </div>
      </div>

      <div className="panel-section">
        <button
          className="reset-button"
          onClick={() => onFilterChange({
            minWeight: 0.75,
            interpretability: 'all',
            limit: 500
          })}
          disabled={loading}
        >
          重置过滤器
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
