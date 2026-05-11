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

            if (!data.email || !data.password) {
                alert('Please enter both email and password.');
                return;
            }

            // --- 1. Password Encoding (consistent with registration) ---
            const encodedPass = btoa(data.password);
            data.password = encodedPass;

            // --- 2. UI Feedback ---
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

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
                // Store the token in a cookie so the SDK and Sitecore can use it
                // Note: We use a simple cookie for this POC. 
                // In production, consider using the OrderCloud SDK's cookie management.
                document.cookie = `skate-park.access-token=${result.access_token}; path=/; max-age=${result.expires_in}; SameSite=Lax`;

                // Call the profile API to let the server set the user-data cookie
                await fetch('/api/customer/me');

                // Redirect to account or home
                window.location.href = '/';

            } catch (error) {
                console.error('Login error:', error);
                alert('Login Failed: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
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
