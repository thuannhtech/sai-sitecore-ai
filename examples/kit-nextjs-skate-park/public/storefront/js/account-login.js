/**
 * Account Login Module
 */
(function () {
    console.log('account-login.js initialized');
    let initialized = false;

    const init = () => {
        if (initialized) return;

        const form = document.querySelector('form[name="login"]');
        if (!form) return;

        initialized = true;
        console.log('Login form detected, attaching listener.');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Helper for premium alerts
            const showAlert = async (title, text, icon = 'error') => {
                if (typeof Swal === 'undefined') {
                    await new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                        script.onload = resolve;
                        document.head.appendChild(script);
                    });
                }
                return Swal.fire({
                    title,
                    text,
                    icon,
                    confirmButtonColor: '#000000',
                    heightAuto: false
                });
            };

            if (!data.email || !data.password) {
                showAlert('Missing Info', 'Please enter both email and password.', 'warning');
                return;
            }

            // --- 1. Password Encoding (consistent with registration) ---
            const encodedPass = btoa(data.password);
            data.password = encodedPass;

            // --- 2. UI Feedback ---
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            // Ensure LoadingOverlay is available
            if (typeof LoadingOverlay === 'undefined') {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = '/storefront/js/loading-overlay.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
            }

            LoadingOverlay.show('Signing you in...');

            try {
                // --- 3. API Call ---
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Login failed');
                }

                // --- 4. Success Handling ---
                document.cookie = `skate-park.access-token=${result.access_token}; path=/; max-age=${result.expires_in}; SameSite=Lax`;

                // Call the profile API to let the server set the user-data cookie
                LoadingOverlay.show('Loading your profile...');
                await fetch('/api/customer/me');

                // Redirect to account or home
                window.location.href = '/';

            } catch (error) {
                console.error('Login error:', error);
                LoadingOverlay.hide();
                showAlert('Login Failed', error.message, 'error');
                submitBtn.disabled = false;
            } finally {
                // ...
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
        setTimeout(init, 2000);
    }
})();
