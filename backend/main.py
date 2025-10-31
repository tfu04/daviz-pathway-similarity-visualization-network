"""
FastAPI backend server for disease network visualization.
Provides endpoints for network data retrieval with filtering capabilities.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import json
import logging
from pathlib import Path
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Disease Network API",
    description="API for exploring disease-disease relationships based on gene and pathway similarity",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store network data
network_data: Dict[str, Any] = {"nodes": [], "edges": []}
network_loaded = False


def load_network_data():
    """Load network data from JSON file."""
    global network_data, network_loaded
    
    data_path = Path("data/processed_network.json")
    
    if not data_path.exists():
        logger.error(f"Network data file not found: {data_path}")
        return False
    
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            network_data = json.load(f)
        network_loaded = True
        logger.info(f"Loaded {len(network_data['nodes'])} nodes and {len(network_data['edges'])} edges")
        return True
    except Exception as e:
        logger.error(f"Error loading network data: {e}")
        return False


@app.on_event("startup")
async def startup_event():
    """Load data on startup."""
    load_network_data()


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Disease Network API",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Health check",
            "/network": "Get full network with optional filters",
            "/disease/{disease_id}": "Get edges for specific disease",
            "/edge/{edge_id}": "Get specific edge details",
            "/search": "Search diseases by keyword",
            "/stats": "Get network statistics"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy" if network_loaded else "no_data",
        "nodes_count": len(network_data.get('nodes', [])),
        "edges_count": len(network_data.get('edges', []))
    }


@app.get("/network")
async def get_network(
    min_weight: Optional[float] = Query(None, description="Minimum edge weight threshold"),
    interpretability: Optional[str] = Query(None, description="Filter by interpretability (YES/NO)"),
    limit: Optional[int] = Query(None, description="Limit number of edges returned")
):
    """
    Get network data with optional filters.
    
    Args:
        min_weight: Minimum weight threshold for edges
        interpretability: Filter by GPT-4o interpretability assessment (YES/NO)
        limit: Maximum number of edges to return
        
    Returns:
        Network data with nodes and edges
    """
    if not network_loaded:
        raise HTTPException(status_code=503, detail="Network data not loaded")
    
    # Start with all edges
    filtered_edges = network_data['edges'].copy()
    
    # Apply weight filter
    if min_weight is not None:
        filtered_edges = [
            edge for edge in filtered_edges
            if edge['data']['weight'] >= min_weight
        ]
    
    # Apply interpretability filter
    if interpretability is not None:
        interpretability_upper = interpretability.upper()
        filtered_edges = [
            edge for edge in filtered_edges
            if edge['data'].get('interpretable', 'NO') == interpretability_upper
        ]
    
    # Apply limit
    if limit is not None and limit > 0:
        # Sort by weight descending before limiting
        filtered_edges = sorted(
            filtered_edges,
            key=lambda x: x['data']['weight'],
            reverse=True
        )[:limit]
    
    # Get unique node IDs from filtered edges
    node_ids = set()
    for edge in filtered_edges:
        node_ids.add(edge['data']['source'])
        node_ids.add(edge['data']['target'])
    
    # Filter nodes to only include those in filtered edges
    filtered_nodes = [
        node for node in network_data['nodes']
        if node['data']['id'] in node_ids
    ]
    
    return {
        "nodes": filtered_nodes,
        "edges": filtered_edges,
        "metadata": {
            "total_nodes": len(filtered_nodes),
            "total_edges": len(filtered_edges),
            "filters_applied": {
                "min_weight": min_weight,
                "interpretability": interpretability,
                "limit": limit
            }
        }
    }


@app.get("/disease/{disease_id}")
async def get_disease_edges(disease_id: str):
    """
    Get all edges connected to a specific disease.
    
    Args:
        disease_id: Disease pair ID (e.g., "Anxiety_disorder--None")
        
    Returns:
        List of edges and connected diseases
    """
    if not network_loaded:
        raise HTTPException(status_code=503, detail="Network data not loaded")
    
    # Find edges where disease is source or target
    connected_edges = [
        edge for edge in network_data['edges']
        if edge['data']['source'] == disease_id or edge['data']['target'] == disease_id
    ]
    
    if not connected_edges:
        raise HTTPException(status_code=404, detail=f"Disease '{disease_id}' not found")
    
    # Get connected disease IDs
    connected_disease_ids = set()
    for edge in connected_edges:
        if edge['data']['source'] == disease_id:
            connected_disease_ids.add(edge['data']['target'])
        else:
            connected_disease_ids.add(edge['data']['source'])
    
    # Get node info
    disease_node = next(
        (node for node in network_data['nodes'] if node['data']['id'] == disease_id),
        None
    )
    
    return {
        "disease": disease_node,
        "edges": connected_edges,
        "connected_diseases_count": len(connected_disease_ids),
        "metadata": {
            "total_edges": len(connected_edges),
            "avg_weight": sum(e['data']['weight'] for e in connected_edges) / len(connected_edges)
        }
    }


@app.get("/edge/{edge_id}")
async def get_edge_detail(edge_id: str):
    """
    Get detailed information about a specific edge.
    
    Args:
        edge_id: Edge ID (e.g., "Anxiety_disorder--None__Asthma--None")
        
    Returns:
        Edge details including shared genes and pathways
    """
    if not network_loaded:
        raise HTTPException(status_code=503, detail="Network data not loaded")
    
    # Find edge
    edge = next(
        (e for e in network_data['edges'] if e['data']['id'] == edge_id),
        None
    )
    
    if edge is None:
        raise HTTPException(status_code=404, detail=f"Edge '{edge_id}' not found")
    
    # Get source and target node info
    source_node = next(
        (n for n in network_data['nodes'] if n['data']['id'] == edge['data']['source']),
        None
    )
    target_node = next(
        (n for n in network_data['nodes'] if n['data']['id'] == edge['data']['target']),
        None
    )
    
    return {
        "edge": edge,
        "source_disease": source_node,
        "target_disease": target_node,
        "metadata": {
            "num_shared_genes": len(edge['data']['shared_genes']),
            "num_pathways": len(edge['data']['filtered_pathways']),
            "weight_log10": math.log10(edge['data']['weight'] + 1) if edge['data']['weight'] > 0 else 0
        }
    }


@app.get("/search")
async def search_diseases(keyword: str = Query(..., min_length=1)):
    """
    Search for diseases by keyword (fuzzy search).
    
    Args:
        keyword: Search keyword
        
    Returns:
        List of matching diseases
    """
    if not network_loaded:
        raise HTTPException(status_code=503, detail="Network data not loaded")
    
    keyword_lower = keyword.lower()
    
    # Find matching nodes
    matching_nodes = [
        node for node in network_data['nodes']
        if keyword_lower in node['data']['label'].lower() or
           keyword_lower in node['data']['id'].lower()
    ]
    
    # Get edge counts for each disease
    results = []
    for node in matching_nodes:
        disease_id = node['data']['id']
        edge_count = sum(
            1 for edge in network_data['edges']
            if edge['data']['source'] == disease_id or edge['data']['target'] == disease_id
        )
        results.append({
            **node['data'],
            'edge_count': edge_count
        })
    
    return {
        "results": results,
        "count": len(results),
        "query": keyword
    }


@app.get("/stats")
async def get_statistics():
    """
    Get network statistics.
    
    Returns:
        Statistics about the network
    """
    if not network_loaded:
        raise HTTPException(status_code=503, detail="Network data not loaded")
    
    weights = [edge['data']['weight'] for edge in network_data['edges']]
    weights_sorted = sorted(weights) if weights else []
    
    interpretability_yes = sum(
        1 for edge in network_data['edges']
        if edge['data'].get('interpretable', 'NO') == 'YES'
    )
    interpretability_no = sum(
        1 for edge in network_data['edges']
        if edge['data'].get('interpretable', 'NO') == 'NO'
    )
    
    total_edges = len(network_data['edges'])
    yes_percentage = f"{(interpretability_yes / total_edges * 100):.1f}%" if total_edges else "0%"
    no_percentage = f"{(interpretability_no / total_edges * 100):.1f}%" if total_edges else "0%"
    
    # 计算百分位数
    def percentile(data, p):
        if not data:
            return 0
        k = (len(data) - 1) * p / 100
        f = int(k)
        c = f + 1 if f < len(data) - 1 else f
        return data[f] + (data[c] - data[f]) * (k - f) if c < len(data) else data[f]
    
    return {
        "total_nodes": len(network_data['nodes']),
        "total_edges": total_edges,
        "weight_range": {
            "min": min(weights) if weights else 0,
            "max": max(weights) if weights else 0
        },
        "weight_percentiles": {
            "50th": percentile(weights_sorted, 50),
            "75th": percentile(weights_sorted, 75),
            "90th": percentile(weights_sorted, 90)
        },
        "interpretable_count": interpretability_yes,
        "uninterpretable_count": interpretability_no,
        "interpretable_percentage": yes_percentage,
        "uninterpretable_percentage": no_percentage
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
