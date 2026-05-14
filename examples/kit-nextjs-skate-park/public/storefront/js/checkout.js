/**
 * SkateCheckoutBridge Module
 * Bridge logic to connect Sitecore BasicForms with React Zustand Store.
 */
const SkateCheckoutBridge = {
    // 1. Configuration
    config: {
        forms: {
            SHIPPING: 'CheckoutShippingAddressForm',
            BILLING: 'CheckoutBillingAddressForm'
        },
        selectors: {
            errorMsg: 'form-error-message',
            inputError: 'border-red-500',
            submitBtn: 'button[type="submit"]',
            placeOrderBtn: '.place-order-btn',
            stepBridgeSlot: '.checkout-step-bridge-slot'
        }
    },
    
    // Flag to prevent auto-submit during edit mode
    isEditMode: false,

    commerceSettings: null,

    // 2. Initialization
    async init() {
        console.log('SkateCheckoutBridge initializing...');
        
        // Nạp SweetAlert2 nếu chưa có
        if (!window.Swal) {
            await this.loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11');
        }

        this.bindEvents();

        // Chờ một chút để Zustand Store kịp hydrate dữ liệu từ sessionStorage
        setTimeout(() => this.rehydrateUI(), 100);
    },

    // Helper: Nạp script từ URL
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    async getCommerceSettings() {
        if (this.commerceSettings) {
            return this.commerceSettings;
        }

        try {
            const response = await fetch('/api/commerce/settings');
            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.ok) {
                throw new Error(result.error || 'Failed to load commerce settings');
            }

            this.commerceSettings = result;
            return result;
        } catch (error) {
            console.error('[CHECKOUT] Failed to load commerce settings:', error);
            this.commerceSettings = {
                taxRate: 0.08,
                taxLabel: '8%',
            };
            return this.commerceSettings;
        }
    },

    // Kiểm tra và khôi phục giao diện nếu đã có dữ liệu trong Store (từ session cũ)
    rehydrateUI() {
        if (!window.SkateCheckoutStore) return;
        const state = window.SkateCheckoutStore.getState();

        // 1. Khôi phục Shipping Summary
        if (state.shippingAddress) {
            this.rehydrateStep(".shipping-address-step", this.config.forms.SHIPPING, state.shippingAddress);
        }

        // 2. Khôi phục Billing Summary
        if (state.billingAddress) {
            this.rehydrateStep(".billing-address-step", this.config.forms.BILLING, state.billingAddress);
        }

        // 3. Khởi tạo Shipping Method mặc định nếu chưa có
        if (!state.shippingMethod) {
            const standardBtn = document.querySelector('[data-method-id="standard"]');
            if (standardBtn) {
                this.handleShipmentSelection(standardBtn);
            }
        }

        // 4. Khởi tạo Payment Method mặc định nếu chưa có
        if (!state.selectedMethodId || (state.selectedMethodId === 'braintree' && !state.selectedMethodItemId)) {
            const defaultPaymentBtn = document.querySelector('.payment-option-btn');
            if (defaultPaymentBtn) {
                this.handlePaymentSelection(defaultPaymentBtn);
            }
        }
    },

    rehydrateStep(wrapperSelector, formName, data) {
        const wrapper = document.querySelector(wrapperSelector);
        if (wrapper) {
            const form = wrapper.querySelector(`form[name='${formName}']`);
            if (form) form.style.display = "none";

            const content = this.getStepBridgeContainer(wrapper);
            this.renderAddressSummary(content, data, wrapper, formName);
        }
    },

    getStepBridgeContainer(wrapper) {
        if (!wrapper) return null;
        return wrapper.querySelector(this.config.selectors.stepBridgeSlot) || wrapper.querySelector(".relative");
    },

    getShippingAddressData() {
        const state = window.SkateCheckoutStore?.getState();
        const shippingData = state?.shippingAddress || {};

        if (Object.keys(shippingData).length > 0) {
            return shippingData;
        }

        const shippingForm = document.querySelector(`form[name='${this.config.forms.SHIPPING}']`);
        if (!shippingForm) {
            return {};
        }

        const data = {};
        shippingForm.querySelectorAll('input, select, textarea').forEach((input) => {
            if (input.name) {
                data[input.name] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });

        return data;
    },

    showBillingForm(wrapper) {
        if (!wrapper) return;
        const form = wrapper.querySelector(`form[name='${this.config.forms.BILLING}']`);
        const summary = wrapper.querySelector(`[id='summary-${this.config.forms.BILLING}']`);

        if (summary) {
            summary.style.display = 'none';
        }
        if (form) {
            form.style.display = 'block';
        }
    },

    // 3. Event Binding
    bindEvents() {
        // Use capture phase to intercept events before React/Sitecore
        document.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        }, true);

        // Reset field error when user starts typing
        document.addEventListener('input', (e) => {
            if (e.target.name) {
                if (this.isEditMode) {
                    this.isEditMode = false;
                }
                this.clearFieldError(e.target);
            }
            // Chỉ cho phép nhập số vào trường PhoneNumber
            if (e.target.name === 'PhoneNumber') {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            }
        }, true);

        // Lắng nghe sự kiện click vào nút Place Order
        document.addEventListener('click', (e) => {
            const submitBtn = e.target.closest(this.config.selectors.submitBtn);
            if (submitBtn && submitBtn.closest('form')) {
                this.isEditMode = false;
            }

            if (e.target.closest(this.config.selectors.placeOrderBtn)) {
                this.handlePlaceOrder(e);
            }

            // Lắng nghe chọn Shipping Method
            const shipmentBtn = e.target.closest('.shipment-option-btn');
            if (shipmentBtn) {
                this.handleShipmentSelection(shipmentBtn);
            }

            // Lắng nghe chọn Payment Method
            const paymentBtn = e.target.closest('.payment-option-btn');
            if (paymentBtn) {
                this.handlePaymentSelection(paymentBtn);
            }

        }, true);



    },

    // Logic xử lý khi chọn Shipping Method
    handleShipmentSelection(btn) {
        if (!window.SkateCheckoutStore) return;

        const methodData = {
            id: btn.getAttribute('data-method-id'),
            name: btn.getAttribute('data-method-name'),
            price: parseFloat(btn.getAttribute('data-method-price')),
            time: btn.getAttribute('data-method-time')
        };

        console.log('Shipment Method Selected:', methodData);
        window.SkateCheckoutStore.getState().setShippingMethod(methodData);
    },

    // Logic xử lý khi chọn Payment Method
    handlePaymentSelection(btn) {
        if (!window.SkateCheckoutStore) return;

        const id = btn.getAttribute('data-method-id');
        const itemId = btn.getAttribute('data-item-id');

        console.log('Payment Method Selected:', id, itemId);
        window.SkateCheckoutStore.getState().setSelectedMethodId(id, itemId);
    },

    handlePlaceOrder(e) {
        if (e) e.preventDefault();
        if (!window.SkateCheckoutStore || !window.SkateCartStore) return;

        const checkoutState = window.SkateCheckoutStore.getState();
        const cartState = window.SkateCartStore.getState();
        const selectedPaymentId = checkoutState.selectedMethodId;

        const btn = e.target.closest(this.config.selectors.placeOrderBtn);
        const originalText = btn.innerHTML;

        const setBtnLoading = (isLoading, text = "PROCESSING...") => {
            btn.disabled = isLoading;
            btn.innerHTML = isLoading ? `<span class="animate-pulse">${text}</span>` : originalText;
        };

        const proceedWithOrder = async (transactionData = null) => {
            const commerceSettings = await this.getCommerceSettings();
            const subtotal = cartState.cart?.subtotal || 0;
            const promotionDiscount = cartState.cart?.promotionDiscount || 0;
            const discountedSubtotal = Math.max(subtotal - promotionDiscount, 0);
            const shippingAmount = checkoutState.shippingMethod?.price || 0;
            const taxRate = typeof commerceSettings?.taxRate === 'number' ? commerceSettings.taxRate : 0.08;
            const taxRatePercentage = taxRate * 100;
            const taxAmount = discountedSubtotal * taxRate;
            const orderTotal = discountedSubtotal + shippingAmount + taxAmount;

            const orderObject = {
                shippingMethod: checkoutState.shippingMethod,
                paymentMethod: {
                    id: checkoutState.selectedMethodId,
                    itemId: checkoutState.selectedMethodItemId
                },
                transaction: transactionData, // Lưu toàn bộ payload (nonce, details, deviceData...)
                cart: {
                    id: cartState.cart?.id || '',
                    items: cartState.cart?.items || [],
                    subtotal,
                    promotionDiscount,
                    discountedSubtotal,
                    shippingAmount,
                    taxRate,
                    taxRatePercentage,
                    taxAmount,
                    total: orderTotal,
                    itemCount: cartState.cart?.itemCount || 0
                }
            };

            console.log('[BRIDGE] Submitting order:', orderObject);

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderObject)
                });
                const result = await response.json();

                if (!response.ok || !result.ok) {
                    throw new Error(result.message || result.error || 'Unable to submit order.');
                }

                const orders = JSON.parse(localStorage.getItem('skate_orders') || '[]');
                orders.push(result.orderId);
                localStorage.setItem('skate_orders', JSON.stringify(orders));

                console.log('[SUCCESS] Order processed by API:', result);

                // Nếu có cảnh báo (lỗi gửi mail nhưng đơn hàng vẫn ok)
                if (result.message) {
                    console.warn('[BRIDGE] Order success with warning:', result.message);
                }

                // Thông báo thành công bằng Swal
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed!',
                    text: result.message ? 'Your order was placed, but we had trouble sending the confirmation email.' : 'Your order has been submitted successfully.',
                    showConfirmButton: true, // Cho phép user nhấn OK để đóng
                    confirmButtonText: 'Great!'
                });

                if (window.SkateCheckoutStore) window.SkateCheckoutStore.getState().resetCheckout();
                if (window.SkateCartStore) {
                    window.SkateCartStore.getState().clearCart();
                    localStorage.removeItem('skate_mock_cart');
                }

                setTimeout(() => {
                    window.location.href = result.redirectUrl;
                }, 100);
            } catch (error) {
                console.error('[BRIDGE] Order Submission Failed:', {
                    message: error.message,
                    stack: error.stack,
                    context: orderObject
                });
                setBtnLoading(false);
                
                Swal.fire({
                    icon: 'error',
                    title: 'Checkout Error',
                    text: 'Something went wrong while placing your order. Please try again.',
                    footer: `<span style="color: #ef4444; font-size: 10px;">Error: ${error.message}</span>`
                });
            }
        };

        // 1. Kiểm tra validation cơ bản
        if (!checkoutState.shippingAddress || !checkoutState.billingAddress || !checkoutState.shippingMethod) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Information',
                text: 'Please complete all shipping and billing details before placing your order.'
            });
            return;
        }

        // 2. Xử lý thanh toán
        if (selectedPaymentId === 'braintree') {
            if (!window.SkateBraintreeInstance) {
                Swal.fire({
                    icon: 'info',
                    title: 'Payment Required',
                    text: 'Please provide your card information before proceeding.'
                });
                return;
            }

            setBtnLoading(true, "AUTHORIZING...");

            window.SkateBraintreeInstance.requestPaymentMethod((err, payload) => {
                if (err) {
                    console.error('[BRAINTREE] Payment Authorization Error:', err);
                    setBtnLoading(false);
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Error',
                        text: 'We could not authorize your payment method. Please check your card details.'
                    });
                    return;
                }

                console.log('✅ [BRIDGE] Braintree Payload Received:', payload);
                setBtnLoading(true, "FINALIZING...");
                proceedWithOrder(payload); // Truyền toàn bộ payload
            });
        } else {
            setBtnLoading(true);
            proceedWithOrder();
        }
    },

    // 4. Handle Form Submission
    async handleSubmit(e) {
        const form = e.target;
        const formName = form.getAttribute('name');

        if (Object.values(this.config.forms).includes(formName)) {
            // Stop standard submission
            e.preventDefault();
            e.stopPropagation();

            if (this.isEditMode) {
                console.log(`[${formName}] Ignoring auto-submit while editing.`);
                return;
            }

            const data = this.getFormData(form);
            const errors = this.validate(formName, data);

            if (errors.length > 0) {
                this.showErrors(form, errors);
                console.warn(`[${formName}] Validation failed:`, errors);
                return;
            }

            console.log(`[${formName}] Validation passed. Saving address...`);
            await this.saveAndContinue(formName, data, form);
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
    validate(formName, data) {
        const errors = [];
        const requiredFields = ['FirstName', 'LastName', 'PhoneNumber', 'Address'];

        if (formName !== this.config.forms.BILLING) {
            requiredFields.push('Email');
        }

        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                errors.push({ field, message: `${field} is required` });
            }
        });

        if (formName !== this.config.forms.BILLING && data.Email && !data.Email.includes('@')) {
            errors.push({ field: 'Email', message: 'Invalid email address' });
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

    // Helper to render the Address Summary UI (Reusable for Shipping/Billing)
    renderAddressSummary(container, data, wrapper, formName) {
        if (!container) return;

        const summaryId = `summary-${formName}`;
        const oldSummary = container.querySelector(`#${summaryId}`);
        if (oldSummary) oldSummary.remove();

        const summaryDiv = document.createElement("div");
        summaryDiv.id = summaryId;
        summaryDiv.className = "address-summary-raw p-4 bg-gray-50 border border-gray-100 rounded-xl mt-2 animate-in fade-in duration-500";
        summaryDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <p class="text-gray-700 font-medium leading-relaxed">
                    ${data.FirstName || ''} ${data.LastName || ''}, ${data.PhoneNumber || ''}, ${data.Address || ''}
                </p>
                <button type="button" class="edit-address-btn text-[10px] font-black uppercase text-blue-600 hover:underline ml-4">Edit</button>
            </div>
        `;

        // Add Edit functionality
        summaryDiv.querySelector(".edit-address-btn").onclick = () => {
            const form = wrapper.querySelector(`form[name='${formName}']`);
            this.clearAllErrors(form);

            // Auto-fill (safe for uncontrolled)
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') input.checked = data[key];
                    else input.value = data[key];
                }
            });

            summaryDiv.style.display = "none";
            form.style.display = "block";

            // Add/Update Cancel button
            let cancelBtn = form.querySelector(".cancel-edit-btn");
            if (!cancelBtn) {
                const submitBtn = form.querySelector(this.config.selectors.submitBtn);
                cancelBtn = document.createElement("button");
                cancelBtn.type = "button";
                cancelBtn.className = "cancel-edit-btn w-full py-4 mt-2 bg-gray-100 text-gray-600 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all";
                cancelBtn.innerText = "Cancel";
                submitBtn.parentNode.appendChild(cancelBtn);
            }

            cancelBtn.onclick = () => {
                this.clearAllErrors(form);
                summaryDiv.style.display = "block";
                form.style.display = "none";
            };
        };

        container.appendChild(summaryDiv);
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
                const shippingWrapper = document.querySelector(".shipping-address-step");
                if (shippingWrapper) {
                    shippingWrapper.querySelector(`form[name='${formName}']`).style.display = "none";
                    const content = this.getStepBridgeContainer(shippingWrapper);
                    this.renderAddressSummary(content, data, shippingWrapper, formName);
                }

                store.setShippingAddress(data);
                sessionStorage.setItem(`checkout_form_${formName}`, JSON.stringify(data));
                break;
            case this.config.forms.BILLING:
                const billingWrapper = document.querySelector(".billing-address-step");
                if (billingWrapper) {
                    billingWrapper.querySelector(`form[name='${formName}']`).style.display = "none";
                    const content = this.getStepBridgeContainer(billingWrapper);
                    this.renderAddressSummary(content, data, billingWrapper, formName);
                }
                store.setBillingAddress(data);
                sessionStorage.setItem(`checkout_form_${formName}`, JSON.stringify(data));
                break;
            default:
                break;
        }
    },

    mapAddressPayload(data) {
        return {
            firstName: data.FirstName || '',
            lastName: data.LastName || '',
            phone: data.PhoneNumber || '',
            email: data.Email || '',
            addressLine1: data.Address || '',
            addressLine2: data.AddressLine2 || '',
            city: data.City || '',
            state: data.State || '',
            zipCode: data.ZipCode || '',
            country: data.Country || '',
            companyName: data.CompanyName || '',
        };
    },

    async saveAddressToApi(formName, data) {
        const endpoint = formName === this.config.forms.SHIPPING
            ? '/api/orders/shipping'
            : '/api/orders/billing';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.mapAddressPayload(data)),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
            throw new Error(result.error || `Failed to save ${formName} address`);
        }

        return result;
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
    },

    async saveAndContinue(formName, data, form) {
        const btn = form.querySelector(this.config.selectors.submitBtn);
        const originalText = btn ? btn.innerHTML : '';
        let isSuccess = false;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-pulse">SAVING...</span>';
        }

        try {
            await this.saveAddressToApi(formName, data);
            this.updateStore(formName, data, form);

            if (formName === this.config.forms.SHIPPING) {
                const sameShippingCheckbox = document.querySelector('.billing-same-shipping-checkbox');
                if (sameShippingCheckbox?.checked) {
                    try {
                        const billingForm = document.querySelector(`form[name='${this.config.forms.BILLING}']`);
                        await this.saveAddressToApi(this.config.forms.BILLING, data);
                        this.updateStore(this.config.forms.BILLING, data, billingForm);
                    } catch (billingError) {
                        console.error('[Billing] Save as shipping after shipping save failed:', billingError);
                    }
                }
            }

            isSuccess = true;
            btn.disabled = false;
            btn.innerHTML = '<span class="animate-pulse">SAVE</span>';

            this.showSuccessFeedback(form);
        } catch (error) {
            console.error(`[${formName}] Save API failed:`, error);
            alert(error.message || 'Failed to save address');
        } finally {
            if (btn && !isSuccess) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }
};


SkateCheckoutBridge.init();
