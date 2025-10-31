# Disease Network Visualization - Backend

FastAPI backend server for disease-disease network visualization.

## Features

- **Data Processing**: Converts CSV data into network JSON format
- **REST API**: Provides endpoints for network exploration
- **Filtering**: Support for weight, interpretability, and limit filters
- **Search**: Fuzzy search for diseases by keyword

## Setup

### 1. Create data directory and add CSV file

```bash
mkdir data
# Copy pathway_network_result_with_gpt4o_evaluation.csv to data/
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Process CSV data

```bash
python data_processor.py
```

This will create `data/processed_network.json`.

### 4. Start the server

```bash
uvicorn main:app --reload
```

Server will start at http://localhost:8000

## API Endpoints

### Health Check
```bash
GET /health
```

### Get Network Data
```bash
GET /network?min_weight=30000&interpretability=YES&limit=100
```

Parameters:
- `min_weight` (optional): Minimum edge weight
- `interpretability` (optional): YES or NO
- `limit` (optional): Maximum number of edges

### Get Disease Edges
```bash
GET /disease/{disease_id}
```

Example:
```bash
GET /disease/Anxiety_disorder--None
```

### Get Edge Details
```bash
GET /edge/{edge_id}
```

Example:
```bash
GET /edge/Anxiety_disorder--None__Asthma--None
```

### Search Diseases
```bash
GET /search?keyword=anxiety
```

### Get Statistics
```bash
GET /stats
```

## Testing with curl

### Health check
```bash
curl http://localhost:8000/health
```

### Get network with filters
```bash
curl "http://localhost:8000/network?min_weight=30000&limit=10"
```

### Search for a disease
```bash
curl "http://localhost:8000/search?keyword=cancer"
```

### Get specific disease edges
```bash
curl "http://localhost:8000/disease/Bipolar_disorder--None"
```

## Docker Support

```bash
# Build image
docker build -t disease-network-backend .

# Run container
docker run -p 8000:8000 disease-network-backend
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── data_processor.py       # CSV to JSON converter
├── requirements.txt        # Python dependencies
├── README.md              # This file
└── data/
    ├── pathway_network_result_with_gpt4o_evaluation.csv
    └── processed_network.json (generated)
```

## Development

### Running tests
```bash
pytest tests/
```

### Code formatting
```bash
black .
```

### Type checking
```bash
mypy .
```
