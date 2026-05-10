/**
 * Account Sign-Up Module
 * Handles the registration form submission and interaction with the OrderCloud API.
 */
(function() {
    console.log('account-signup.js initialized');

    const init = () => {
        const form = document.querySelector('form[name="SignUp"]');
        if (!form) {
            console.warn('Sign Up form not found in DOM yet. Retrying...');
            return;
        }

        console.log('Sign Up form detected, attaching listeners.');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // --- 1. Client-side Validation ---
            if (!data.FirstName || !data.LastName || !data.Email || !data.Password) {
                alert('Please fill in all required fields.');
                return;
            }

            if (data.Password !== data.ConfirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }

            if (data.Password.length < 6) {
                alert('Password must be at least 6 characters long.');
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
                alert('Registration successful! You can now sign in.');
                
                // Optional: Clear form or redirect
                form.reset();
                
                // If there's a login modal or page, we could redirect here:
                // window.location.href = '/login';
                
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration Failed: ' + error.message);
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