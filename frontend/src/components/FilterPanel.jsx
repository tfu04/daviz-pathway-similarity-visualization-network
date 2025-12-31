import { useState, useEffect, useCallback } from 'react'
import { searchDiseases } from '../services/api'
import './FilterPanel.css'

const FilterPanel = ({ filters, statistics, onFilterChange, onSearchSelect, loading }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

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
    if (onSearchSelect) {
      onSearchSelect(diseaseId)
    }
    setShowResults(false)
    setSearchQuery('')
  }

  return (
    <div className="filter-panel">
      <div className="panel-section">
        <h3>Search Diseases</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter disease name..."
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
                    {result.edge_count} connections
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel-section">
        <h3>Weight Filter</h3>
        <div className="filter-control">
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="20000"
              step="100"
              value={filters.minWeight}
              onChange={handleWeightChange}
              disabled={loading}
              className="weight-slider"
            />
            <div className="slider-labels">
              <span>0</span>
              <span className="current-value">
                {filters.minWeight.toFixed(0)}
              </span>
              <span>20k</span>
            </div>
          </div>
          <p className="filter-description">
            Minimum weight: <strong>{filters.minWeight.toFixed(0)}</strong>
          </p>
          
          {statistics && (
            <div className="weight-info">
              <div className="info-row">
                <span>Weight range:</span>
                <span>
                  {statistics.weight_range?.min?.toFixed(2) || 'N/A'} - {statistics.weight_range?.max?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="info-row">
                <span>Median:</span>
                <span>{statistics.weight_percentiles?.['50th']?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span>75th percentile:</span>
                <span>{statistics.weight_percentiles?.['75th']?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span>90th percentile:</span>
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
            All
          </button>
          <button
            onClick={() => onFilterChange({ minWeight: 3600 })}
            disabled={loading}
            className={filters.minWeight === 3600 ? 'active' : ''}
          >
            Median
          </button>
          <button
            onClick={() => onFilterChange({ minWeight: 8400 })}
            disabled={loading}
            className={filters.minWeight === 8400 ? 'active' : ''}
          >
            75%
          </button>
          <button
            onClick={() => onFilterChange({ minWeight: 16000 })}
            disabled={loading}
            className={filters.minWeight === 16000 ? 'active' : ''}
          >
            90%
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h3>Interpretability</h3>
        <div className="filter-control">
          <select
            value={filters.interpretability}
            onChange={handleInterpretabilityChange}
            disabled={loading}
            className="interpretability-select"
          >
            <option value="all">All</option>
            <option value="YES">Interpretable only (YES)</option>
            <option value="NO">Non-interpretable only (NO)</option>
          </select>
          
          {statistics && (
            <div className="interpretability-stats">
              <div className="stat-bar">
                <div className="stat-bar-label">
                  <span className="stat-dot yes"></span>
                  Interpretable ({statistics.interpretable_count || 0})
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
                  Non-interpretable ({statistics.uninterpretable_count || 0})
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
        <h3>Display Limit</h3>
        <div className="filter-control">
          <select
            value={filters.limit}
            onChange={handleLimitChange}
            disabled={loading}
            className="limit-select"
          >
            <option value="100">100 edges</option>
            <option value="200">200 edges</option>
            <option value="500">500 edges</option>
            <option value="1055">1055 edges (Max)</option>
          </select>
          <p className="filter-description">
            Limit the number of edges to improve performance
          </p>
        </div>
      </div>

      <div className="panel-section">
        <button
          className="reset-button"
          onClick={() => onFilterChange({
            minWeight: 8400,
            interpretability: 'all',
            limit: 500
          })}
          disabled={loading}
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
