# Pathway Similarity Network

Transcriptomic analysis of 1,300+ disease–condition pairs reveals hidden molecular relationships across diseases using agentic AI.

## Project Overview

An interactive web-based visualization system for exploring disease-disease relationships based on:
- **Transcriptomic signatures** (Lasso regression for gene selection)
- **Gene-level similarity** (Bidirectional hypergeometric testing)
- **Pathway-level similarity** (Functional enrichment analysis)
- **GPT-4o interpretability** annotations

This system visualizes computational biology research results showing how diseases are connected through shared genes and biological pathways.

---

## Quick Start (Phase 1 - Backend)

### Prerequisites
- Python 3.10+
- pip

### Installation and Setup

1. **Clone and navigate to project**
   ```bash
   cd "c:\College Stuff\2025 Fall\Independent Study"
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Process CSV data**
   ```bash
   python data_processor.py
   ```
   
   This creates `backend/data/processed_network.json` from `pathway_network_result_with_gpt4o_evaluation.csv`.

4. **Start the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Server runs at http://localhost:8000

5. **Test the API**
   
   Open another terminal and run:
   ```powershell
   # Health check
   curl http://localhost:8000/health
   
   # Get network statistics
   curl http://localhost:8000/stats
   
   # Get filtered network (weight >= 30000, limit 10 edges)
   curl "http://localhost:8000/network?min_weight=30000&limit=10"
   ```
   
   Or run the test script:
   ```bash
   python test_api.py
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
c:\College Stuff\2025 Fall\Independent Study\
├── pathway_network_result_with_gpt4o_evaluation.csv  # Source data
├── README.md                                          # This file
├── docker-compose.yml                                 # Docker orchestration
│
├── backend/                         # FastAPI backend (Phase 1 ✅)
│   ├── main.py                      # FastAPI application with all endpoints
│   ├── data_processor.py            # CSV → JSON converter
│   ├── test_api.py                  # API test suite
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Docker configuration
│   ├── README.md                    # Backend documentation
│   ├── .gitignore                   # Git ignore rules
│   └── data/
│       └── processed_network.json   # Generated network JSON
│
└── frontend/                        # React + Cytoscape.js (Phase 2 - Coming Soon)
    └── (to be built)
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

## Development Roadmap

### ✅ Phase 1: Backend (Current - COMPLETED)
- [x] CSV to JSON conversion script
- [x] FastAPI backend with 7 core endpoints
- [x] Filtering (min_weight, interpretability, limit)
- [x] Disease search functionality
- [x] Docker support
- [x] API documentation (Swagger UI)
- [x] Test suite

### 🚧 Phase 2: Frontend (Next)
- [ ] React application setup
- [ ] Cytoscape.js network visualization
- [ ] Interactive node/edge selection
- [ ] Details panel with GPT-4o explanations
- [ ] Dynamic filtering UI (sliders, dropdowns)
- [ ] Node coloring by interpretability
- [ ] Edge thickness by weight

### 🔮 Phase 3: Advanced Features (Future)
- [ ] Export network (PNG, JSON, GraphML)
- [ ] User annotations and notes
- [ ] Integration with NCBI, UniProt
- [ ] Subnetwork extraction
- [ ] Comparative analysis tools

---

## Testing

### Manual Testing with curl (PowerShell)

```powershell
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

## Academic Context

This project is part of an undergraduate independent study under the guidance of a professor and MS student. The implementation focuses on:

1. **No algorithm reimplementation** - Results are pre-computed
2. **Visualization focus** - Making results interpretable and interactive
3. **Full-stack engineering** - Backend API + Frontend visualization
4. **Research communication** - Presenting complex biology in an accessible way

### Paper Reference
- Title: *Discovering hidden relationships between diseases using transcriptomic data*
- Publication Date: 2024-09-12
- Methods: Lasso regression, hypergeometric testing, enrichment analysis

---

## License

This project is for academic research purposes.

## Acknowledgments

- Research paper authors
- Professor and MS student collaborators
- GPT-4o for interpretability annotations

---

## Next Steps

1. ✅ **Completed**: Backend API with CSV processing and filtering
2. **Up Next**: Build React frontend with Cytoscape.js
3. **Test Phase 1**: Run `python test_api.py` to verify backend

**Ready to visualize disease networks! 🧬**
