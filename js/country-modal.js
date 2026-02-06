// Country Profile Modal Module

class CountryModal {
    constructor() {
        this.modal = document.getElementById('country-modal');
        this.closeBtn = this.modal.querySelector('.close-btn');
        this.currentCountry = null;
        this.vreChart = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.hide());

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.classList.contains('active')) {
                this.hide();
            }
        });
    }

    show(countryName) {
        this.currentCountry = countryName;

        // Show modal FIRST
        this.modal.classList.remove('hidden');
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load data after modal is visible (300ms delay for CSS transition)
        setTimeout(() => {
            this.loadCountryData(countryName);
        }, 300);
    }

    hide() {
        this.modal.classList.remove('active');
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';

        if (this.vreChart) {
            this.vreChart.destroy();
            this.vreChart = null;
        }
    }

    loadCountryData(countryName) {
        document.getElementById('country-name').textContent = countryName;

        // Load market evolution
        this.displayMarketEvolution(countryName);

        // Load regulator info
        this.displayRegulatorInfo(countryName);

        // Load unbundling info
        this.displayUnbundlingInfo(countryName);

        // Load IPP info
        this.displayIPPInfo(countryName);

        // Load VRE chart
        this.displayVREChart(countryName);
    }

    displayMarketEvolution(countryName) {
        const container = document.getElementById('market-evolution');
        const countryData = dataLoader.data.marketStructure?.[countryName];

        if (!countryData) {
            container.innerHTML = '<p>No market structure data available</p>';
            return;
        }

        const years = countryData.years;
        const keyChanges = [];

        let prevCode = null;
        Object.entries(years).forEach(([year, code]) => {
            if (code !== prevCode) {
                keyChanges.push({
                    year: year,
                    code: code,
                    label: HELPERS.getMarketLabel(code)
                });
                prevCode = code;
            }
        });

        let html = '<div class="market-evolution-timeline">';
        keyChanges.forEach(change => {
            html += `
                <div class="evolution-item">
                    <strong>${change.year}:</strong>
                    <span class="market-code" style="background-color: ${HELPERS.getMarketColor(change.code)}; padding: 2px 8px; border-radius: 3px;">
                        ${change.code}
                    </span>
                    ${change.label}
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    displayRegulatorInfo(countryName) {
        const container = document.getElementById('regulator-info');
        const regulatorData = dataLoader.data.regulators?.[countryName];

        if (!regulatorData || regulatorData.yearEstablished === 'None') {
            container.innerHTML = '<p>No independent regulator</p>';
            return;
        }

        const html = `
            <p><strong>Name:</strong> ${regulatorData.name || 'N/A'}</p>
            <p><strong>Established:</strong> ${regulatorData.yearEstablished || 'N/A'}</p>
            ${regulatorData.website ? `<p><strong>Website:</strong> <a href="${regulatorData.website}" target="_blank">${regulatorData.website}</a></p>` : ''}
            ${regulatorData.notes ? `<p class="notes">${regulatorData.notes}</p>` : ''}
        `;

        container.innerHTML = html;
    }

    displayUnbundlingInfo(countryName) {
        const container = document.getElementById('unbundling-info');

        // For now, display generic info for known countries
        const unbundlingInfo = {
            'Armenia': {
                transmission: 'ISO Model since 2002',
                distribution: 'Separated',
                notes: 'Independent System Operator model - ownership remains but operation is independent'
            },
            'Germany': {
                transmission: 'Ownership Unbundling',
                distribution: 'Ownership Unbundling',
                notes: 'Full separation of transmission and distribution from generation'
            },
            'Argentina': {
                transmission: 'Ownership Unbundling since 1992',
                distribution: 'Ownership Unbundling',
                notes: 'Complete separation during privatization in early 1990s'
            }
        };

        const data = unbundlingInfo[countryName];

        if (!data) {
            container.innerHTML = '<p>No unbundling data available</p>';
            return;
        }

        const html = `
            <p><strong>Transmission:</strong> ${data.transmission}</p>
            <p><strong>Distribution:</strong> ${data.distribution}</p>
            ${data.notes ? `<p class="notes">${data.notes}</p>` : ''}
        `;

        container.innerHTML = html;
    }

    displayIPPInfo(countryName) {
        const container = document.getElementById('ipp-info');
        const ippData = dataLoader.data.ipp?.[countryName];

        if (!ippData) {
            container.innerHTML = '<p>No IPP data available</p>';
            return;
        }

        const html = `
            <p><strong>First IPP (any):</strong> ${ippData.yearFirstIPP || 'N/A'}</p>
            <p><strong>First Private IPP:</strong> ${ippData.yearFirstPrivateIPP || 'N/A'}</p>
            <p><strong>Type:</strong> ${HELPERS.getIPPType(ippData.typeOperational)}</p>
            ${ippData.notes ? `<p class="notes">${ippData.notes}</p>` : ''}
        `;

        container.innerHTML = html;
    }

    displayVREChart(countryName) {
        const canvas = document.getElementById('vre-chart');

        if (!canvas) {
            console.warn('VRE chart canvas not found');
            return;
        }

        // Destroy previous chart if exists
        if (this.vreChart) {
            this.vreChart.destroy();
            this.vreChart = null;
        }

        const vreData = dataLoader.getVREData(countryName);

        if (!vreData || vreData.length === 0) {
            // Hide canvas and show message instead of destroying canvas
            canvas.style.display = 'none';
            let message = canvas.parentElement.querySelector('.no-vre-message');
            if (!message) {
                message = document.createElement('p');
                message.className = 'no-vre-message';
                message.textContent = 'No VRE data available for this country';
                canvas.parentElement.appendChild(message);
            }
            message.style.display = 'block';
            return;
        }

        // Show canvas and hide message
        canvas.style.display = 'block';
        const message = canvas.parentElement.querySelector('.no-vre-message');
        if (message) {
            message.style.display = 'none';
        }

        const ctx = canvas.getContext('2d');

        const years = vreData.map(d => d.Year);
        const values = vreData.map(d => d['Solar and wind - % electricity']);

        // Get liberalization scores for each year
        const liberalizationScores = years.map(year => {
            const code = dataLoader.getMarketCode(countryName, year);
            return HELPERS.getLiberalizationScore(code);
        });

        // Helper function to get color based on score
        const getLibScoreColor = (score) => {
            if (score <= 2) {
                return 'rgba(215, 48, 39, 0.25)'; // Red - Low liberalization
            } else if (score <= 4) {
                return 'rgba(255, 193, 7, 0.35)'; // Orange/Yellow - Medium
            } else if (score <= 7) {
                return 'rgba(33, 150, 243, 0.25)'; // Light Blue - High
            } else {
                return 'rgba(13, 71, 161, 0.30)'; // Dark Blue - Full
            }
        };

        // Custom plugin to draw background zones
        const backgroundZonesPlugin = {
            id: 'liberalizationBackground',
            beforeDraw: (chart, args, options) => {
                const {ctx, chartArea, scales} = chart;

                if (!chartArea || !scales.x || !scales.y) return;

                ctx.save();

                // Draw background zones for each year
                years.forEach((year, index) => {
                    const score = liberalizationScores[index];
                    const color = getLibScoreColor(score);

                    // Get x positions for this year zone
                    const xStart = scales.x.getPixelForValue(index);
                    const xEnd = index < years.length - 1
                        ? scales.x.getPixelForValue(index + 1)
                        : chartArea.right;

                    // Draw rectangle
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        xStart,
                        chartArea.top,
                        xEnd - xStart,
                        chartArea.bottom - chartArea.top
                    );
                });

                ctx.restore();
            }
        };

        this.vreChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Solar & Wind (% of electricity)',
                    data: values,
                    borderColor: CONFIG.chartColors.secondary,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: CONFIG.chartColors.secondary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            generateLabels: function(chart) {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);

                                // Add custom legend items for background liberalization levels
                                original.push(
                                    {
                                        text: 'Market Liberalization (background):',
                                        fillStyle: 'transparent',
                                        strokeStyle: 'transparent',
                                        fontColor: '#666',
                                        lineWidth: 0
                                    },
                                    {
                                        text: 'Low (1-2)',
                                        fillStyle: 'rgba(215, 48, 39, 0.5)',
                                        strokeStyle: 'rgba(215, 48, 39, 1)',
                                        lineWidth: 1
                                    },
                                    {
                                        text: 'Medium (3-4)',
                                        fillStyle: 'rgba(255, 193, 7, 0.6)',
                                        strokeStyle: 'rgba(255, 193, 7, 1)',
                                        lineWidth: 1
                                    },
                                    {
                                        text: 'High (5-7)',
                                        fillStyle: 'rgba(33, 150, 243, 0.5)',
                                        strokeStyle: 'rgba(33, 150, 243, 1)',
                                        lineWidth: 1
                                    },
                                    {
                                        text: 'Full (8-9)',
                                        fillStyle: 'rgba(13, 71, 161, 0.6)',
                                        strokeStyle: 'rgba(13, 71, 161, 1)',
                                        lineWidth: 1
                                    }
                                );

                                return original;
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const score = liberalizationScores[index];
                                const code = dataLoader.getMarketCode(countryName, years[index]);
                                return `Market: ${HELPERS.getMarketLabel(code)} (Score: ${score})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Percentage (%)',
                            font: { weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year',
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            autoSkip: true,
                            maxRotation: 45,
                            minRotation: 45,
                            callback: function(value, index, values) {
                                const year = this.getLabelForValue(value);
                                // Show every 5th year
                                if (year % 5 === 0) {
                                    return year;
                                }
                                return null;
                            }
                        }
                    }
                }
            },
            plugins: [backgroundZonesPlugin]
        });
    }
}

// Create global instance
let countryModal;
