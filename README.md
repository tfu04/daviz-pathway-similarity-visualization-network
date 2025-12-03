# DAViz: Disease Association Visualization

**Author:** Tianqi Fu (tianqif2@illinois.edu)  
**GitHub:** [@tfu04](https://github.com/tfu04)

---

Transcriptomic analysis of 1,300+ disease–condition pairs reveals hidden molecular relationships across diseases.

## Project Overview

An interactive web-based visualization system for exploring disease-disease relationships based on:
- **Transcriptomic signatures** (Lasso regression for gene selection)
- **Gene-level similarity** (Bidirectional hypergeometric testing)
- **Pathway-level similarity** (Functional enrichment analysis)
- **GPT-4o interpretability** annotations

This system visualizes computational biology research results showing how diseases are connected through shared genes and biological pathways.

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Process CSV data**
   ```bash
   python data_processor.py
   ```
   
   This creates `backend/data/processed_network.json` from the source CSV.

3. **Start the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   
   Backend API runs at http://localhost:8000

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Frontend app runs at http://localhost:3000

### Quick Test
   
   Visit http://localhost:8000/docs for interactive API documentation.
   
   Or test via command line:
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Get network statistics
   curl http://localhost:8000/stats
   
   # Get filtered network
   curl "http://localhost:8000/network?min_weight=30000&limit=10"
   ```

---

## API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and available endpoints |
| `/health` | GET | Health check and data load status |
| `/stats` | GET | Network statistics (node/edge counts, weight distribution) |
| `/network` | GET | Get network data with optional filters |
| `/disease/{id}` | GET | Get all edges for a specific disease |
| `/edge/{id}` | GET | Get detailed information about an edge |
| `/search` | GET | Fuzzy search for diseases by keyword |

### Interactive Documentation

Visit http://localhost:8000/docs for **Swagger UI** with interactive API testing.

### Example Usage

#### 1. Get Network with Filters

```bash
curl "http://localhost:8000/network?min_weight=35000&interpretability=YES&limit=20"
```

**Parameters:**
- `min_weight` (optional): Minimum edge weight threshold
- `interpretability` (optional): Filter by GPT-4o assessment (YES/NO)
- `limit` (optional): Maximum number of edges to return

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
        "filtered_pathways": ["fat cell differentiation", ...],
        "interpretability_gpt4o": "YES",
        "reason_gpt4o": "Explanation from GPT-4o..."
      }
    }
  ]
}
```

#### 2. Search for Diseases

```bash
curl "http://localhost:8000/search?keyword=cancer"
```

Returns all diseases matching the keyword.

#### 3. Get Disease Details

```bash
curl "http://localhost:8000/disease/Bipolar_disorder--None"
```

Returns all edges connected to the specified disease.

---

## Project Structure

```
pathway-similarity-network/
├── pathway_network_result_with_gpt4o_evaluation.csv  # Source data
├── README.md                                          # Main documentation
├── docker-compose.yml                                 # Docker orchestration
│
├── backend/                         # FastAPI backend
│   ├── main.py                      # FastAPI application
│   ├── data_processor.py            # CSV to JSON converter
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Docker configuration
│   └── data/
│       └── processed_network.json   # Generated network data
│
└── frontend/                        # React + Cytoscape.js visualization
    ├── src/
    │   ├── components/              # React components
    │   ├── services/                # API integration
    │   └── App.jsx                  # Main application
    ├── package.json                 # Node dependencies
    └── vite.config.js               # Vite configuration
```

---

## Data Format

### Input: CSV File

`pathway_network_result_with_gpt4o_evaluation.csv` contains:

| Column | Description |
|--------|-------------|
| `pair1` | First disease-condition pair (e.g., "Anxiety_disorder--None") |
| `pair2` | Second disease-condition pair |
| `shared_genes` | Semicolon-separated gene names |
| `shared_pathways` | Raw enrichment results |
| `filtered_pathways` | Cleaned pathway list |
| `weight` | Similarity score (higher = more similar) |
| `interpretability_gpt4o` | YES or NO |
| `reason_gpt4o` | GPT-4o explanation |

### Output: JSON Network

Cytoscape-compatible format:
```json
{
  "nodes": [{"data": {"id": "...", "label": "..."}}],
  "edges": [{"data": {"id": "...", "source": "...", "target": "...", "weight": ..., ...}}]
}
```

---

## Algorithm Background (from Paper)

The research implements a three-step pipeline:

### Step 1: Transcriptomic Signature Extraction (Lasso Regression)

```
β̂ = argmin_β [ ||y - Xβ||² + λ||β||₁ ]
```

- Selects significant genes (|β| > 0.05) for each disease
- Creates disease-specific gene signatures

### Step 2: Gene-Level Similarity (Hypergeometric Test)

```
p_combined = max(p_A, p_B)
```

- Computes overlap significance between gene sets
- Applies Benjamini-Hochberg FDR correction

### Step 3: Pathway-Level Similarity (Enrichment Analysis)

```
similarity = Σ [ log(1 - p₁ₖ) + log(1 - p₂ₖ) ]
```

- Identifies shared pathways (GO, KEGG, Reactome, etc.)
- Combines enrichment p-values

---

## Features

### Backend (FastAPI)
- ✅ RESTful API with 7 endpoints
- ✅ Data processing pipeline (CSV to JSON)
- ✅ Advanced filtering (weight, interpretability, limit)
- ✅ Disease search functionality
- ✅ Network statistics computation
- ✅ Docker support
- ✅ Interactive API documentation (Swagger UI)

### Frontend (React + Cytoscape.js)
- ✅ Interactive network visualization
- ✅ Multiple layout algorithms (COSE Bilkent, Cola, Circle, Grid)
- ✅ Node/edge selection with detail panels
- ✅ Real-time filtering and search
- ✅ GPT-4o interpretability annotations
- ✅ Color-coded nodes by interpretability
- ✅ Weight-based edge thickness
- ✅ Export network as PNG
- ✅ Responsive design

### Future Enhancements
- [ ] Export network (PNG, JSON, GraphML)
- [ ] User annotations and notes
- [ ] Integration with NCBI, UniProt
- [ ] Subnetwork extraction
- [ ] Comparative analysis tools

---

## Testing

### API Testing

```bash
# Health check
curl http://localhost:8000/health

# Get statistics
curl http://localhost:8000/stats

# Get filtered network
curl "http://localhost:8000/network?min_weight=30000&limit=10"

# Search diseases
curl "http://localhost:8000/search?keyword=cancer"

# Get disease details
curl "http://localhost:8000/disease/Bipolar_disorder--None"

# Get edge details
curl "http://localhost:8000/edge/Acute_Myeloid_Leukemia--Hypertension__Asthma--None"
```

### Automated Test Suite

```bash
cd backend
python test_api.py
```

---

## Docker Deployment (Optional)

### Backend Only

```bash
cd backend
docker build -t disease-network-backend .
docker run -p 8000:8000 disease-network-backend
```

### Full Stack (when frontend is ready)

```bash
docker-compose up -d
```

---

## Technical Specifications

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.10+
- **Data Processing**: pandas, numpy
- **Server**: Uvicorn (ASGI)
- **Response Format**: JSON
- **CORS**: Enabled for frontend integration

### Frontend (Planned)
- **Framework**: React 18+
- **Visualization**: Cytoscape.js
- **UI Components**: Material-UI or TailwindCSS
- **State Management**: React Context or Redux

### Performance
- API response time: <1 second for 1000 edges
- Efficient filtering and pagination
- Initial view uses 75th percentile weight threshold

---

## Troubleshooting

### Common Issues

**"Network data not loaded" error:**
- Ensure `backend/data/processed_network.json` exists
- Run `python data_processor.py` first

**Import errors (FastAPI, uvicorn not found):**
```bash
cd backend
pip install -r requirements.txt
```

**Port 8000 already in use:**
```bash
uvicorn main:app --reload --port 8001
```

**CSV file not found:**
- Ensure `pathway_network_result_with_gpt4o_evaluation.csv` is in project root
- Or update path in `backend/data_processor.py`

---

## Research Background

This visualization system is based on research from:

**Paper**: [*Discovering hidden relationships between diseases using transcriptomic data*](https://arxiv.org/abs/2508.04742)  
**Public pre-print**: August 2025  
**Methods**: Lasso regression for gene selection, bidirectional hypergeometric testing for gene-level similarity, and pathway enrichment analysis

The system visualizes pre-computed results, focusing on making complex biological relationships interpretable and interactive.

---

## License

This project is for academic research purposes.

## Acknowledgments

- Professor [Haohan Wang](https://haohanwang.ischool.illinois.edu/)
- [Ke Chen](https://scholar.google.com/citations?user=22snSGMAAAAJ)
- GPT-4o for interpretability annotations

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/tfu04/pathway_similarity_visualization_network.git
   cd pathway_similarity_visualization_network
   ```

2. **Start the backend** (see Backend Setup above)

3. **Start the frontend** (see Frontend Setup above)

4. **Explore the visualization** at http://localhost:3000

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Citation

If you use this visualization tool in your research, please cite the original paper:

```bibtex
@article{pathway2024,
  title={Discovering hidden relationships between diseases using transcriptomic data},
  year={2025},
  month={August}
}
```
