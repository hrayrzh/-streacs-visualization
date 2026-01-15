// World Map Module

class WorldMap {
    constructor(containerId) {
        this.containerId = containerId;
        this.svg = null;
        this.projection = null;
        this.path = null;
        this.currentYear = 2024;
        this.playing = false;
        this.playInterval = null;
    }

    async initialize() {
        const container = document.getElementById(this.containerId);

        if (!container) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }

        const width = container.clientWidth || 1200;
        const height = container.clientHeight || 600;

        // Create SVG
        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create projection
        this.projection = d3.geoMercator()
            .scale(width / 6.5)
            .translate([width / 2, height / 1.5]);

        this.path = d3.geoPath().projection(this.projection);

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                this.svg.selectAll('path').attr('transform', event.transform);
            });

        this.svg.call(zoom);

        // Load and render map
        await this.loadMap();
        this.setupControls();
        this.createLegend();
    }

    async loadMap() {
        try {
            const worldData = await dataLoader.loadAll();
            const world = worldData.worldMap;

            if (!world) {
                throw new Error('World map data not loaded');
            }

            const countries = topojson.feature(world, world.objects.countries);

            this.svg.selectAll('path')
                .data(countries.features)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', this.path)
                .attr('fill', d => this.getCountryColor(d.properties.name, this.currentYear))
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5)
                .on('click', (event, d) => this.onCountryClick(d))
                .on('mouseover', (event, d) => this.onCountryHover(event, d))
                .on('mouseout', () => this.onCountryOut())
                .append('title')
                .text(d => this.getCountryTooltip(d.properties.name, this.currentYear));

        } catch (error) {
            console.error('Error loading map:', error);
            document.getElementById(this.containerId).innerHTML =
                '<div class="loading">Error loading map data. Using VRE data visualization instead.</div>';
        }
    }

    getCountryColor(countryName, year) {
        const code = dataLoader.getMarketCode(countryName, year);
        return HELPERS.getMarketColor(code);
    }

    getCountryTooltip(countryName, year) {
        const code = dataLoader.getMarketCode(countryName, year);
        const label = HELPERS.getMarketLabel(code);
        return `${countryName}\n${year}: ${label}`;
    }

    onCountryClick(countryData) {
        const countryName = countryData.properties.name;
        console.log('Country clicked:', countryName);

        // Open country modal
        if (window.countryModal) {
            window.countryModal.show(countryName);
        }
    }

    onCountryHover(event, countryData) {
        d3.select(event.target)
            .attr('stroke', '#2c3e50')
            .attr('stroke-width', 2);
    }

    onCountryOut() {
        d3.selectAll('.country')
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5);
    }

    updateYear(year) {
        this.currentYear = parseInt(year);
        document.getElementById('current-year').textContent = this.currentYear;

        // Update country colors
        this.svg.selectAll('path.country')
            .transition()
            .duration(300)
            .attr('fill', d => this.getCountryColor(d.properties.name, this.currentYear))
            .select('title')
            .text(d => this.getCountryTooltip(d.properties.name, this.currentYear));
    }

    setupControls() {
        const slider = document.getElementById('year-slider');
        const playBtn = document.getElementById('play-btn');

        slider.addEventListener('input', (e) => {
            this.updateYear(e.target.value);
        });

        playBtn.addEventListener('click', () => {
            if (this.playing) {
                this.stopAnimation();
                playBtn.textContent = 'Play';
            } else {
                this.startAnimation();
                playBtn.textContent = 'Pause';
            }
        });
    }

    startAnimation() {
        this.playing = true;
        const slider = document.getElementById('year-slider');

        this.playInterval = setInterval(() => {
            let year = parseInt(slider.value);
            year++;

            if (year > CONFIG.timeline.endYear) {
                year = CONFIG.timeline.startYear;
            }

            slider.value = year;
            this.updateYear(year);
        }, CONFIG.timeline.playSpeed);
    }

    stopAnimation() {
        this.playing = false;
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    createLegend() {
        const legendContainer = document.getElementById('market-legend');

        const codes = dataLoader.data.codes || [];

        codes.forEach(codeData => {
            const item = document.createElement('div');
            item.className = 'legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = HELPERS.getMarketColor(codeData.code);

            const label = document.createElement('div');
            label.className = 'legend-label';
            label.textContent = `${codeData.code}: ${codeData.label}`;

            item.appendChild(colorBox);
            item.appendChild(label);
            legendContainer.appendChild(item);
        });
    }
}

// Create global instance
let worldMap;
