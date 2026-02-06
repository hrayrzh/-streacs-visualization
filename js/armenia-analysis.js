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

        this.combinedChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'VRE Penetration (%)',
                        data: vreValues,
                        borderColor: CONFIG.chartColors.secondary,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: CONFIG.chartColors.secondary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
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
                        position: 'top',
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
                    title: {
                        display: true,
                        text: 'Armenia: VRE Growth vs. Market Liberalization',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const score = liberalizationScores[index];
                                const code = dataLoader.getMarketCode('Armenia', years[index]);
                                return `Market: ${HELPERS.getMarketLabel(code)} (Score: ${score})`;
                            }
                        }
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
                            color: CONFIG.chartColors.secondary,
                            font: { weight: 'bold' }
                        },
                        grid: {
                            color: CONFIG.chartColors.grid
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year',
                            font: { weight: 'bold' }
                        }
                    }
                }
            },
            plugins: [backgroundZonesPlugin]
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
