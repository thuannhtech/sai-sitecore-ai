/**
 * Account Sign-Up Module
 * Handles the registration form submission and interaction with the OrderCloud API.
 */
(function () {
    console.log('account-signup.js initialized');

    const refreshCart = async () => {
        try {
            const cartStore = window.SkateCartStore;
            const fetchCart = cartStore?.getState?.().fetchCart;

            if (typeof fetchCart === 'function') {
                await fetchCart();
            }
        } catch (error) {
            console.warn('Cart refresh failed after registration:', error);
        }
    };

    // --- SweetAlert2 Notification Component ---
    const loadSweetAlert = () => {
        return new Promise((resolve) => {
            if (window.Swal) return resolve(window.Swal);
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            script.onload = () => resolve(window.Swal);
            document.head.appendChild(script);
        });
    };

    const showNotification = async (options) => {
        const Swal = await loadSweetAlert();
        return Swal.fire({
            confirmButtonColor: '#000000', // Black for skate theme
            ...options
        });
    };

    const init = () => {
        const form = document.querySelector('form[name="SignUp"]');
        if (!form) {
            console.warn('Sign Up form not found in DOM yet. Retrying...');
            return;
        }

        if (form.dataset.initialized) {
            return;
        }
        form.dataset.initialized = 'true';

        console.log('Sign Up form detected, attaching listeners.');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // --- 1. Client-side Validation ---
            if (!data.FirstName || !data.LastName || !data.Email || !data.Password) {
                await showNotification({
                    title: 'Missing Fields',
                    text: 'Please fill in all required fields.',
                    icon: 'warning'
                });
                return;
            }

            if (data.Password !== data.ConfirmPassword) {
                await showNotification({
                    title: 'Password Mismatch',
                    text: 'Passwords do not match. Please try again.',
                    icon: 'error'
                });
                return;
            }

            if (data.Password.length < 6) {
                await showNotification({
                    title: 'Weak Password',
                    text: 'Password must be at least 6 characters long.',
                    icon: 'warning'
                });
                return;
            }

            // --- 2. Password Encoding (Security Layer) ---
            // Encoding password to Base64 before sending to server
            const encodedPass = btoa(data.Password);
            data.Password = encodedPass;
            data.ConfirmPassword = encodedPass;

            // --- 3. UI Feedback ---
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            try {

                // --- 3. API Call ---
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Registration failed');
                }

                // --- 4. Success Handling ---
                await showNotification({
                    title: 'Welcome!',
                    text: 'Registration successful! You can now sign in.',
                    icon: 'success'
                });

                // Refresh the current cart state so the UI reflects the latest server cart.
                await refreshCart();

                // Optional: Clear form or redirect
                form.reset();

                // If there's a login modal or page, we could redirect here:
                // window.location.href = '/login';

            } catch (error) {
                console.error('Registration error:', error);
                await showNotification({
                    title: 'Registration Failed',
                    text: error.message,
                    icon: 'error'
                });
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    };

    // Run init. If form isn't there (dynamic load), retry or use MutationObserver
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
        // Fallback for dynamically injected forms (Sitecore Experience Editor etc.)
        setTimeout(init, 2000);
    }
})();
