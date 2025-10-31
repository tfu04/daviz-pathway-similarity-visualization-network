import { useState, useEffect } from 'react'
import { getEdgeDetails } from '../services/api'
import './DetailPanel.css'

const DetailPanel = ({ element }) => {
  const [edgeDetails, setEdgeDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (element?.type === 'edge') {
      // 直接使用传递的数据，不需要额外API调用
      setEdgeDetails(element)
    } else {
      setEdgeDetails(null)
    }
  }, [element])

  const fetchEdgeDetails = async (edgeId) => {
    try {
      setLoading(true)
      const response = await getEdgeDetails(edgeId)
      // API返回的是 {edge: {data: {...}}, ...}
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
          <p>👆 点击节点或边查看详细信息</p>
        </div>
      </div>
    )
  }

  if (element.type === 'node') {
    return (
      <div className="detail-panel">
        <div className="panel-header">
          <h3>节点详情</h3>
          <span className={`badge ${element.interpretable === 'YES' ? 'badge-success' : 'badge-default'}`}>
            {element.interpretable === 'YES' ? '可解释' : '不可解释'}
          </span>
        </div>

        <div className="panel-content">
          <div className="info-section">
            <h4>基本信息</h4>
            <div className="info-item">
              <span className="info-label">疾病名称:</span>
              <span className="info-value">{element.label}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value info-code">{element.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">度数:</span>
              <span className="info-value">{element.degree}</span>
            </div>
          </div>

          <div className="info-section">
            <h4>连接统计</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{element.statistics.totalEdges}</div>
                <div className="stat-label">总连接数</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{element.statistics.interpretableEdges}</div>
                <div className="stat-label">可解释连接</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{element.statistics.avgWeight.toFixed(4)}</div>
                <div className="stat-label">平均权重</div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h4>连接的疾病 ({element.edges.length})</h4>
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
                    权重: {edge.weight.toFixed(4)}
                  </div>
                </div>
              ))}
              {element.edges.length > 20 && (
                <div className="more-indicator">
                  还有 {element.edges.length - 20} 个连接...
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
          <h3>边详情</h3>
          <span className={`badge ${element.interpretable === 'YES' ? 'badge-success' : 'badge-default'}`}>
            {element.interpretable === 'YES' ? '可解释' : '不可解释'}
          </span>
        </div>

        <div className="panel-content">
          <div className="info-section">
            <h4>连接信息</h4>
            <div className="connection-visual">
              <div className="disease-box">{element.source}</div>
              <div className="connection-arrow">
                <span className="weight-badge">{element.weight.toFixed(4)}</span>
                ↔
              </div>
              <div className="disease-box">{element.target}</div>
            </div>
            <div className="info-item">
              <span className="info-label">边 ID:</span>
              <span className="info-value info-code">{element.id}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-section">
              <div className="small-spinner"></div>
              <p>加载详细信息...</p>
            </div>
          ) : edgeDetails ? (
            <>
              <div className="info-section">
                <h4>共享基因 ({edgeDetails.sharedGenes?.length || 0})</h4>
                {edgeDetails.sharedGenes && edgeDetails.sharedGenes.length > 0 ? (
                  <div className="genes-container">
                    <div className="genes-list">
                      {edgeDetails.sharedGenes.map((gene, idx) => (
                        <span key={idx} className="gene-tag">{gene}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="empty-text">无共享基因</p>
                )}
              </div>

              <div className="info-section">
                <h4>共享通路 ({edgeDetails.sharedPathways?.length || 0})</h4>
                {edgeDetails.sharedPathways && edgeDetails.sharedPathways.length > 0 ? (
                  <div className="pathways-container">
                    <div className="pathways-list">
                      {edgeDetails.sharedPathways.map((pathway, idx) => (
                        <div key={idx} className="pathway-item">{pathway}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="empty-text">无共享通路</p>
                )}
              </div>

              <div className="info-section highlight-section">
                <h4>🤖 GPT-4o 解释</h4>
                {edgeDetails.reason ? (
                  <div className="gpt-explanation">
                    <p>{edgeDetails.reason}</p>
                  </div>
                ) : (
                  <p className="empty-text">暂无解释</p>
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
