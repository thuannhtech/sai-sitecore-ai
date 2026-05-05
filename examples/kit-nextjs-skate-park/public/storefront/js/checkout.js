/**
 * SkateCheckoutBridge Module
 * Bridge logic to connect Sitecore BasicForms with React Zustand Store.
 */
const SkateCheckoutBridge = {
    // 1. Configuration
    config: {
        forms: {
            SHIPPING: 'CheckoutShippingAddressForm',
            BILLING: 'CheckoutBillingAddressFrom'
        },
        selectors: {
            errorMsg: 'field-error-msg',
            inputError: 'border-red-500',
            submitBtn: 'button[type="submit"]'
        }
    },

    // 2. Initialization
    init() {
        console.log('🚀 Skate Checkout Bridge Module Initialized.');
        this.bindEvents();
    },

    // 3. Event Binding
    bindEvents() {
        // Use capture phase to intercept events before React/Sitecore
        document.addEventListener('submit', (e) => this.handleSubmit(e), true);

        // Reset field error when user starts typing
        document.addEventListener('input', (e) => {
            if (e.target.name) {
                this.clearFieldError(e.target);
            }
        }, true);
    },

    // 4. Handle Form Submission
    handleSubmit(e) {
        const form = e.target;
        const formName = form.getAttribute('name');

        if (Object.values(this.config.forms).includes(formName)) {
            // Stop standard submission
            e.preventDefault();
            e.stopPropagation();

            const data = this.getFormData(form);
            const errors = this.validate(data);

            if (errors.length > 0) {
                this.showErrors(form, errors);
                console.warn(`[${formName}] Validation failed:`, errors);
                return;
            }

            console.log(`[${formName}] Validation passed. Updating store...`);
            this.updateStore(formName, data, form);
        }
    },

    // 5. Data Extraction
    getFormData(form) {
        const data = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name) {
                data[input.name] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
        return data;
    },

    // 6. Validation Logic
    validate(data) {
        const errors = [];
        const requiredFields = ['FullName', 'PhoneNumber', 'Address'];

        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                errors.push({ field, message: `${field} is required` });
            }
        });

        if (data.email && !data.email.includes('@')) {
            errors.push({ field: 'email', message: 'Invalid email address' });
        }

        return errors;
    },

    // 7. UI: Show/Clear Errors
    showErrors(form, errors) {
        const { errorMsg, inputError } = this.config.selectors;

        // Clear previous errors first
        this.clearAllErrors(form);

        errors.forEach(err => {
            const input = form.querySelector(`[name="${err.field}"]`);
            if (input) {
                input.classList.add(inputError);
                const msg = document.createElement('p');
                msg.className = `${errorMsg} text-red-500 text-[10px] font-bold mt-1`;
                msg.innerText = err.message;
                input.parentNode.appendChild(msg);
            }
        });
    },

    clearFieldError(input) {
        const { errorMsg, inputError } = this.config.selectors;
        input.classList.remove(inputError);
        const errorElement = input.parentNode.querySelector(`.${errorMsg}`);
        if (errorElement) errorElement.remove();
    },

    clearAllErrors(form) {
        const { errorMsg, inputError } = this.config.selectors;
        form.querySelectorAll(`.${errorMsg}`).forEach(el => el.remove());
        form.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove(inputError));
    },

    // 8. Interaction with Zustand Store
    updateStore(formName, data, form) {
        if (!window.SkateCheckoutStore) {
            console.error('SkateCheckoutStore not found on window object!');
            return;
        }

        const store = window.SkateCheckoutStore.getState();

        switch (formName) {
            case this.config.forms.SHIPPING:
                const shippingAddressWarapper = document.querySelector(".shipping-address-step");
                shippingAddressWarapper.querySelector("form[name='CheckoutShippingAddressForm']").style.display = "none";


                const content = shippingAddressWarapper.querySelector(".relative");

                // Check and remove old summary to avoid duplicates
                const oldSummary = content.querySelector(".shipping-summary-raw");
                if (oldSummary) oldSummary.remove();

                // Create raw text summary element
                const summaryDiv = document.createElement("div");
                summaryDiv.className = "shipping-summary-raw p-4 bg-gray-50 border border-gray-100 rounded-xl mt-2 animate-in fade-in duration-500";
                summaryDiv.innerHTML = `
                    <div class="flex justify-between items-center">
                        <p class="text-sm text-gray-700 font-medium leading-relaxed">
                            ${data.FullName}, ${data.PhoneNumber}, ${data.Address}
                        </p>
                        <button type="button" class="edit-shipping-btn text-[10px] font-black uppercase text-blue-600 hover:underline ml-4">Edit</button>
                    </div>
                `;

                // Add Edit functionality
                summaryDiv.querySelector(".edit-shipping-btn").onclick = () => {
                    const form = shippingAddressWarapper.querySelector("form[name='CheckoutShippingAddressForm']");
                    
                    // Reset errors when toggling form
                    this.clearAllErrors(form);

                    // 1. Auto-fill saved data back into form (Pure DOM - safe for Uncontrolled components)
                    Object.keys(data).forEach(key => {
                        const input = form.querySelector(`[name="${key}"]`);
                        if (input) {
                            if (input.type === 'checkbox') input.checked = data[key];
                            else input.value = data[key];
                            
                            // Optional: notify any other listeners (like validation scripts)
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    });

                    // 2. Show form and hide summary
                    summaryDiv.style.display = "none";
                    form.style.display = "block";

                    // 3. Add or Update Cancel button logic
                    let cancelBtn = form.querySelector(".cancel-edit-btn");
                    if (!cancelBtn) {
                        const submitBtn = form.querySelector(this.config.selectors.submitBtn);
                        cancelBtn = document.createElement("button");
                        cancelBtn.type = "button";
                        cancelBtn.className = "cancel-edit-btn w-full py-4 mt-2 bg-gray-100 text-gray-600 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all";
                        cancelBtn.innerText = "Cancel";
                        submitBtn.parentNode.appendChild(cancelBtn);
                    }

                    // ALWAYS update the onclick handler to use the latest 'data'
                    cancelBtn.onclick = () => {
                        this.clearAllErrors(form);
                        
                        // Revert form values to the last saved data (discarding unsaved changes)
                        Object.keys(data).forEach(key => {
                            const input = form.querySelector(`[name="${key}"]`);
                            if (input) {
                                if (input.type === 'checkbox') input.checked = data[key];
                                else input.value = data[key];
                                // Sync visual state
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        });

                        form.style.display = "none";
                        summaryDiv.style.display = "block";
                    };
                };

                content.appendChild(summaryDiv);

                // Update store and move to next step
                store.setShippingAddress(data);

                break;
            case this.config.forms.BILLING:
                store.setBillingAddress(data);
                break;
            default:
                break;
        }
    },

    // 9. UI: Success Feedback
    showSuccessFeedback(form) {
        const btn = form.querySelector(this.config.selectors.submitBtn);
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = 'SAVED ✓';
            const originalBg = btn.className;
            btn.classList.add('bg-green-600');

            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('bg-green-600');
            }, 2000);
        }
    }
};

// Self-initialize
SkateCheckoutBridge.init();
