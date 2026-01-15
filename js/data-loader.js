// Data Loader Module

class DataLoader {
    constructor() {
        this.data = {
            marketStructure: null,
            regulators: null,
            ipp: null,
            unbundling: null,
            vre: null,
            definitions: null,
            codes: null,
            worldMap: null
        };
        this.loading = false;
        this.loaded = false;
    }

    // Load all data
    async loadAll() {
        if (this.loaded) return this.data;
        if (this.loading) {
            // Wait for current loading to complete
            await new Promise(resolve => {
                const check = setInterval(() => {
                    if (this.loaded) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
            });
            return this.data;
        }

        this.loading = true;

        try {
            console.log('Loading STREACS data...');

            // Create market codes (always available)
            this.data.codes = this.createMarketCodes();

            // Try to load market structure JSON, fallback to inline
            try {
                this.data.marketStructure = await this.loadJSON('data/power-market-structure-wholesale.json');
                console.log('✓ Market structure loaded from JSON');
            } catch {
                this.data.marketStructure = this.createMarketStructureData();
                console.log('✓ Market structure created inline');
            }

            // Try to load regulators JSON, fallback to inline
            try {
                this.data.regulators = await this.loadJSON('data/sector-regulators.json');
                console.log('✓ Regulators loaded from JSON');
            } catch {
                this.data.regulators = this.createRegulatorData();
                console.log('✓ Regulators created inline');
            }

            // Try to load IPP JSON, fallback to inline
            try {
                this.data.ipp = await this.loadJSON('data/ipp-entry.json');
                console.log('✓ IPP data loaded from JSON');
            } catch {
                this.data.ipp = this.createIPPData();
                console.log('✓ IPP data created inline');
            }

            // Load VRE data
            try {
                this.data.vre = await this.loadJSON('share-of-electricity-production-from-solar-and-wind.json');
                console.log('✓ VRE data loaded:', this.data.vre?.length, 'entries');
            } catch (error) {
                console.warn('VRE data not found');
                this.data.vre = [];
            }

            // Load world map
            try {
                this.data.worldMap = await this.loadJSON('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
                console.log('✓ World map loaded');
            } catch (error) {
                console.warn('World map not loaded, map visualization will be limited');
                this.data.worldMap = null;
            }

            this.loaded = true;
            this.loading = false;
            console.log('✓ All data loaded successfully');

            return this.data;
        } catch (error) {
            console.error('Error loading data:', error);
            this.loading = false;
            this.loaded = true;
            return this.data;
        }
    }

    // Load JSON file
    async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.statusText}`);
        }
        return await response.json();
    }

    // Create market structure data from known information
    createMarketStructureData() {
        // Sample data structure for Armenia - will be expanded
        return {
            'Armenia': {
                'region': 'ECA',
                'years': {
                    '1989': '1a', '1990': '1a', '1991': '1a', '1992': '1a', '1993': '1a',
                    '1994': '1a', '1995': '1a', '1996': '1a', '1997': '1a', '1998': '1a',
                    '1999': '1a', '2000': '1a', '2001': '1a', '2002': '2b', '2003': '2b',
                    '2004': '2b', '2005': '2b', '2006': '2b', '2007': '2b', '2008': '2b',
                    '2009': '2b', '2010': '2b', '2011': '2b', '2012': '2b', '2013': '2b',
                    '2014': '2b', '2015': '2b', '2016': '2b', '2017': '2b', '2018': '2b',
                    '2019': '2b', '2020': '2b', '2021': '2b', '2022': '2b', '2023': '3a',
                    '2024': '3a'
                }
            },
            'Argentina': {
                'region': 'LAC',
                'years': {
                    '1989': '1a', '1990': '1a', '1991': '1a', '1992': '3c', '1993': '3c',
                    '1994': '3c', '1995': '3c', '1996': '3c', '1997': '3c', '1998': '3c',
                    '1999': '3c', '2000': '3c', '2001': '3c', '2002': '3c', '2003': '3c',
                    '2004': '3c', '2005': '3c', '2006': '3c', '2007': '3c', '2008': '3c',
                    '2009': '3c', '2010': '3c', '2011': '3c', '2012': '3c', '2013': '3c',
                    '2014': '3c', '2015': '3c', '2016': '3c', '2017': '3c', '2018': '3c',
                    '2019': '3c', '2020': '3c', '2021': '3c', '2022': '3c', '2023': '3c',
                    '2024': '3c'
                }
            },
            'Germany': {
                'region': 'ECA',
                'years': this.fillYears('1989', '1997', '1a', {
                    '1998': '3b', '1999': '3b', '2000': '3b', '2001': '3b', '2002': '3b',
                    '2003': '3b', '2004': '3b', '2005': '3b', '2006': '3b', '2007': '3b',
                    '2008': '3b', '2009': '3b', '2010': '3b', '2011': '3b', '2012': '3b',
                    '2013': '3b', '2014': '3b', '2015': '3b', '2016': '3b', '2017': '3b',
                    '2018': '3b', '2019': '3b', '2020': '3b', '2021': '3b', '2022': '3b',
                    '2023': '3b', '2024': '3b'
                })
            }
            // More countries will be added from the actual data
        };
    }

    fillYears(startYear, endYear, code, overrides = {}) {
        const years = {};
        for (let y = parseInt(startYear); y <= parseInt(endYear); y++) {
            years[String(y)] = overrides[String(y)] || code;
        }
        return { ...years, ...overrides };
    }

    // Create regulator data
    createRegulatorData() {
        return {
            'Armenia': {
                name: 'Public Services Regulatory Commission (PSRC)',
                yearEstablished: '1997',
                website: 'https://www.psrc.am/contents/page/history',
                notes: 'Established on April 3, 1997 by decree of the President'
            },
            'Argentina': {
                name: 'National Electricity Regulator (ENRE)',
                yearEstablished: '1991',
                website: 'https://www.argentina.gob.ar/enre',
                notes: 'Independent entity within the Energy Secretariat'
            },
            'Germany': {
                name: 'Federal Network Agency (BNetzA)',
                yearEstablished: '2005',
                website: 'https://www.bundesnetzagentur.de',
                notes: 'Regulates electricity, gas, telecommunications, post and railway markets'
            }
        };
    }

    // Create IPP data
    createIPPData() {
        return {
            'Armenia': {
                yearFirstIPP: '2003',
                yearFirstPrivateIPP: '2011',
                typeOperational: '4', // Gas
                notes: 'Hrazdan Thermal Power Plant acquired by Russian state in 2003, sold to Tashir Group in 2011'
            },
            'Argentina': {
                yearFirstIPP: '1992',
                yearFirstPrivateIPP: '1992',
                typeOperational: '1', // Hydro
                notes: 'Major privatizations in 1992 when IPPs entered the country'
            },
            'Germany': {
                yearFirstIPP: '1998',
                yearFirstPrivateIPP: '1998',
                typeOperational: '2', // Wind
                notes: 'Market liberalization enabled private generators'
            }
        };
    }

    // Create market structure codes
    createMarketCodes() {
        return [
            {
                code: '1a',
                type: 'Vertically Integrated Utility (VIU)',
                label: 'VIU State-owned',
                description: 'One state-owned company controls generation, transmission, and distribution'
            },
            {
                code: '1b',
                type: 'Vertically Integrated Utility (VIU)',
                label: 'VIU Private',
                description: 'One privately-owned company controls generation, transmission, and distribution'
            },
            {
                code: '2a',
                type: 'Single Buyer Model',
                label: 'SBM with Generation',
                description: 'Single buyer owns generation assets and purchases from IPPs'
            },
            {
                code: '2b',
                type: 'Single Buyer Model',
                label: 'SBM without Generation',
                description: 'Single buyer does not own generation, purchases from multiple generators'
            },
            {
                code: '3a',
                type: 'Wholesale Competition',
                label: 'Bilateral Trading',
                description: 'Bilateral contracting between generators and distributors'
            },
            {
                code: '3b',
                type: 'Wholesale Competition',
                label: 'Bid-based Power Exchange',
                description: 'Trading through power exchange with bid-based pricing'
            },
            {
                code: '3c',
                type: 'Wholesale Competition',
                label: 'Cost-based Pool',
                description: 'Trading through cost-based power pool'
            },
            {
                code: '3d',
                type: 'Wholesale Competition',
                label: 'Bid-based Pool',
                description: 'Mandatory pool with bid-based pricing'
            },
            {
                code: '4a',
                type: 'Retail Competition',
                label: 'Partial Retail',
                description: 'Some customer classes can choose suppliers'
            },
            {
                code: '4b',
                type: 'Retail Competition',
                label: 'Full Retail',
                description: 'All customers can choose their electricity supplier'
            }
        ];
    }

    // Get market code for country and year
    getMarketCode(country, year) {
        const countryData = this.data.marketStructure?.[country];
        if (!countryData) return null;
        return countryData.years?.[String(year)] || null;
    }

    // Get all countries
    getCountries() {
        if (!this.data.marketStructure) return [];
        return Object.keys(this.data.marketStructure).sort();
    }

    // Get VRE data for country
    getVREData(country, startYear = null, endYear = null) {
        if (!this.data.vre) return [];

        let filtered = this.data.vre.filter(d => d.Entity === country);

        if (startYear) {
            filtered = filtered.filter(d => d.Year >= startYear);
        }
        if (endYear) {
            filtered = filtered.filter(d => d.Year <= endYear);
        }

        return filtered.sort((a, b) => a.Year - b.Year);
    }
}

// Create global instance
const dataLoader = new DataLoader();
