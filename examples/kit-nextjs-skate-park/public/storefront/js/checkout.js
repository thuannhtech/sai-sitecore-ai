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
            errorMsg: 'form-error-message',
            inputError: 'border-red-500',
            submitBtn: 'button[type="submit"]',
            placeOrderBtn: '.place-order-btn' // Nút Place Order trong Cart Summary
        }
    },

    // 2. Initialization
    init() {
        console.log('SkateCheckoutBridge initialized');
        this.bindEvents();

        // Chờ một chút để Zustand Store kịp hydrate dữ liệu từ sessionStorage
        setTimeout(() => this.rehydrateUI(), 100);
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

            const content = wrapper.querySelector(".relative");
            this.renderAddressSummary(content, data, wrapper, formName);
        }
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

        // Lắng nghe sự kiện click vào nút Place Order
        document.addEventListener('click', (e) => {
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

    // Logic xử lý khi click Place Order
    handlePlaceOrder(e) {
        if (!window.SkateCheckoutStore || !window.SkateCartStore) {
            console.error('Stores not found!');
            return;
        }

        const checkoutState = window.SkateCheckoutStore.getState();
        const cartState = window.SkateCartStore.getState();

        // 1. Kiểm tra tính hợp lệ của dữ liệu Checkout
        const validation = {
            shipping: !!checkoutState.shippingAddress,
            billing: !!checkoutState.billingAddress,
            method: !!checkoutState.shippingMethod,
            payment: !!checkoutState.selectedMethodId && (checkoutState.selectedMethodId !== 'braintree' || !!checkoutState.braintreeInstance)
        };

        if (!validation.shipping || !validation.billing || !validation.method) {
            alert("Vui lòng hoàn thành đầy đủ thông tin giao hàng, thanh toán và phương thức vận chuyển!");
            console.warn("Place Order blocked - Incomplete data:", validation);
            return;
        }

        // 2. Gom tất cả thông tin thành một Order Object
        const orderObject = {
            orderDate: new Date().toISOString(),
            shippingAddress: checkoutState.shippingAddress,
            billingAddress: checkoutState.billingAddress,
            shippingMethod: checkoutState.shippingMethod,
            paymentMethod: {
                id: checkoutState.selectedMethodId,
                itemId: checkoutState.selectedMethodItemId
            },
            cart: {
                items: cartState.cart?.items || [],
                subtotal: cartState.cart?.subtotal || 0,
                itemCount: cartState.cart?.items?.length || 0
            }
        };

        // 3. Log kết quả (Theo yêu cầu của anh)
        console.log("🚀 [PLACE ORDER] Final Order Object ready for API:", orderObject);

        // Hiệu ứng loading giả lập
        const btn = e.target.closest(this.config.selectors.placeOrderBtn);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="animate-pulse">PROCESSING...</span>';
        btn.disabled = true;

        debugger

        // Giả lập gọi API thành công sau 2s
        setTimeout(() => {
            const orderId = `SK-ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const orders = JSON.parse(localStorage.getItem('skate_orders') || '[]');
            
            // Thêm mã đơn hàng vào object
            orderObject.orderId = orderId;
            orders.push(orderObject);
            
            // Lưu vào localStorage
            localStorage.setItem('skate_orders', JSON.stringify(orders));

            console.log("✅ [SUCCESS] Order saved to localStorage:", orderId);
            
            // Reset stores
            window.SkateCheckoutStore.getState().resetCheckout();
            window.SkateCartStore.getState().clearCart();
            
            // Chuyển hướng kèm token
            window.location.href = `/thank-you?token=${orderId}`;
        }, 2000);
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

    // Helper to render the Address Summary UI (Reusable for Shipping/Billing)
    renderAddressSummary(container, data, wrapper, formName) {
        const summaryId = `summary-${formName}`;
        const oldSummary = container.querySelector(`#${summaryId}`);
        if (oldSummary) oldSummary.remove();

        const summaryDiv = document.createElement("div");
        summaryDiv.id = summaryId;
        summaryDiv.className = "address-summary-raw p-4 bg-gray-50 border border-gray-100 rounded-xl mt-2 animate-in fade-in duration-500";
        summaryDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <p class="text-gray-700 font-medium leading-relaxed">
                    ${data.FullName || data.name || ''}, ${data.PhoneNumber || data.phone || ''}, ${data.Address || data.addressLine1 || ''}
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
                    input.dispatchEvent(new Event('input', { bubbles: true }));
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
                    const content = shippingWrapper.querySelector(".relative");
                    this.renderAddressSummary(content, data, shippingWrapper, formName);
                }

                store.setShippingAddress(data);
                sessionStorage.setItem(`checkout_form_${formName}`, JSON.stringify(data));
                break;
            case this.config.forms.BILLING:
                const billingWrapper = document.querySelector(".billing-address-step");
                if (billingWrapper) {
                    billingWrapper.querySelector(`form[name='${formName}']`).style.display = "none";
                    const content = billingWrapper.querySelector(".relative");
                    this.renderAddressSummary(content, data, billingWrapper, formName);
                }
                store.setBillingAddress(data);
                sessionStorage.setItem(`checkout_form_${formName}`, JSON.stringify(data));
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
