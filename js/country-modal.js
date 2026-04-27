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

        // Load liberalization info
        this.displayLiberalizationInfo(countryName);

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
        const isPrimary = window.worldMap?.dataMode === 'primary';
        const countryData = isPrimary
            ? dataLoader.data.marketStructurePrimary?.[countryName]
            : dataLoader.data.marketStructure?.[countryName];

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

    displayLiberalizationInfo(countryName) {
        const container = document.getElementById('liberalization-info');
        const libYear = dataLoader.getLiberalizationYear(countryName);

        if (!libYear) {
            container.innerHTML = '<p>No liberalization data recorded for this country</p>';
            return;
        }

        const vreAtLib = dataLoader.getVREData(countryName)
            .find(d => d.Year === libYear);
        const vrePct = vreAtLib
            ? vreAtLib['Solar and wind - % electricity'].toFixed(1) + '%'
            : 'No data';

        const colorMap = { 1988:0, 1990:0, 1995:1, 2000:2, 2005:3, 2010:4, 2015:5, 9999:6 };
        const colors = ['#053061','#2166ac','#4393c3','#74add1','#f4a442','#f46d43','#d73027'];
        let idx = 6;
        if (libYear <= 1990) idx = 0;
        else if (libYear <= 1995) idx = 1;
        else if (libYear <= 2000) idx = 2;
        else if (libYear <= 2005) idx = 3;
        else if (libYear <= 2010) idx = 4;
        else if (libYear <= 2015) idx = 5;
        const badgeColor = colors[idx];

        container.innerHTML = `
            <div class="lib-info">
                <div class="lib-info__badge" style="background:${badgeColor}">
                    ${libYear}
                </div>
                <div class="lib-info__details">
                    <p><strong>Year of liberalization:</strong> ${libYear}</p>
                    <p><strong>Solar &amp; Wind share at liberalization:</strong> ${vrePct}</p>
                </div>
            </div>
        `;
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
            container.closest('.detail-section').style.display = 'none';
            return;
        }
        container.closest('.detail-section').style.display = '';

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
        const isPrimary = window.worldMap?.dataMode === 'primary';
        const getCode = (year) => isPrimary
            ? dataLoader.getMarketCodePrimary(countryName, year)
            : dataLoader.getMarketCode(countryName, year);

        const yearCodes = years.map(year => getCode(year));
        const liberalizationScores = yearCodes.map(code => HELPERS.getLiberalizationScore(code));

        // Helper: hex color → rgba with opacity
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1,3), 16);
            const g = parseInt(hex.slice(3,5), 16);
            const b = parseInt(hex.slice(5,7), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        };

        // Custom plugin to draw background zones using map colors
        const backgroundZonesPlugin = {
            id: 'liberalizationBackground',
            beforeDraw: (chart, args, options) => {
                const {ctx, chartArea, scales} = chart;

                if (!chartArea || !scales.x || !scales.y) return;

                ctx.save();

                years.forEach((year, index) => {
                    const hex = HELPERS.getMarketColor(yearCodes[index]);
                    ctx.fillStyle = hexToRgba(hex, 0.35);

                    const xStart = scales.x.getPixelForValue(index);
                    const xEnd = index < years.length - 1
                        ? scales.x.getPixelForValue(index + 1)
                        : chartArea.right;

                    ctx.fillRect(xStart, chartArea.top, xEnd - xStart, chartArea.bottom - chartArea.top);
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

                                // Add unique market codes for this country
                                const seen = new Set();
                                yearCodes.forEach((code, i) => {
                                    if (!code || seen.has(code)) return;
                                    seen.add(code);
                                    const hex = HELPERS.getMarketColor(code);
                                    original.push({
                                        text: `${code}: ${HELPERS.getMarketLabel(code)}`,
                                        fillStyle: hexToRgba(hex, 0.6),
                                        strokeStyle: hex,
                                        lineWidth: 1
                                    });
                                });

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
                                const code = yearCodes[index];
                                const score = liberalizationScores[index];
                                return `Market: ${code} - ${HELPERS.getMarketLabel(code)} (Score: ${score})`;
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
