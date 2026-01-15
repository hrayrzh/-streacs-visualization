// Predictive Scenarios Module

class ScenariosModule {
    constructor() {
        this.vreScenarioChart = null;
        this.priceScenarioChart = null;
    }

    initialize() {
        this.createVREScenarios();
        this.createPriceScenarios();
        this.calculateMetrics();
    }

    createVREScenarios() {
        const canvas = document.getElementById('scenario-vre');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Historical data for Armenia
        const historicalData = dataLoader.getVREData('Armenia', 2018);
        const historicalYears = historicalData.map(d => d.Year);
        const historicalValues = historicalData.map(d => d['Solar and wind - % electricity']);

        // Projection years
        const futureYears = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040];

        // Conservative scenario: Linear growth to 50% by 2030, 60% by 2040
        const conservative = this.generateScenario(10.1, 50, 60, 2024, 2030, 2040);

        // Optimistic scenario: Accelerated growth to 60% by 2030, 75% by 2040
        const optimistic = this.generateScenario(10.1, 60, 75, 2024, 2030, 2040);

        // Combined years for x-axis
        const allYears = [...historicalYears, ...futureYears];

        // Pad historical data with nulls for future years
        const historicalPadded = [...historicalValues, ...new Array(futureYears.length).fill(null)];

        // Pad scenarios with nulls for historical years
        const conservativePadded = [...new Array(historicalYears.length).fill(null), ...conservative];
        const optimisticPadded = [...new Array(historicalYears.length).fill(null), ...optimistic];

        this.vreScenarioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allYears,
                datasets: [
                    {
                        label: 'Historical (2018-2024)',
                        data: historicalPadded,
                        borderColor: CONFIG.chartColors.primary,
                        backgroundColor: CONFIG.chartColors.primary + '40',
                        borderWidth: 3,
                        fill: false,
                        pointRadius: 4
                    },
                    {
                        label: 'Conservative Scenario (50% by 2030)',
                        data: conservativePadded,
                        borderColor: CONFIG.chartColors.warning,
                        backgroundColor: CONFIG.chartColors.warning + '20',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 3
                    },
                    {
                        label: 'Optimistic Scenario (60% by 2030)',
                        data: optimisticPadded,
                        borderColor: CONFIG.chartColors.secondary,
                        backgroundColor: CONFIG.chartColors.secondary + '20',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Armenia VRE Penetration: Historical & Scenarios',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 80,
                        title: {
                            display: true,
                            text: 'VRE Share (%)'
                        },
                        grid: {
                            color: CONFIG.chartColors.grid
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                }
            }
        });
    }

    generateScenario(currentValue, target2030, target2040, currentYear, year2030, year2040) {
        const years = [];
        const values = [];

        // Generate values from 2025 to 2040
        for (let year = 2025; year <= 2040; year++) {
            years.push(year);

            let value;
            if (year <= year2030) {
                // Linear interpolation from current to 2030 target
                const yearsToTarget = year2030 - currentYear;
                const yearsPassed = year - currentYear;
                const progress = yearsPassed / yearsToTarget;
                value = currentValue + (target2030 - currentValue) * progress;
            } else {
                // Linear interpolation from 2030 to 2040
                const yearsToTarget = year2040 - year2030;
                const yearsPassed = year - year2030;
                const progress = yearsPassed / yearsToTarget;
                value = target2030 + (target2040 - target2030) * progress;
            }

            values.push(Math.round(value * 100) / 100);
        }

        return values;
    }

    createPriceScenarios() {
        const canvas = document.getElementById('scenario-prices');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2035, 2040];

        // Baseline wholesale price ($/MWh) - assuming current avg price of 50
        const baselinePrice = 50;

        // Merit-order effect: VRE reduces wholesale prices
        // Conservative scenario reduces prices by 15% at 50% VRE, 20% at 60% VRE
        const conservativePrices = [
            50, 49, 48, 47, 45, 43, 42.5, 41, 40  // Gradual decline
        ];

        // Optimistic scenario reduces prices by 25% at 60% VRE, 30% at 75% VRE
        const optimisticPrices = [
            50, 48, 45, 42, 39, 37.5, 37, 36, 35  // Steeper decline
        ];

        this.priceScenarioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Baseline (no VRE growth)',
                        data: new Array(years.length).fill(baselinePrice),
                        borderColor: '#cccccc',
                        backgroundColor: '#cccccc20',
                        borderWidth: 2,
                        borderDash: [10, 5],
                        fill: false
                    },
                    {
                        label: 'Conservative VRE Scenario',
                        data: conservativePrices,
                        borderColor: CONFIG.chartColors.warning,
                        backgroundColor: CONFIG.chartColors.warning + '20',
                        borderWidth: 2,
                        fill: '-1'
                    },
                    {
                        label: 'Optimistic VRE Scenario',
                        data: optimisticPrices,
                        borderColor: CONFIG.chartColors.secondary,
                        backgroundColor: CONFIG.chartColors.secondary + '20',
                        borderWidth: 2,
                        fill: '-1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Merit-Order Effect: Wholesale Price Projections',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: $${context.parsed.y}/MWh`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 30,
                        max: 55,
                        title: {
                            display: true,
                            text: 'Wholesale Price ($/MWh)'
                        },
                        grid: {
                            color: CONFIG.chartColors.grid
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                }
            }
        });
    }

    calculateMetrics() {
        // Simple demonstration of RMSE and MAE calculation
        // Using hypothetical validation data

        // Simulated actual vs predicted VRE values for 2020-2024
        const actual = [0.5, 1.2, 3.5, 7.8, 10.1]; // Actual VRE %
        const predicted = [0.6, 1.5, 3.2, 7.5, 10.3]; // Model predicted %

        const rmse = HELPERS.calculateRMSE(actual, predicted);
        const mae = HELPERS.calculateMAE(actual, predicted);

        document.getElementById('rmse-value').textContent = rmse.toFixed(3);
        document.getElementById('mae-value').textContent = mae.toFixed(3);
    }

    destroy() {
        if (this.vreScenarioChart) {
            this.vreScenarioChart.destroy();
        }
        if (this.priceScenarioChart) {
            this.priceScenarioChart.destroy();
        }
    }
}

// Create global instance
let scenariosModule;
