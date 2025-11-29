# Disease Network Visualization - Frontend

Interactive web application for exploring disease-disease relationships using network visualization.

## Author

**Tianqi Fu**  
Email: tianqif2@illinois.edu  
GitHub: [@tfu04](https://github.com/tfu04)

## Overview

React-based frontend application that visualizes disease similarity networks using Cytoscape.js. Features interactive exploration, real-time filtering, and detailed information panels with GPT-4o interpretability annotations.

## Features

- **Interactive Network Visualization**: Cytoscape.js powered graph rendering
- **Multiple Layout Algorithms**: COSE Bilkent, Cola, Circle, Grid, Random
- **Dynamic Filtering**: Weight threshold, interpretability, edge count limits
- **Search Functionality**: Real-time disease search with autocomplete
- **Detail Panels**: Comprehensive node and edge information
- **GPT-4o Annotations**: AI-generated interpretability explanations
- **Export Capabilities**: Download network visualizations as PNG
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager
- Backend API running at http://localhost:8000

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at http://localhost:3000

## Technology Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.10 | Build tool and dev server |
| Cytoscape.js | 3.30.2 | Network visualization |
| cytoscape-cola | 2.5.1 | Cola layout algorithm |
| cytoscape-cose-bilkent | 4.1.0 | COSE Bilkent layout |
| Axios | 1.7.7 | HTTP client |
| ESLint | 9.13.0 | Code linting |

## Usage Guide

### Basic Navigation

1. **View Network**
   - Network loads automatically on start
   - Default filter: Weight ≥ 8400 (75th percentile)
   - Default display: 500 edges

2. **Explore Network**
   - **Pan**: Click and drag background
   - **Zoom**: Mouse wheel or pinch gesture
   - **Select Node**: Click on any disease node
   - **Select Edge**: Click on connection line
   - **Deselect**: Click on empty space

3. **Apply Filters**
   - **Weight Filter**: Adjust slider to set minimum weight
   - **Quick Filters**: Buttons for All, Median, 75%, 90%
   - **Interpretability**: Filter by YES/NO/All
   - **Edge Limit**: Set maximum edges to display (100-1055)
   - **Reset**: Click "Reset Filters" to restore defaults

4. **Search Diseases**
   - Type disease name in search box
   - Select from autocomplete dropdown
   - Network automatically focuses on selected disease

5. **View Details**
   - **Node Details**: Disease info, connections, statistics
   - **Edge Details**: Shared genes, pathways, GPT-4o explanation

6. **Change Layout**
   - Select algorithm from dropdown menu
   - **COSE Bilkent**: Force-directed (default, best for large networks)
   - **Cola**: Constrained layout
   - **Circle**: Circular arrangement
   - **Grid**: Grid-based layout
   - **Random**: Random positioning

7. **Export**
   - Click "📷 Export" button
   - Downloads PNG at 2x resolution

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── NetworkVisualization.jsx    # Main network component
│   │   ├── NetworkVisualization.css    # Network styles
│   │   ├── DetailPanel.jsx             # Details sidebar
│   │   ├── DetailPanel.css             # Details styles
│   │   ├── FilterPanel.jsx             # Controls sidebar
│   │   └── FilterPanel.css             # Filter styles
│   ├── services/
│   │   └── api.js                      # API client
│   ├── App.jsx                         # Root component
│   ├── App.css                         # App styles
│   ├── main.jsx                        # Entry point
│   └── index.css                       # Global styles
├── public/                             # Static assets
├── index.html                          # HTML template
├── vite.config.js                      # Vite configuration
├── package.json                        # Dependencies
└── README.md                           # This file
```

## API Integration

Frontend connects to backend API via Vite proxy:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### API Endpoints Used

- `GET /network` - Fetch network data with filters
- `GET /disease/{id}` - Get edges for specific disease
- `GET /edge/{id}` - Get detailed edge information
- `GET /search` - Search diseases by keyword
- `GET /stats` - Fetch network statistics
- `GET /health` - Health check

## Development

### Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Variables

Create `.env` file:

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Disease Network Visualization
```

### Hot Module Replacement

Vite provides fast HMR - changes appear instantly without full reload.

## Customization

### Theme Colors

Edit `src/index.css`:

```css
:root {
  --primary-color: #646cff;
  --success-color: #4CAF50;
  --background-color: #242424;
  --text-color: #ffffff;
}
```

### Node Styling

Edit Cytoscape styles in `src/components/NetworkVisualization.jsx`:

```javascript
{
  selector: 'node',
  style: {
    'background-color': '#4CAF50',  // Change node color
    'width': 50,                     // Change node size
    'label': 'data(label)',          // Node label
  }
}
```

### Edge Styling

```javascript
{
  selector: 'edge',
  style: {
    'width': (ele) => Math.log(ele.data('weight') + 1) * 0.3,
    'line-color': '#66BB6A',
    'opacity': 0.3
  }
}
```

## Performance Optimization

### Best Practices

1. **Limit Edge Count**: Use display limit filter (100-500 edges)
2. **Increase Weight Threshold**: Filter out low-weight edges
3. **Use Fast Layouts**: Grid or Circle for large networks
4. **Reduce Animation**: Disable transitions for better performance

### Troubleshooting

#### Frontend won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Cannot connect to backend

1. Verify backend is running: http://localhost:8000/health
2. Check proxy configuration in `vite.config.js`
3. Check browser console for CORS errors

#### Network won't display

1. Check if data is loaded in network panel
2. Verify backend has processed data
3. Open browser DevTools and check console errors

#### Performance issues

1. Reduce edge count limit
2. Increase weight threshold
3. Use simpler layout (Grid or Circle)
4. Close other browser tabs

## Build and Deployment

### Production Build

```bash
npm run build
```

Output directory: `dist/`

### Serve Static Files

```bash
# Using Python
python -m http.server -d dist 3000

# Using Node.js serve
npx serve dist -p 3000
```

### Docker Deployment

```bash
# Build image
docker build -t disease-network-frontend .

# Run container
docker run -p 3000:80 disease-network-frontend
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 12+, Chrome Android

## Data Visualization

### Node Colors

- 🟢 **Green**: Interpretable relationship (GPT-4o: YES)
- ⚪ **Gray**: Non-interpretable relationship (GPT-4o: NO)
- 🔵 **Blue Border**: Selected node
- 🟠 **Orange Highlight**: Neighbor nodes

### Edge Properties

- **Width**: Proportional to weight (log scale)
- **Color**: Matches interpretability (green or gray)
- **Opacity**: 30% default, 100% when selected

## Accessibility

- Keyboard navigation support
- Screen reader compatible labels
- High contrast mode support
- Focus indicators on interactive elements

## Support

For issues and questions:
- Open an issue on GitHub
- Check browser console for errors
- Review API documentation
- Ensure backend is running properly
