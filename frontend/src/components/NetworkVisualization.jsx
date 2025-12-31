import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola'
import coseBilkent from 'cytoscape-cose-bilkent'
import './NetworkVisualization.css'

// Register layout algorithms
cytoscape.use(cola)
cytoscape.use(coseBilkent)

const NetworkVisualization = ({ data, loading, onElementSelect, focusNodeId }) => {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const [layoutName, setLayoutName] = useState('cose-bilkent')

  // Initialize Cytoscape instance (runs once)
  useEffect(() => {
    if (!containerRef.current) return
    if (cyRef.current) return

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: data,
      style: [
        // Node styles
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
        {
          selector: 'edge',
          style: {
            'width': (ele) => {
              const weight = ele.data('weight') || 0
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
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 2,
            'border-color': '#FFA726',
            'z-index': 9999
          }
        },
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
      wheelSensitivity: 1.3
    })

    cyRef.current = cy

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    const handleNodeTap = (evt) => {
      const node = evt.target
      
      cy.elements().removeClass('highlighted')
      cy.elements().unselect()
      
      const neighbors = node.neighborhood()
      node.addClass('highlighted')
      neighbors.addClass('highlighted')
      
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
      
      cy.elements().removeClass('highlighted')
      cy.elements().unselect()
      
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

    cy.on('tap', 'node', handleNodeTap)
    cy.on('tap', 'edge', handleEdgeTap)
    cy.on('tap', handleBackgroundTap)

    return () => {
      cy.off('tap', 'node', handleNodeTap)
      cy.off('tap', 'edge', handleEdgeTap)
      cy.off('tap', handleBackgroundTap)
    }
  }, [])

  useEffect(() => {
    if (!cyRef.current || !data) return

    const cy = cyRef.current
    
    cy.stop()
    
    cy.elements().remove()
    
    cy.add(data)
    
    let layoutOptions = {
      name: layoutName,
      animate: 'end',
      animationDuration: 500,
      fit: true,
      padding: 50,
      randomize: false
    }
    
    if (layoutName === 'cose-bilkent') {
      layoutOptions = {
        ...layoutOptions,
        idealEdgeLength: 200,
        nodeRepulsion: 8000,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10
      }
    } else if (layoutName === 'cola') {
      layoutOptions = {
        ...layoutOptions,
        nodeSpacing: 100,
        edgeLength: 200,
        animate: true,
        maxSimulationTime: 4000
      }
    }
    
    const layout = cy.layout(layoutOptions)
    layout.run()
    
    layout.one('layoutstop', () => {
      setTimeout(() => {
        cy.fit(null, 50)
      }, 100)
    })
  }, [data, layoutName])

  useEffect(() => {
    if (!cyRef.current || !focusNodeId) return
    
    const cy = cyRef.current
    const node = cy.getElementById(focusNodeId)
    
    if (node.length > 0) {
      cy.elements().removeClass('highlighted')
      cy.elements().unselect()
      
      const neighbors = node.neighborhood()
      node.addClass('highlighted')
      neighbors.addClass('highlighted')

      cy.animate({
        fit: {
          eles: node.neighborhood(),
          padding: 50
        },
        duration: 500
      })
      
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
  }, [focusNodeId])

  const handleLayoutChange = (newLayout) => {
    setLayoutName(newLayout)
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
          <p>Loading network data...</p>
        </div>
      )}
      
      <div className="network-controls">
        <div className="control-group">
          <label>Layout Algorithm:</label>
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
          <button onClick={handleFitView} disabled={loading || !data} title="Fit to view">
            🔍 Fit View
          </button>
          <button onClick={handleResetZoom} disabled={loading || !data} title="Reset zoom">
            ⟲ Reset
          </button>
          <button onClick={handleExportImage} disabled={loading || !data} title="Export image">
            📷 Export
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="cytoscape-container"></div>
      
      <div className="network-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
          <span>Interpretable (YES)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#9E9E9E' }}></span>
          <span>Non-interpretable (NO)</span>
        </div>
      </div>
    </div>
  )
}

export default NetworkVisualization
