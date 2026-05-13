/**
 * Loading Overlay Utility
 * Provides show() and hide() methods to manage a global loading overlay.
 */
(function(window) {
    const LoadingOverlay = {
        element: null,
        textElement: null,

        /**
         * Initialize the overlay by adding it to the DOM
         */
        init() {
            if (this.element) return;

            const overlay = document.createElement('div');
            overlay.id = 'global-loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text" id="loading-overlay-text">Loading...</div>
                </div>
            `;

            document.body.appendChild(overlay);
            this.element = overlay;
            this.textElement = document.getElementById('loading-overlay-text');
        },

        /**
         * Show the loading overlay
         * @param {string} text - Optional text to display below the spinner
         */
        show(text = 'Please wait...') {
            if (!this.element) this.init();
            
            if (text) {
                this.textElement.textContent = text;
            }
            
            this.element.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        },

        /**
         * Hide the loading overlay
         */
        hide() {
            if (!this.element) return;
            
            this.element.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    };

    // Expose to global scope
    window.LoadingOverlay = LoadingOverlay;

    // Load CSS dynamically if not already loaded
    if (!document.querySelector('link[href*="loading-overlay.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/storefront/css/loading-overlay.css';
        document.head.appendChild(link);
    }

})(window);
