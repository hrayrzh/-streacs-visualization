// Armenia Case Study Module

class ArmeniaAnalysis {
    constructor() {
        this.vreChart = null;
        this.combinedChart = null;
    }

    initialize() {
        this.createVREChart();
        this.createTimeline();
        this.createCombinedChart();
    }

    createVREChart() {
        const canvas = document.getElementById('armenia-vre-chart');
        if (!canvas) {
            console.warn('Armenia VRE chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        const vreData = dataLoader.getVREData('Armenia', 2015);

        if (!vreData || vreData.length === 0) {
            console.warn('No VRE data for Armenia');
            return;
        }

        const years = vreData.map(d => d.Year);
        const values = vreData.map(d => d['Solar and wind - % electricity']);

        this.vreChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Solar & Wind Penetration (%)',
                    data: values,
                    borderColor: CONFIG.chartColors.secondary,
                    backgroundColor: CONFIG.chartColors.secondary + '40',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
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
                        text: 'Armenia: Rapid VRE Growth (2015-2024)',
                        font: { size: 16, weight: 'bold' }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 0.07,
                                yMax: 0.07,
                                borderColor: 'red',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    display: true,
                                    content: '2018: 0.07%',
                                    position: 'end'
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12,
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

    createTimeline() {
        const container = document.getElementById('armenia-timeline');

        let html = '<div class="armenia-milestones">';

        CONFIG.armeniaMilestones.forEach(milestone => {
            html += `
                <div class="timeline-event">
                    <div class="timeline-year">${milestone.year}</div>
                    <div class="timeline-description">${milestone.event}</div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    createCombinedChart() {
        const canvas = document.getElementById('armenia-combined-chart');
        if (!canvas) {
            console.warn('Armenia combined chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        const vreData = dataLoader.getVREData('Armenia', 2000);

        if (!vreData || vreData.length === 0) {
            console.warn('No VRE data for Armenia');
            return;
        }

        const years = vreData.map(d => d.Year);
        const vreValues = vreData.map(d => d['Solar and wind - % electricity']);

        // Create liberalization score for each year
        const liberalizationScores = years.map(year => {
            const code = dataLoader.getMarketCode('Armenia', year);
            return HELPERS.getLiberalizationScore(code);
        });

        this.combinedChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'VRE Penetration (%)',
                        data: vreValues,
                        borderColor: CONFIG.chartColors.secondary,
                        backgroundColor: CONFIG.chartColors.secondary + '20',
                        borderWidth: 2,
                        fill: true,
                        yAxisID: 'y',
                        tension: 0.3
                    },
                    {
                        label: 'Market Liberalization Score',
                        data: liberalizationScores,
                        borderColor: CONFIG.chartColors.accent,
                        backgroundColor: CONFIG.chartColors.accent + '20',
                        borderWidth: 2,
                        fill: false,
                        yAxisID: 'y1',
                        tension: 0.1,
                        stepped: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Armenia: VRE Growth vs. Market Liberalization',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'VRE Share (%)',
                            color: CONFIG.chartColors.secondary
                        },
                        grid: {
                            color: CONFIG.chartColors.grid
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Liberalization Score (1-9)',
                            color: CONFIG.chartColors.accent
                        },
                        grid: {
                            drawOnChartArea: false
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

    destroy() {
        if (this.vreChart) {
            this.vreChart.destroy();
        }
        if (this.combinedChart) {
            this.combinedChart.destroy();
        }
    }
}

// Create global instance
let armeniaAnalysis;
