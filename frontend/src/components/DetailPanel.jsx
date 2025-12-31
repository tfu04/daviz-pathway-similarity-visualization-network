import { useState, useEffect } from 'react'
import { getEdgeDetails } from '../services/api'
import './DetailPanel.css'

const DetailPanel = ({ element }) => {
  const [edgeDetails, setEdgeDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (element?.type === 'edge') {
      setEdgeDetails(element)
    } else {
      setEdgeDetails(null)
    }
  }, [element])

  const fetchEdgeDetails = async (edgeId) => {
    try {
      setLoading(true)
      const response = await getEdgeDetails(edgeId)
      const edgeData = response.edge.data
      setEdgeDetails({
        ...element,
        sharedGenes: edgeData.shared_genes || [],
        sharedPathways: edgeData.filtered_pathways || [],
        reason: edgeData.reason_gpt4o || ''
      })
    } catch (err) {
      console.error('Failed to fetch edge details:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!element) {
    return (
      <div className="detail-panel">
        <div className="empty-state">
          <p>👆 Click on a node or edge to view details</p>
        </div>
      </div>
    )
  }

  if (element.type === 'node') {
    return (
      <div className="detail-panel">
        <div className="panel-header">
          <h3>Node Details</h3>
          <span className={`badge ${element.interpretable === 'YES' ? 'badge-success' : 'badge-default'}`}>
            {element.interpretable === 'YES' ? 'Interpretable' : 'Non-interpretable'}
          </span>
        </div>

        <div className="panel-content">
          <div className="info-section">
            <h4>Basic Information</h4>
            <div className="info-item">
              <span className="info-label">Disease Name:</span>
              <span className="info-value">{element.label}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value info-code">{element.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Degree:</span>
              <span className="info-value">{element.degree}</span>
            </div>
          </div>

          <div className="info-section">
            <h4>Connection Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{element.statistics.totalEdges}</div>
                <div className="stat-label">Total Connections</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{element.statistics.interpretableEdges}</div>
                <div className="stat-label">Interpretable</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{element.statistics.avgWeight.toFixed(4)}</div>
                <div className="stat-label">Avg Weight</div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h4>Connected Diseases ({element.edges.length})</h4>
            <div className="edges-list">
              {element.edges.slice(0, 20).map((edge, idx) => (
                <div key={idx} className="edge-item">
                  <div className="edge-header">
                    <span className="edge-disease">
                      {edge.source === element.label ? edge.target : edge.source}
                    </span>
                    <span className={`badge-small ${edge.interpretable === 'YES' ? 'badge-success' : 'badge-default'}`}>
                      {edge.interpretable}
                    </span>
                  </div>
                  <div className="edge-weight">
                    Weight: {edge.weight.toFixed(4)}
                  </div>
                </div>
              ))}
              {element.edges.length > 20 && (
                <div className="more-indicator">
                  {element.edges.length - 20} more connections...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (element.type === 'edge') {
    return (
      <div className="detail-panel">
        <div className="panel-header">
          <h3>Edge Details</h3>
          <span className={`badge ${element.interpretable === 'YES' ? 'badge-success' : 'badge-default'}`}>
            {element.interpretable === 'YES' ? 'Interpretable' : 'Non-interpretable'}
          </span>
        </div>

        <div className="panel-content">
          <div className="info-section">
            <h4>Connection Information</h4>
            <div className="connection-visual">
              <div className="disease-box">{element.source}</div>
              <div className="connection-arrow">
                <span className="weight-badge">{element.weight.toFixed(4)}</span>
                ↔
              </div>
              <div className="disease-box">{element.target}</div>
            </div>
            <div className="info-item">
              <span className="info-label">Edge ID:</span>
              <span className="info-value info-code">{element.id}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-section">
              <div className="small-spinner"></div>
              <p>Loading details...</p>
            </div>
          ) : edgeDetails ? (
            <>
              <div className="info-section">
                <h4>Shared Genes ({edgeDetails.sharedGenes?.length || 0})</h4>
                {edgeDetails.sharedGenes && edgeDetails.sharedGenes.length > 0 ? (
                  <div className="genes-container">
                    <div className="genes-list">
                      {edgeDetails.sharedGenes.map((gene, idx) => (
                        <span key={idx} className="gene-tag">{gene}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="empty-text">No shared genes</p>
                )}
              </div>

              <div className="info-section">
                <h4>Shared Pathways ({edgeDetails.sharedPathways?.length || 0})</h4>
                {edgeDetails.sharedPathways && edgeDetails.sharedPathways.length > 0 ? (
                  <div className="pathways-container">
                    <div className="pathways-list">
                      {edgeDetails.sharedPathways.map((pathway, idx) => (
                        <div key={idx} className="pathway-item">{pathway}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="empty-text">No shared pathways</p>
                )}
              </div>

              <div className="info-section highlight-section">
                <h4>🤖 GPT-4o Explanation</h4>
                {edgeDetails.reason ? (
                  <div className="gpt-explanation">
                    <p>{edgeDetails.reason}</p>
                  </div>
                ) : (
                  <p className="empty-text">No explanation available</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    )
  }

  return null
}

export default DetailPanel
