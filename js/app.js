// Main Application Controller
class SESPortalApp {
    constructor() {
        this.authManager = null;
        this.searchManager = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('🚀 SES Portal initializing...');
        
        // Initialize managers
        this.authManager = new AuthManager();
        this.searchManager = new SESSearchManager(this.authManager);
        
        // Setup global event listeners
        this.setupGlobalEvents();
        
        console.log('✅ SES Portal initialized successfully');
    }

    setupGlobalEvents() {
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('email-input');
                if (searchInput && !searchInput.disabled) {
                    searchInput.focus();
                }
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleTabFocus();
            }
        });
    }

    clearSearch() {
        const emailInput = document.getElementById('email-input');
        const resultsContainer = document.getElementById('results-container');
        const regionStatus = document.getElementById('region-status');
        
        if (emailInput) emailInput.value = '';
        if (resultsContainer) resultsContainer.style.display = 'none';
        if (regionStatus) regionStatus.style.display = 'none';
    }

    handleResize() {
        // Handle responsive adjustments if needed
        console.log('Window resized');
    }

    handleTabFocus() {
        // Refresh data if needed when user returns to tab
        console.log('Tab focused');
    }
}

// Initialize the application
const app = new SESPortalApp();

// Make app globally available for debugging
window.SESPortal = app;
