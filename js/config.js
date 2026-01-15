// STREACS Configuration

const CONFIG = {
    // Market structure color mapping
    marketColors: {
        '1a': '#d73027', // VIU State-owned - Dark Red
        '1b': '#fc8d59', // VIU Private - Orange
        '2a': '#fee090', // SBM with generation - Light Yellow
        '2b': '#e0f3f8', // SBM without generation - Light Blue
        '3a': '#91bfdb', // Wholesale bilateral - Medium Blue
        '3b': '#4575b4', // Wholesale pool - Dark Blue
        '3c': '#74add1', // Wholesale cost-based - Light Blue
        '3d': '#313695', // Wholesale bid-based - Navy
        '4a': '#abd9e9', // Retail partial - Cyan
        '4b': '#2c7bb6', // Retail full - Deep Blue
        'none': '#cccccc' // No data - Gray
    },

    // Market structure labels
    marketLabels: {
        '1a': 'VIU State-owned',
        '1b': 'VIU Private',
        '2a': 'SBM with Generation',
        '2b': 'SBM without Generation',
        '3a': 'Wholesale - Bilateral',
        '3b': 'Wholesale - Pool',
        '3c': 'Wholesale - Cost-based',
        '3d': 'Wholesale - Bid-based',
        '4a': 'Retail - Partial',
        '4b': 'Retail - Full'
    },

    // IPP type labels
    ippTypes: {
        '1': 'Hydro',
        '2': 'Wind',
        '3': 'Solar',
        '4': 'Gas',
        '5': 'Coal',
        '6': 'Oil',
        '7': 'Biomass/Biogas/Waste',
        '8': 'Geothermal',
        '9': 'Battery',
        '0': 'None'
    },

    // Timeline settings
    timeline: {
        startYear: 1989,
        endYear: 2024,
        playSpeed: 500 // milliseconds per year
    },

    // Armenia key milestones
    armeniaMilestones: [
        { year: 1997, event: 'Public Services Regulatory Commission (PSRC) established' },
        { year: 2002, event: 'ISO unbundling model implemented' },
        { year: 2011, event: 'First private IPP (gas-fired plant)' },
        { year: 2018, event: 'VRE penetration begins: 0.07%' },
        { year: 2022, event: 'Transition to wholesale market (code 3a)' },
        { year: 2023, event: 'Market structure upgraded to 3a' },
        { year: 2024, event: 'VRE reaches 10.1% (July 2024)' }
    ],

    // Chart colors
    chartColors: {
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#e74c3c',
        warning: '#f39c12',
        info: '#9b59b6',
        grid: 'rgba(0, 0, 0, 0.1)'
    },

    // Data file paths
    dataPaths: {
        marketStructure: 'data/power-market-structure-wholesale.json',
        regulators: 'data/sector-regulators.json',
        ipp: 'data/ipp-entry.json',
        unbundling: 'data/unbundling.json',
        vre: 'share-of-electricity-production-from-solar-and-wind.json',
        definitions: 'data/definitions.json',
        codes: 'data/market-structure-codes.json',
        worldMap: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
    }
};

// Helper functions
const HELPERS = {
    // Get color for market code
    getMarketColor(code) {
        return CONFIG.marketColors[code] || CONFIG.marketColors['none'];
    },

    // Get label for market code
    getMarketLabel(code) {
        return CONFIG.marketLabels[code] || 'No data';
    },

    // Get IPP type label
    getIPPType(typeCode) {
        return CONFIG.ippTypes[String(typeCode)] || 'Unknown';
    },

    // Format year for display
    formatYear(year) {
        return year ? String(year) : 'N/A';
    },

    // Calculate liberalization level (numeric score)
    getLiberalizationScore(code) {
        const scores = {
            '1a': 1, '1b': 2,
            '2a': 3, '2b': 4,
            '3a': 5, '3b': 6, '3c': 6, '3d': 7,
            '4a': 8, '4b': 9
        };
        return scores[code] || 0;
    },

    // Get VRE data for country and year
    getVREForCountry(vreData, countryName, year) {
        if (!vreData) return null;
        const entry = vreData.find(d =>
            d.Entity === countryName && d.Year === year
        );
        return entry ? entry['Solar and wind - % electricity'] : null;
    },

    // Calculate RMSE
    calculateRMSE(actual, predicted) {
        if (actual.length !== predicted.length) return null;
        const squaredErrors = actual.map((a, i) => Math.pow(a - predicted[i], 2));
        const meanSquaredError = squaredErrors.reduce((sum, val) => sum + val, 0) / actual.length;
        return Math.sqrt(meanSquaredError);
    },

    // Calculate MAE
    calculateMAE(actual, predicted) {
        if (actual.length !== predicted.length) return null;
        const absoluteErrors = actual.map((a, i) => Math.abs(a - predicted[i]));
        return absoluteErrors.reduce((sum, val) => sum + val, 0) / actual.length;
    }
};
