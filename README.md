# STREACS - Power Market Liberalization & VRE Integration

Interactive web application visualizing global electricity market evolution and Variable Renewable Energy (VRE) integration (1989-2024).

🌐 **[Live Demo](https://hrayrzh.github.io/-streacs-visualization/)**

---

## Features

✅ **Interactive World Map** - Track market structures across 10+ countries
✅ **Armenia Case Study** - VRE growth from 0.10% (2018) to 14.98% (2025)
✅ **Armenia Market Intelligence** - Real-time AEX market data visualization
✅ **Country Comparison** - Compare up to 10 countries
✅ **Future Scenarios** - Projections for 2030-2040
✅ **Mobile Optimized** - Responsive design for all devices

---

## Recent Updates

**February 2026**
- ✨ Update Armenia solar & wind data with PSRC official statistics (2018-2025)
- 🔧 Fix mobile UX: header padding, country search, portrait MCP height
- 📱 Add comprehensive mobile optimization for all modules
- 🏢 Add Armenia Market Intelligence module with AEX data visualization
- 🎨 Add Market Liberalization background colors to country modal VRE charts
- 🌍 Restore Electric Networks of Armenia CJSC in heatmap

---

## Quick Start

### Online
Just open the GitHub Pages link above

### Local
```bash
# Clone repository
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME

# Start server (Windows)
START.bat

# Or use Python
python -m http.server 8000

# Open: http://localhost:8000
```

---

## Market Structure Codes

| Code | Description |
|------|-------------|
| **1a** | VIU State-owned |
| **1b** | VIU Private |
| **2a/2b** | Single Buyer Model |
| **3a/3b/3c/3d** | Wholesale Competition |
| **4a/4b** | Retail Competition |

---

## Technology Stack

- **D3.js** - Interactive map
- **Chart.js** - Data visualization
- **TopoJSON** - Geographic data
- **Vanilla JavaScript** - No frameworks

---

## Data Sources

- World Bank - Regional classification
- National regulators - Regulatory data
- Our World in Data - VRE statistics
- STREACS Database - Market structures (1989-2024)

---

## Project Structure

```
├── index.html          # Main application
├── css/               # Styles
├── js/                # JavaScript modules
├── data/              # JSON data files
└── share-of-...json   # VRE statistics
```

---

## License

Research project - STREACS

---

**Developed:** January 2026
