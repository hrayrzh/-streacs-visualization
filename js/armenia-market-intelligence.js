// Armenia Market Intelligence Module
// Visualizations for Armenian Energy Exchange (AEX) Data

class ArmeniaMarketIntelligence {
    constructor() {
        this.mcpChart = null;
        this.selectedDate = '2024-01-01';
        this.selectedYear = 2024;
        this.selectedSurplusType = 'bid';
        this.selectedMonth = 'all';
        this.initialized = false;
        this.isMobile = window.innerWidth <= 768;
        this.isVerySmall = window.innerWidth <= 480;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        console.log('Initializing Armenia Market Intelligence...');

        // Show container
        const container = document.getElementById('armenia-market-intelligence');
        if (container) {
            container.style.display = 'block';
        }

        // Set up event listeners
        this.setupEventListeners();

        // Create initial visualizations
        try {
            await this.createMCPChart(this.selectedDate);
            await this.createSurplusHeatmap(this.selectedYear, this.selectedSurplusType, this.selectedMonth);

            this.initialized = true;
            console.log('✓ Armenia Market Intelligence initialized');
        } catch (error) {
            console.error('Error initializing Armenia Market Intelligence:', error);
        }
    }

    setupEventListeners() {
        // Window resize handler for mobile orientation changes
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const wasMobile = this.isMobile;
                const wasVerySmall = this.isVerySmall;
                this.isMobile = window.innerWidth <= 768;
                this.isVerySmall = window.innerWidth <= 480;

                // Recreate visualizations if mobile state or orientation changed
                if (wasMobile !== this.isMobile || wasVerySmall !== this.isVerySmall) {
                    if (this.initialized) {
                        this.createMCPChart(this.selectedDate);
                        this.createSurplusHeatmap(this.selectedYear, this.selectedSurplusType, this.selectedMonth);
                    }
                }
            }, 300);
        });

        // Orientation change handler
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.initialized) {
                    this.createMCPChart(this.selectedDate);
                }
            }, 100);
        });

        // MCP Date Picker
        const mcpDatePicker = document.getElementById('aex-mcp-date');
        if (mcpDatePicker) {
            mcpDatePicker.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.createMCPChart(this.selectedDate);
            });
        }

        // DAM Surplus Controls
        const surplusYear = document.getElementById('aex-surplus-year');
        const surplusType = document.getElementById('aex-surplus-type');
        const surplusMonth = document.getElementById('aex-surplus-month');

        const updateSurplusHeatmap = () => {
            this.selectedYear = parseInt(surplusYear.value);
            this.selectedSurplusType = surplusType.value;
            this.selectedMonth = surplusMonth.value;
            this.createSurplusHeatmap(this.selectedYear, this.selectedSurplusType, this.selectedMonth);
        };

        if (surplusYear) surplusYear.addEventListener('change', updateSurplusHeatmap);
        if (surplusType) surplusType.addEventListener('change', updateSurplusHeatmap);
        if (surplusMonth) surplusMonth.addEventListener('change', updateSurplusHeatmap);

        // Back button
        const backBtn = document.getElementById('back-to-armenia-analysis');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('armenia-market-intelligence').style.display = 'none';
                document.getElementById('armenia-focus').style.display = 'block';
            });
        }
    }

    async createMCPChart(date) {
        const canvas = document.getElementById('aex-mcp-chart');
        if (!canvas) {
            console.warn('MCP chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');

        try {
            // Parse date and load data
            const year = new Date(date).getFullYear();
            const mcpData = await dataLoader.loadAEXMCPData(year);

            if (!mcpData || !mcpData[date]) {
                console.error('No MCP data for date:', date);
                alert(`No data available for ${date}`);
                return;
            }

            const dayData = mcpData[date];
            const parsedData = dataLoader.parseAEXTable(dayData, [
                'MCP (AMD/kWh)',
                'Total Cleared Quantity',
                'Bid Quantity (kWh)',
                'Offer Quantity (kWh)'
            ]);

            if (!parsedData) {
                console.error('Failed to parse MCP data');
                return;
            }

            const labels = parsedData.map(d => `${String(d.hour).padStart(2, '0')}:00`);

            // Destroy existing chart
            if (this.mcpChart) {
                this.mcpChart.destroy();
            }

            // Create new chart
            this.mcpChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            type: 'line',
                            label: 'MCP (AMD/kWh)',
                            data: parsedData.map(d => d['MCP (AMD/kWh)']),
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            yAxisID: 'y-price',
                            order: 1,
                            tension: 0.3,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            type: 'bar',
                            label: 'Bid Quantity (kWh)',
                            data: parsedData.map(d => d['Bid Quantity (kWh)']),
                            backgroundColor: 'rgba(52, 152, 219, 0.6)',
                            yAxisID: 'y-volume',
                            order: 2
                        },
                        {
                            type: 'bar',
                            label: 'Offer Quantity (kWh)',
                            data: parsedData.map(d => d['Offer Quantity (kWh)']),
                            backgroundColor: 'rgba(46, 204, 113, 0.6)',
                            yAxisID: 'y-volume',
                            order: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: (this.isMobile && window.matchMedia('(orientation: portrait)').matches) ? 1 : (this.isMobile ? 2 : 3),
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        'y-price': {
                            type: 'linear',
                            position: 'left',
                            title: {
                                display: !this.isVerySmall,
                                text: 'Price (AMD/kWh)',
                                font: { weight: 'bold', size: this.isMobile ? 10 : 12 }
                            },
                            ticks: {
                                font: { size: this.isMobile ? 9 : 11 }
                            },
                            grid: {
                                drawOnChartArea: true
                            }
                        },
                        'y-volume': {
                            type: 'linear',
                            position: 'right',
                            title: {
                                display: !this.isVerySmall,
                                text: 'Volume (kWh)',
                                font: { weight: 'bold', size: this.isMobile ? 10 : 12 }
                            },
                            ticks: {
                                font: { size: this.isMobile ? 9 : 11 },
                                callback: function(value) {
                                    // Shorten large numbers on mobile
                                    if (window.innerWidth <= 480) {
                                        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                                    }
                                    return value;
                                }
                            },
                            grid: {
                                drawOnChartArea: false
                            }
                        },
                        x: {
                            title: {
                                display: !this.isVerySmall,
                                text: 'Hour (UTC+4)',
                                font: { weight: 'bold', size: this.isMobile ? 10 : 12 }
                            },
                            ticks: {
                                font: { size: this.isMobile ? 9 : 11 },
                                maxRotation: this.isMobile ? 45 : 0,
                                minRotation: this.isMobile ? 45 : 0
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            enabled: true,
                            titleFont: { size: this.isMobile ? 11 : 13 },
                            bodyFont: { size: this.isMobile ? 10 : 12 },
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    const value = context.parsed.y;
                                    if (value !== null) {
                                        label += value.toLocaleString();
                                    }
                                    return label;
                                }
                            }
                        },
                        legend: {
                            display: !this.isVerySmall,
                            position: this.isMobile ? 'bottom' : 'top',
                            labels: {
                                font: { size: this.isMobile ? 9 : 12 },
                                boxWidth: this.isMobile ? 12 : 40,
                                padding: this.isMobile ? 8 : 10
                            }
                        }
                    }
                }
            });

            console.log('✓ MCP chart created for', date);
        } catch (error) {
            console.error('Error creating MCP chart:', error);
        }
    }

    async createSurplusHeatmap(year, type, month) {
        const container = document.getElementById('aex-surplus-heatmap');
        if (!container) {
            console.warn('Surplus heatmap container not found');
            return;
        }

        try {
            // Load surplus data
            const surplusData = await dataLoader.loadAEXSurplusData(year);

            if (!surplusData) {
                console.error('No surplus data for year:', year);
                return;
            }

            // Extract column name based on type
            const columnName = type === 'bid' ? 'DAM Surplus Bid' : 'DAM Surplus Offer';

            // Collect all data points (with implicit zeros)
            const heatmapData = [];
            const companiesSet = new Set();

            Object.keys(surplusData).forEach(date => {
                // Filter by month if not 'all'
                if (month !== 'all') {
                    const dateMonth = new Date(date).getMonth() + 1;
                    if (dateMonth !== parseInt(month)) {
                        return;
                    }
                }

                const dayData = surplusData[date];
                if (!dayData || !dayData.tables || !dayData.tables[0]) {
                    return;
                }

                const table = dayData.tables[0];

                // Parse hierarchical data: Company → Supplier → Hour
                table.rowGrouping.forEach(row => {
                    if (row.rowCategories.length >= 3) {
                        const company = row.rowCategories[0].name;
                        const hour = parseInt(row.rowCategories[2].name.match(/(\d{2}):/)?.[1] || 0);

                        companiesSet.add(company);

                        // Get column index for our metric
                        const colIndex = table.columnGrouping.values.findIndex(col => col.name === columnName);
                        const value = (colIndex >= 0 && row.values[colIndex] !== null) ? row.values[colIndex] : 0;

                        heatmapData.push({
                            date,
                            hour,
                            company,
                            value: value || 0 // Handle implicit zeros
                        });
                    }
                });
            });

            // Sort companies by total activity and take top 20
            const companyTotals = new Map();
            heatmapData.forEach(d => {
                const current = companyTotals.get(d.company) || 0;
                companyTotals.set(d.company, current + Math.abs(d.value));
            });

            // Adjust number of companies based on screen size
            const maxCompanies = this.isVerySmall ? 10 : (this.isMobile ? 15 : 20);

            const companies = Array.from(companiesSet)
                .sort((a, b) => (companyTotals.get(b) || 0) - (companyTotals.get(a) || 0))
                .slice(0, maxCompanies); // Top companies (adaptive)

            const hours = Array.from({length: 24}, (_, i) => i);

            // Aggregate by hour and company (average across dates)
            const aggregatedMap = new Map();
            heatmapData.forEach(d => {
                if (companies.includes(d.company)) {
                    const key = `${d.hour}-${d.company}`;
                    if (!aggregatedMap.has(key)) {
                        aggregatedMap.set(key, []);
                    }
                    aggregatedMap.get(key).push(d.value);
                }
            });

            // Calculate averages
            const cellData = [];
            hours.forEach(hour => {
                companies.forEach(company => {
                    const key = `${hour}-${company}`;
                    const values = aggregatedMap.get(key) || [0]; // Implicit zero if no data
                    const avgValue = d3.mean(values);
                    cellData.push({hour, company, value: avgValue});
                });
            });

            // Clear existing SVG
            d3.select('#aex-surplus-heatmap').selectAll('*').remove();

            // Responsive dimensions for different screen sizes
            const isMobile = this.isMobile;
            const isVerySmall = this.isVerySmall;

            const margin = isVerySmall
                ? {top: 60, right: 80, bottom: 40, left: 120}
                : (isMobile ? {top: 80, right: 100, bottom: 50, left: 180} : {top: 100, right: 150, bottom: 60, left: 250});

            const cellWidth = isVerySmall ? 25 : (isMobile ? 30 : 35);
            const cellHeight = isVerySmall ? 15 : (isMobile ? 18 : 20);
            const width = 24 * cellWidth; // 24 hours
            const height = companies.length * cellHeight; // companies

            const svg = d3.select('#aex-surplus-heatmap')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Scales - X axis = hours, Y axis = companies
            const xScale = d3.scaleBand()
                .domain(hours)
                .range([0, width])
                .padding(0.05);

            const yScale = d3.scaleBand()
                .domain(companies)
                .range([0, height])
                .padding(0.05);

            // Color scale with logarithmic scaling for wide value range
            // This ensures values like 1 and 192 get different colors despite max=30000
            const maxValue = d3.max(cellData, d => Math.abs(d.value)) || 1;
            const minValue = d3.min(cellData.filter(d => d.value > 0), d => Math.abs(d.value)) || 0.1;

            // Logarithmic scale for better distinction across wide range
            const logScale = d3.scaleLog()
                .domain([Math.max(minValue, 0.1), maxValue])
                .range([0, 1])
                .clamp(true);

            // Detailed 11-color sequential palette
            const colorInterpolator = d3.piecewise(d3.interpolateRgb.gamma(2.2), [
                '#e0f3ff',  // Very light blue (0% - lowest)
                '#b3d9ff',  // Light blue (10%)
                '#80bfff',  // Sky blue (20%)
                '#4da6ff',  // Blue (30%)
                '#1a8cff',  // Bright blue (40%)
                '#00d4aa',  // Cyan-teal (50% - middle)
                '#66dd00',  // Lime green (60%)
                '#ffdd00',  // Yellow (70%)
                '#ffaa00',  // Orange (80%)
                '#ff7700',  // Dark orange (90%)
                '#ff3300'   // Red (100% - highest)
            ]);

            const getColor = (value) => {
                if (value <= 0) return '#f5f5f5'; // Very light gray for zero
                const normalized = logScale(value);
                return colorInterpolator(normalized);
            };

            // Draw cells - X = hour, Y = company
            svg.selectAll('rect')
                .data(cellData)
                .enter()
                .append('rect')
                .attr('class', 'heatmap-cell')
                .attr('x', d => xScale(d.hour))
                .attr('y', d => yScale(d.company))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', d => getColor(Math.abs(d.value)))
                .attr('stroke', '#ddd')
                .attr('stroke-width', 0.5)
                .attr('data-hour', d => d.hour)
                .attr('data-company', d => d.company)
                .style('cursor', 'pointer')
                .on('mouseover', function(event, d) {
                    // Highlight row and column
                    svg.selectAll('.heatmap-cell')
                        .style('opacity', cell => {
                            return (cell.hour === d.hour || cell.company === d.company) ? 1 : 0.3;
                        })
                        .attr('stroke', cell => {
                            return (cell.hour === d.hour || cell.company === d.company) ? '#333' : '#ddd';
                        })
                        .attr('stroke-width', cell => {
                            return (cell.hour === d.hour || cell.company === d.company) ? 1.5 : 0.5;
                        });

                    // Highlight current cell even more
                    d3.select(this)
                        .attr('stroke', '#000')
                        .attr('stroke-width', 2);

                    // Show tooltip with formatted value
                    const tooltip = document.getElementById('aex-surplus-tooltip');
                    tooltip.style.display = 'block';
                    const formattedValue = d.value >= 1000
                        ? (d.value / 1000).toFixed(2) + 'k'
                        : d.value.toFixed(2);
                    tooltip.innerHTML = `
                        <div style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 6px; margin-bottom: 6px;">
                            <strong style="color: #ffa500;">${d.company}</strong>
                        </div>
                        <div style="line-height: 1.6;">
                            <strong>Hour:</strong> ${String(d.hour).padStart(2, '0')}:00 - ${String((d.hour + 1) % 24).padStart(2, '0')}:00<br>
                            <strong>Value:</strong> <span style="color: #4fc3f7; font-size: 1.1em;">${formattedValue} kWh</span>
                        </div>
                    `;
                    tooltip.style.left = (event.pageX + 10) + 'px';
                    tooltip.style.top = (event.pageY - 28) + 'px';
                })
                .on('mouseout', () => {
                    // Reset opacity and stroke
                    svg.selectAll('.heatmap-cell')
                        .style('opacity', 1)
                        .attr('stroke', '#ddd')
                        .attr('stroke-width', 0.5);

                    // Hide tooltip
                    document.getElementById('aex-surplus-tooltip').style.display = 'none';
                });

            // Responsive font sizes
            const xAxisFontSize = isVerySmall ? '7px' : (isMobile ? '8px' : '10px');
            const yAxisFontSize = isVerySmall ? '7px' : (isMobile ? '8px' : '9px');
            const titleFontSize = isVerySmall ? '11px' : (isMobile ? '12px' : '14px');

            // X axis (hours) - at bottom
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`))
                .selectAll('text')
                .style('text-anchor', 'middle')
                .style('font-size', xAxisFontSize);

            // Y axis (companies) - at left
            const maxNameLength = isVerySmall ? 15 : (isMobile ? 25 : 35);
            svg.append('g')
                .call(d3.axisLeft(yScale))
                .selectAll('text')
                .style('font-size', yAxisFontSize)
                .text(function(d) {
                    // Truncate long company names based on screen size
                    return d.length > maxNameLength ? d.substring(0, maxNameLength) + '...' : d;
                });

            // Title
            const titleYPos = isVerySmall ? -40 : (isMobile ? -50 : -60);
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', titleYPos)
                .attr('text-anchor', 'middle')
                .style('font-size', titleFontSize)
                .style('font-weight', 'bold')
                .text(`${type === 'bid' ? 'Surplus Bid' : 'Surplus Offer'} - ${year} ${month !== 'all' ? `(M${month})` : '(Full Year)'}`);

            // X axis label
            if (!isVerySmall) {
                const xLabelFontSize = isMobile ? '9px' : '11px';
                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', height + (isMobile ? 35 : 45))
                    .attr('text-anchor', 'middle')
                    .style('font-size', xLabelFontSize)
                    .style('font-weight', 'bold')
                    .text('Hour (UTC+4)');
            }

            // Y axis label
            if (!isVerySmall) {
                const yLabelFontSize = isMobile ? '9px' : '11px';
                const yLabelPos = isVerySmall ? -100 : (isMobile ? -150 : -230);
                svg.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -height / 2)
                    .attr('y', yLabelPos)
                    .attr('text-anchor', 'middle')
                    .style('font-size', yLabelFontSize)
                    .style('font-weight', 'bold')
                    .text('Market Participants');
            }

            // Color legend - responsive size
            const legendWidth = isVerySmall ? 150 : (isMobile ? 200 : 300);
            const legendHeight = isVerySmall ? 10 : (isMobile ? 12 : 15);
            const legendYPos = isVerySmall ? -30 : (isMobile ? -35 : -40);

            const legend = svg.append('g')
                .attr('transform', `translate(${width - legendWidth - (isMobile ? 20 : 50)}, ${legendYPos})`);

            // Logarithmic scale for legend
            const legendLogScale = d3.scaleLog()
                .domain([Math.max(minValue, 0.1), maxValue])
                .range([0, legendWidth]);

            // Create gradient with logarithmic distribution
            const numSteps = 100;
            legend.selectAll('rect')
                .data(d3.range(numSteps))
                .enter()
                .append('rect')
                .attr('x', (d, i) => (i * legendWidth) / numSteps)
                .attr('y', 0)
                .attr('width', legendWidth / numSteps + 1)
                .attr('height', legendHeight)
                .attr('fill', d => {
                    const value = legendLogScale.invert((d * legendWidth) / numSteps);
                    return getColor(value);
                })
                .attr('stroke', 'none');

            // Add border to legend
            legend.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .attr('fill', 'none')
                .attr('stroke', '#999')
                .attr('stroke-width', 1);

            // Legend axis with logarithmic ticks
            const legendAxis = d3.axisBottom(legendLogScale)
                .ticks(6, d => {
                    if (d >= 10000) return (d / 1000).toFixed(0) + 'k';
                    if (d >= 1000) return (d / 1000).toFixed(1) + 'k';
                    if (d >= 100) return d.toFixed(0);
                    if (d >= 10) return d.toFixed(0);
                    return d.toFixed(1);
                });

            const legendAxisFontSize = isVerySmall ? '7px' : (isMobile ? '8px' : '10px');
            const legendTitleFontSize = isVerySmall ? '8px' : (isMobile ? '9px' : '11px');

            legend.append('g')
                .attr('transform', `translate(0,${legendHeight})`)
                .call(legendAxis)
                .selectAll('text')
                .style('font-size', legendAxisFontSize);

            // Legend title with note about log scale
            const legendTitle = isVerySmall ? 'kWh (log)' : (isMobile ? 'Volume (kWh) - log' : 'Surplus Volume (kWh) - log scale');
            legend.append('text')
                .attr('x', legendWidth / 2)
                .attr('y', -5)
                .attr('text-anchor', 'middle')
                .style('font-size', legendTitleFontSize)
                .style('font-weight', 'bold')
                .text(legendTitle);

            console.log('✓ Surplus heatmap created');
        } catch (error) {
            console.error('Error creating surplus heatmap:', error);
        }
    }

    destroy() {
        // Destroy all Chart.js instances
        if (this.mcpChart) {
            this.mcpChart.destroy();
            this.mcpChart = null;
        }

        // Clear D3 containers
        d3.select('#aex-surplus-heatmap').selectAll('*').remove();

        // Hide container
        const container = document.getElementById('armenia-market-intelligence');
        if (container) {
            container.style.display = 'none';
        }

        this.initialized = false;
        console.log('Armenia Market Intelligence destroyed');
    }
}

// Create global instance (will be initialized by main.js)
let armeniaMarketIntelligence;
