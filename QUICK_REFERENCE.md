# Disease Network API - Quick Reference Card

## 🚀 Quick Start

```bash
# Windows
start_backend.bat

# Linux/Mac
./start_backend.sh

# Manual
cd backend
pip install -r requirements.txt
python data_processor.py
uvicorn main:app --reload
```

**Server:** http://localhost:8000  
**Docs:** http://localhost:8000/docs

---

## 📡 API Endpoints

### 1. Health Check
```bash
GET /health
curl http://localhost:8000/health
```
**Returns:** Server status and data counts

### 2. Network Statistics
```bash
GET /stats
curl http://localhost:8000/stats
```
**Returns:** Nodes, edges, weight distribution, interpretability stats

### 3. Get Network (with filters)
```bash
GET /network?min_weight=30000&interpretability=YES&limit=10
curl "http://localhost:8000/network?min_weight=30000&limit=10"
```
**Parameters:**
- `min_weight` (float): Minimum edge weight
- `interpretability` (YES/NO): Filter by GPT assessment
- `limit` (int): Max edges to return

### 4. Search Diseases
```bash
GET /search?keyword=cancer
curl "http://localhost:8000/search?keyword=cancer"
```
**Returns:** Matching diseases with edge counts

### 5. Get Disease Details
```bash
GET /disease/{disease_id}
curl "http://localhost:8000/disease/Bipolar_disorder--None"
```
**Returns:** All edges connected to the disease

### 6. Get Edge Details
```bash
GET /edge/{edge_id}
curl "http://localhost:8000/edge/Anxiety_disorder--None__Asthma--None"
```
**Returns:** Shared genes, pathways, GPT explanation

### 7. API Information
```bash
GET /
curl http://localhost:8000/
```
**Returns:** Available endpoints and descriptions

---

## 🧪 Testing

### Python Test Suite
```bash
cd backend
python test_api.py
```

### PowerShell Test
```powershell
cd backend
.\test_api.ps1
```

### Manual curl Tests
```bash
# Health
curl http://localhost:8000/health

# Stats
curl http://localhost:8000/stats

# Filtered network
curl "http://localhost:8000/network?min_weight=30000&limit=5"

# Search
curl "http://localhost:8000/search?keyword=cancer"

# Disease
curl "http://localhost:8000/disease/Bipolar_disorder--None"
```

---

## 📊 Response Examples

### Health Check
```json
{
  "status": "healthy",
  "nodes_count": 50,
  "edges_count": 50
}
```

### Network Data
```json
{
  "nodes": [{"data": {"id": "...", "label": "..."}}],
  "edges": [{"data": {
    "id": "...",
    "source": "...",
    "target": "...",
    "weight": 43141.93,
    "shared_genes": ["A2ML1", "A1BG"],
    "filtered_pathways": ["..."],
    "interpretability_gpt4o": "YES",
    "reason_gpt4o": "..."
  }}],
  "metadata": {
    "total_nodes": 2,
    "total_edges": 1,
    "filters_applied": {...}
  }
}
```

---

## 🔧 Filter Combinations

```bash
# High weight edges only
/network?min_weight=40000

# Interpretable edges only
/network?interpretability=YES

# Top 20 interpretable with high weight
/network?min_weight=35000&interpretability=YES&limit=20

# All data (no filters)
/network
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | Check Python installed: `python --version` |
| "Network data not loaded" | Run `python data_processor.py` first |
| Import errors | Install deps: `pip install -r requirements.txt` |
| Port 8000 in use | Change port: `uvicorn main:app --port 8001` |
| CSV not found | Ensure CSV is in project root |

---

## 📁 File Locations

```
backend/
├── main.py                    # FastAPI app
├── data_processor.py          # CSV converter
├── test_api.py               # Test suite
├── requirements.txt          # Dependencies
└── data/
    └── processed_network.json  # Generated data
```

---

## 🐳 Docker

```bash
# Build
docker build -t disease-network-backend .

# Run
docker run -p 8000:8000 disease-network-backend

# Or use compose
docker-compose up -d
```

---

## 📖 Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Backend README:** `backend/README.md`
- **Phase 1 Guide:** `PHASE1_COMPLETE.md`
- **Project README:** `README.md`

---

## ✅ Checklist

**Before running:**
- [ ] Python 3.10+ installed
- [ ] CSV file in project root
- [ ] Dependencies installed
- [ ] Data processed (JSON exists)

**To verify it works:**
- [ ] `/health` returns "healthy"
- [ ] `/stats` shows node/edge counts
- [ ] `/network` returns data
- [ ] Test suite passes

---

## 🎯 Quick Commands

```bash
# Setup
cd backend
pip install -r requirements.txt
python data_processor.py

# Run
uvicorn main:app --reload

# Test
python test_api.py

# Check logs
# (server logs appear in terminal)
```

---

## 📞 Support

- Docs: `/docs` endpoint
- Tests: `test_api.py`
- Issues: Check `README.md` troubleshooting section

---

**Version:** 1.0.0 | **Status:** Phase 1 Complete ✅
