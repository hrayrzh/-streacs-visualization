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

        this.vreChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Solar & Wind (% of electricity)',
                    data: values,
                    borderColor: CONFIG.chartColors.primary,
                    backgroundColor: CONFIG.chartColors.primary + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
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
            }
        });
    }
}

// Create global instance
let countryModal;
