// Main Application Entry Point

class STREACSApp {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log('Initializing STREACS Application...');

            // Load all data
            await dataLoader.loadAll();
            console.log('✓ Data loaded');

            // Initialize global module instances
            window.countryModal = new CountryModal();
            console.log('✓ Country modal initialized');

            window.worldMap = new WorldMap('world-map');
            await window.worldMap.initialize();
            console.log('✓ World map initialized');

            window.armeniaAnalysis = new ArmeniaAnalysis();
            window.armeniaAnalysis.initialize();
            console.log('✓ Armenia analysis initialized');

            window.comparisonTool = new ComparisonTool();
            window.comparisonTool.initialize();
            console.log('✓ Comparison tool initialized');

            window.scenariosModule = new ScenariosModule();
            window.scenariosModule.initialize();
            console.log('✓ Scenarios module initialized');

            this.initialized = true;
            console.log('✓ STREACS Application ready!');

            // Add welcome message
            this.showWelcome();

        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError(error);
        }
    }

    showLoading() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            const content = panel.innerHTML;
            panel.dataset.originalContent = content;
            panel.innerHTML = '<div class="loading">Loading data</div>';
        });
    }

    hideLoading() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            if (panel.dataset.originalContent) {
                panel.innerHTML = panel.dataset.originalContent;
                delete panel.dataset.originalContent;
            }
        });
    }

    showError(error) {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.innerHTML = `
                <div class="error" style="color: #e74c3c; padding: 20px; text-align: center;">
                    <h3>Error Loading Application</h3>
                    <p>${error.message}</p>
                    <p>Please check the browser console for details.</p>
                </div>
            `;
        });
    }

    showWelcome() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              STREACS PROJECT - Web Application               ║
║                                                              ║
║   Global Power Market Liberalization & VRE Integration      ║
║                                                              ║
║   Features:                                                  ║
║   • Interactive world map (1989-2024)                        ║
║   • Country profiles with detailed analysis                  ║
║   • Armenia case study                                       ║
║   • Multi-country comparison tool                            ║
║   • Predictive scenarios (2030-2040)                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        `);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new STREACSApp();
    app.initialize().catch(error => {
        console.error('Fatal error:', error);
    });
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize map on significant resize
        if (window.worldMap && window.innerWidth) {
            console.log('Window resized, map may need adjustment');
        }
    }, 250);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Escape key closes modal
    if (event.key === 'Escape' && window.countryModal) {
        window.countryModal.hide();
    }

    // Space bar toggles play/pause on timeline
    if (event.key === ' ' && event.target.tagName !== 'INPUT') {
        event.preventDefault();
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.click();
        }
    }
});

console.log('STREACS main.js loaded - waiting for DOM...');
