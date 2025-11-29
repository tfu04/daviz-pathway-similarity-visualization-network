# Disease Network API - Backend

FastAPI-based REST API for disease similarity network exploration.

## Author

**Tianqi Fu**  
Email: tianqif2@illinois.edu  
GitHub: [@tfu04](https://github.com/tfu04)

## Overview

This backend service processes disease transcriptomic data and provides RESTful endpoints for network visualization. It converts raw CSV data into an optimized JSON format and supports advanced filtering, search, and statistical analysis.

## Features

- **Data Processing Pipeline**: Converts CSV to Cytoscape-compatible JSON
- **RESTful API**: 7 endpoints for network exploration
- **Advanced Filtering**: By weight threshold, interpretability, and result limit
- **Full-Text Search**: Fuzzy disease name search
- **Statistics**: Real-time network metrics and distributions
- **Interactive Documentation**: Auto-generated Swagger UI
- **Docker Support**: Containerized deployment

## Quick Start

### Prerequisites

- Python 3.10 or higher
- pip package manager

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Process source data
python data_processor.py

# Start the server
uvicorn main:app --reload
```

Server will be available at http://localhost:8000

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Service health status |
| `/stats` | GET | Network statistics |
| `/network` | GET | Filtered network data |
| `/disease/{id}` | GET | Edges for specific disease |
| `/edge/{id}` | GET | Detailed edge information |
| `/search` | GET | Search diseases by keyword |

### Examples

#### Get Network with Filters

```bash
curl "http://localhost:8000/network?min_weight=30000&interpretability=YES&limit=20"
```

**Query Parameters:**
- `min_weight` (float, optional): Minimum edge weight threshold
- `interpretability` (string, optional): Filter by GPT-4o assessment (`YES` or `NO`)
- `limit` (int, optional): Maximum number of edges to return

**Response:**
```json
{
  "nodes": [
    {
      "data": {
        "id": "Anxiety_disorder--None",
        "label": "Anxiety disorder"
      }
    }
  ],
  "edges": [
    {
      "data": {
        "id": "Anxiety_disorder--None__Asthma--None",
        "source": "Anxiety_disorder--None",
        "target": "Asthma--None",
        "weight": 43141.93,
        "shared_genes": ["A2ML1", "A1BG"],
        "filtered_pathways": ["fat cell differentiation"],
        "interpretable": "YES",
        "reason_gpt4o": "Both conditions share inflammatory pathways..."
      }
    }
  ]
}
```

#### Search Diseases

```bash
curl "http://localhost:8000/search?keyword=cancer&limit=10"
```

Returns diseases matching the keyword, sorted by relevance.

#### Get Disease Details

```bash
curl "http://localhost:8000/disease/Bipolar_disorder--None"
```

Returns all edges connected to the specified disease node.

#### Get Statistics

```bash
curl "http://localhost:8000/stats"
```

Returns network-wide statistics including node count, edge count, weight distribution, and interpretability metrics.

## Data Format

### Input CSV Structure

The source CSV file should contain:

| Column | Type | Description |
|--------|------|-------------|
| `pair1` | string | First disease identifier |
| `pair2` | string | Second disease identifier |
| `shared_genes` | string | Semicolon-separated gene list |
| `filtered_pathways` | string | Semicolon-separated pathway list |
| `weight` | float | Similarity score |
| `interpretability_gpt4o` | string | `YES` or `NO` |
| `reason_gpt4o` | string | GPT-4o explanation |

### Output JSON Structure

Cytoscape.js compatible format:

```json
{
  "nodes": [
    {
      "data": {
        "id": "unique_disease_id",
        "label": "Human-readable disease name"
      }
    }
  ],
  "edges": [
    {
      "data": {
        "id": "unique_edge_id",
        "source": "source_disease_id",
        "target": "target_disease_id",
        "weight": 12345.67,
        "shared_genes": ["GENE1", "GENE2"],
        "filtered_pathways": ["pathway1", "pathway2"],
        "interpretable": "YES",
        "reason_gpt4o": "Explanation text"
      }
    }
  ]
}
```

## Development

### Project Structure

```
backend/
├── main.py                 # FastAPI application
├── data_processor.py       # CSV to JSON converter
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
└── data/
    ├── pathway_network_result_with_gpt4o_evaluation.csv  # Source
    └── processed_network.json                             # Generated
```

### Dependencies

- **FastAPI** (0.115+): Modern web framework
- **Uvicorn** (0.32+): ASGI server
- **pandas** (2.2+): Data processing
- **python-multipart**: File upload support

### Running Tests

```bash
# Start server in test mode
pytest

# Manual endpoint testing
curl http://localhost:8000/health
curl http://localhost:8000/stats
```

### Code Style

Format code with:
```bash
black .
```

Type checking:
```bash
mypy main.py
```

## Docker Deployment

### Build Image

```bash
docker build -t disease-network-api .
```

### Run Container

```bash
docker run -p 8000:8000 disease-network-api
```

### Docker Compose

See `docker-compose.yml` in the project root for multi-container setup.

## Performance

- **Response Time**: < 100ms for filtered queries
- **Data Size**: ~1055 edges, 91 nodes
- **Memory Usage**: < 200MB
- **Concurrent Requests**: Supports async processing

## Environment Variables

```bash
# Server configuration
HOST=0.0.0.0
PORT=8000

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Troubleshooting

### "Network data not loaded" error

Ensure `data/processed_network.json` exists:
```bash
python data_processor.py
```

### Import errors

Reinstall dependencies:
```bash
pip install -r requirements.txt --upgrade
```

### Port already in use

Change the port:
```bash
uvicorn main:app --reload --port 8001
```

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API examples above
