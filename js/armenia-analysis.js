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

        const yearCodes = years.map(year => dataLoader.getMarketCode('Armenia', year));
        const liberalizationScores = yearCodes.map(code => HELPERS.getLiberalizationScore(code));

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

                                // Add unique market codes for Armenia
                                const seen = new Set();
                                yearCodes.forEach(code => {
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
                    title: {
                        display: true,
                        text: 'Armenia: VRE Growth vs. Market Liberalization',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
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
