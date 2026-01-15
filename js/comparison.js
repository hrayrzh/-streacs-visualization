// Country Comparison Module

class ComparisonTool {
    constructor() {
        this.selectedCountries = ['Armenia'];
        this.liberalizationChart = null;
        this.vreChart = null;
        this.maxCountries = 10;
    }

    initialize() {
        this.populateCountryCheckboxes();
        this.setupEventListeners();
    }

    populateCountryCheckboxes() {
        const container = document.getElementById('country-checkboxes');
        const countries = this.getSuggestedCountries();

        let html = '';
        countries.forEach(country => {
            const checked = this.selectedCountries.includes(country) ? 'checked' : '';
            html += `
                <label class="country-checkbox">
                    <input type="checkbox" value="${country}" ${checked}
                           data-country="${country}">
                    <span>${country}</span>
                </label>
            `;
        });

        container.innerHTML = html;
    }

    getSuggestedCountries() {
        // Get all available countries from data
        const allCountries = dataLoader.getCountries();

        // Prioritize certain countries for display
        const priority = [
            'Armenia', 'Georgia',
            'Poland', 'Romania',
            'Germany', 'Spain', 'Denmark',
            'Argentina', 'Chile', 'Australia'
        ];

        // Filter priority list to only include countries that exist in data
        const available = priority.filter(c => allCountries.includes(c));

        // Add remaining countries
        const remaining = allCountries.filter(c => !available.includes(c));

        return [...available, ...remaining];
    }

    setupEventListeners() {
        const checkboxes = document.querySelectorAll('#country-checkboxes input[type="checkbox"]');
        const compareBtn = document.getElementById('compare-btn');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const country = e.target.value;

                if (e.target.checked) {
                    if (this.selectedCountries.length >= this.maxCountries) {
                        e.target.checked = false;
                        alert(`Maximum ${this.maxCountries} countries can be selected`);
                        return;
                    }
                    this.selectedCountries.push(country);
                } else {
                    this.selectedCountries = this.selectedCountries.filter(c => c !== country);
                }
            });
        });

        compareBtn.addEventListener('click', () => {
            if (this.selectedCountries.length < 2) {
                alert('Please select at least 2 countries to compare');
                return;
            }
            this.performComparison();
        });

        // Initial comparison
        this.performComparison();
    }

    performComparison() {
        this.createLiberalizationChart();
        this.createVREChart();
    }

    createLiberalizationChart() {
        const canvas = document.getElementById('comparison-liberalization');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const data = this.selectedCountries.map(country => {
            const code = dataLoader.getMarketCode(country, 2024);
            return HELPERS.getLiberalizationScore(code);
        });

        const backgroundColors = this.selectedCountries.map(country => {
            const code = dataLoader.getMarketCode(country, 2024);
            return HELPERS.getMarketColor(code);
        });

        if (this.liberalizationChart) {
            this.liberalizationChart.destroy();
        }

        this.liberalizationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.selectedCountries,
                datasets: [{
                    label: 'Liberalization Score (2024)',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(c => c.replace('0.6', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Market Liberalization Comparison (2024)',
                        font: { size: 14, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const country = context.label;
                                const code = dataLoader.getMarketCode(country, 2024);
                                return `Code: ${code}\n${HELPERS.getMarketLabel(code)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Liberalization Score (1-9)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Country'
                        }
                    }
                }
            }
        });
    }

    createVREChart() {
        const canvas = document.getElementById('comparison-vre');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const data = this.selectedCountries.map(country => {
            const vreData = dataLoader.getVREData(country, 2024, 2024);
            return vreData.length > 0 ? vreData[0]['Solar and wind - % electricity'] : 0;
        });

        if (this.vreChart) {
            this.vreChart.destroy();
        }

        this.vreChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.selectedCountries,
                datasets: [{
                    label: 'VRE Penetration (%) - 2024',
                    data: data,
                    backgroundColor: CONFIG.chartColors.secondary + '80',
                    borderColor: CONFIG.chartColors.secondary,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'VRE Penetration Comparison (2024)',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Solar & Wind Share (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Country'
                        }
                    }
                }
            }
        });
    }

    destroy() {
        if (this.liberalizationChart) {
            this.liberalizationChart.destroy();
        }
        if (this.vreChart) {
            this.vreChart.destroy();
        }
    }
}

// Create global instance
let comparisonTool;
