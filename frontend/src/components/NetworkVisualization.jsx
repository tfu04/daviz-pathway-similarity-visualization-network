import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola'
import coseBilkent from 'cytoscape-cose-bilkent'
import './NetworkVisualization.css'

// 注册布局算法
cytoscape.use(cola)
cytoscape.use(coseBilkent)

const NetworkVisualization = ({ data, loading, onElementSelect, focusNodeId }) => {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const [layoutName, setLayoutName] = useState('cose-bilkent')

  // 初始化 Cytoscape 实例（只运行一次）
  useEffect(() => {
    if (!containerRef.current) return
    if (cyRef.current) return // 如果已经存在，不重新创建

    // 初始化 Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: data,
      style: [
        // 节点样式
        {
          selector: 'node',
          style: {
            'background-color': (ele) => {
              const interpretable = ele.data('interpretable')
              return interpretable === 'YES' ? '#4CAF50' : '#9E9E9E'
            },
            'label': 'data(label)',
            'width': 50,
            'height': 50,
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'color': '#ffffff',
            'text-outline-color': '#000000',
            'text-outline-width': 2.5,
            'overlay-padding': '6px',
            'z-index': 10,
            'min-zoomed-font-size': 8
          }
        },
        // 选中节点样式
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#2196F3',
            'background-color': (ele) => {
              const interpretable = ele.data('interpretable')
              return interpretable === 'YES' ? '#66BB6A' : '#BDBDBD'
            }
          }
        },
        // 边样式
        {
          selector: 'edge',
          style: {
            'width': (ele) => {
              const weight = ele.data('weight') || 0
              // 更细的边，减少视觉混乱
              return Math.max(0.5, Math.log(weight + 1) * 0.3)
            },
            'line-color': (ele) => {
              const interpretable = ele.data('interpretable')
              return interpretable === 'YES' ? '#66BB6A' : '#616161'
            },
            'target-arrow-color': (ele) => {
              const interpretable = ele.data('interpretable')
              return interpretable === 'YES' ? '#66BB6A' : '#616161'
            },
            'curve-style': 'bezier',
            'opacity': 0.3
          }
        },
        // 选中边样式
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#2196F3',
            'target-arrow-color': '#2196F3',
            'width': (ele) => {
              const weight = ele.data('weight') || 0
              return Math.max(1.5, Math.log(weight + 1) * 0.4)
            },
            'opacity': 1,
            'z-index': 999
          }
        },
        // 高亮邻居节点
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 2,
            'border-color': '#FFA726',
            'z-index': 9999
          }
        },
        // 高亮邻居边
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#FFA726',
            'target-arrow-color': '#FFA726',
            'opacity': 0.8,
            'width': (ele) => {
              const weight = ele.data('weight') || 0
              return Math.max(1, Math.log(weight + 1) * 0.35)
            },
            'z-index': 9999
          }
        }
      ],
      layout: {
        name: layoutName,
        // cose-bilkent 特定参数 - 更大的间距
        idealEdgeLength: 250,
        nodeRepulsion: 12000,
        edgeElasticity: 0.25,
        nestingFactor: 0.1,
        gravity: 0.1,
        numIter: 3000,
        tile: true,
        animate: 'end',
        animationDuration: 1000,
        randomize: false,
        tilingPaddingVertical: 20,
        tilingPaddingHorizontal: 20
      },
      minZoom: 0.05,
      maxZoom: 10,
      wheelSensitivity: 0.3
    })

    cyRef.current = cy

    // 清理函数
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, []) // 空依赖数组，只初始化一次

  // 设置事件监听器
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    const handleNodeTap = (evt) => {
      const node = evt.target
      
      // 清除之前的高亮和选择
      cy.elements().removeClass('highlighted')
      cy.elements().unselect()
      
      // 高亮当前节点的邻居（橙色）
      const neighbors = node.neighborhood()
      node.addClass('highlighted')
      neighbors.addClass('highlighted')
      
      // 收集节点信息
      const connectedEdges = node.connectedEdges()
      const edgeData = connectedEdges.map(edge => ({
        id: edge.id(),
        source: edge.source().data('label'),
        target: edge.target().data('label'),
        weight: edge.data('weight'),
        interpretable: edge.data('interpretable')
      }))
      
      onElementSelect({
        type: 'node',
        id: node.id(),
        label: node.data('label'),
        interpretable: node.data('interpretable'),
        degree: node.degree(),
        edges: edgeData,
        statistics: {
          totalEdges: connectedEdges.length,
          interpretableEdges: connectedEdges.filter(e => e.data('interpretable') === 'YES').length,
          avgWeight: connectedEdges.reduce((sum, e) => sum + (e.data('weight') || 0), 0) / connectedEdges.length
        }
      })
    }

    const handleEdgeTap = (evt) => {
      const edge = evt.target
      
      // 清除之前的高亮和选择
      cy.elements().removeClass('highlighted')
      cy.elements().unselect()
      
      // 选中当前边（蓝色）
      edge.select()
      
      onElementSelect({
        type: 'edge',
        id: edge.id(),
        source: edge.source().data('label'),
        sourceId: edge.source().id(),
        target: edge.target().data('label'),
        targetId: edge.target().id(),
        weight: edge.data('weight'),
        interpretable: edge.data('interpretable'),
        sharedGenes: edge.data('shared_genes') || [],
        sharedPathways: edge.data('filtered_pathways') || [],
        reason: edge.data('reason_gpt4o') || ''
      })
    }

    const handleBackgroundTap = (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted')
        cy.elements().unselect()
        onElementSelect(null)
      }
    }

    // 绑定事件
    cy.on('tap', 'node', handleNodeTap)
    cy.on('tap', 'edge', handleEdgeTap)
    cy.on('tap', handleBackgroundTap)

    // 清理事件监听器
    return () => {
      cy.off('tap', 'node', handleNodeTap)
      cy.off('tap', 'edge', handleEdgeTap)
      cy.off('tap', handleBackgroundTap)
    }
  }, []) // 空依赖数组，只设置一次事件监听器

  // 当数据变化时更新元素
  useEffect(() => {
    if (!cyRef.current || !data) return

    const cy = cyRef.current
    
    // 移除所有旧元素
    cy.elements().remove()
    
    // 添加新元素
    cy.add(data)
    
    // 运行布局
    cy.layout({
      name: layoutName,
      idealEdgeLength: 250,
      nodeRepulsion: 12000,
      edgeElasticity: 0.25,
      nestingFactor: 0.1,
      gravity: 0.1,
      numIter: 3000,
      tile: true,
      animate: 'end',
      animationDuration: 1000,
      randomize: false,
      tilingPaddingVertical: 20,
      tilingPaddingHorizontal: 20
    }).run()
  }, [data]) // 只在数据变化时重新布局

  // 当布局算法变化时重新运行布局
  useEffect(() => {
    if (!cyRef.current || !data) return
    
    const cy = cyRef.current
    cy.layout({
      name: layoutName,
      idealEdgeLength: 250,
      nodeRepulsion: 12000,
      edgeElasticity: 0.25,
      nestingFactor: 0.1,
      gravity: 0.1,
      numIter: 3000,
      tile: true,
      animate: 'end',
      animationDuration: 1000,
      randomize: false,
      tilingPaddingVertical: 20,
      tilingPaddingHorizontal: 20
    }).run()
  }, [layoutName]) // 只在布局名称变化时重新布局

  // 当需要聚焦到特定节点时
  useEffect(() => {
    if (!cyRef.current || !focusNodeId) return
    
    const cy = cyRef.current
    const node = cy.getElementById(focusNodeId)
    
    if (node.length > 0) {
      // 清除之前的高亮
      cy.elements().removeClass('highlighted')
      cy.elements().unselect()
      
      // 高亮节点及其邻居
      const neighbors = node.neighborhood()
      node.addClass('highlighted')
      neighbors.addClass('highlighted')
      
      // 聚焦到节点（放大并居中，减小padding避免放大过度）
      cy.animate({
        fit: {
          eles: node.neighborhood(), // 包括邻居节点
          padding: 50 // 减小padding
        },
        duration: 500
      })
      
      // 触发节点选择事件
      const connectedEdges = node.connectedEdges()
      const edgeData = connectedEdges.map(edge => ({
        id: edge.id(),
        source: edge.source().data('label'),
        target: edge.target().data('label'),
        weight: edge.data('weight'),
        interpretable: edge.data('interpretable')
      }))
      
      onElementSelect({
        type: 'node',
        id: node.id(),
        label: node.data('label'),
        interpretable: node.data('interpretable'),
        degree: node.degree(),
        edges: edgeData,
        statistics: {
          totalEdges: connectedEdges.length,
          interpretableEdges: connectedEdges.filter(e => e.data('interpretable') === 'YES').length,
          avgWeight: connectedEdges.reduce((sum, e) => sum + (e.data('weight') || 0), 0) / connectedEdges.length
        }
      })
    }
  }, [focusNodeId]) // 只依赖 focusNodeId，不依赖 onElementSelect

  const handleLayoutChange = (newLayout) => {
    setLayoutName(newLayout)
    // 移除手动运行布局，让useEffect统一处理
  }

  const handleFitView = () => {
    if (cyRef.current) {
      cyRef.current.fit(null, 50)
    }
  }

  const handleResetZoom = () => {
    if (cyRef.current) {
      cyRef.current.zoom(1)
      cyRef.current.center()
    }
  }

  const handleExportImage = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({ scale: 2, full: true })
      const link = document.createElement('a')
      link.href = png
      link.download = 'disease-network.png'
      link.click()
    }
  }

  return (
    <div className="network-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>加载网络数据中...</p>
        </div>
      )}
      
      <div className="network-controls">
        <div className="control-group">
          <label>布局算法:</label>
          <select 
            value={layoutName} 
            onChange={(e) => handleLayoutChange(e.target.value)}
            disabled={loading || !data}
          >
            <option value="cose-bilkent">COSE Bilkent</option>
            <option value="cola">Cola</option>
            <option value="circle">Circle</option>
            <option value="grid">Grid</option>
            <option value="random">Random</option>
          </select>
        </div>
        
        <div className="control-buttons">
          <button onClick={handleFitView} disabled={loading || !data} title="适应视图">
            🔍 适应视图
          </button>
          <button onClick={handleResetZoom} disabled={loading || !data} title="重置缩放">
            ⟲ 重置
          </button>
          <button onClick={handleExportImage} disabled={loading || !data} title="导出图片">
            📷 导出
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="cytoscape-container"></div>
      
      <div className="network-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
          <span>可解释 (YES)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#9E9E9E' }}></span>
          <span>不可解释 (NO)</span>
        </div>
      </div>
    </div>
  )
}

export default NetworkVisualization
