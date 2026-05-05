import { create } from 'zustand';
import { AddressInfo, ShippingMethodInfo } from './schema';

/**
 * useSkateCheckoutStore
 * Centralized store for managing the entire checkout lifecycle.
 */
interface SkateCheckoutState {
  // Step Management
  currentStep: number;
  
  // Data
  shippingAddress: AddressInfo | null;
  billingAddress: AddressInfo | null;
  billingSameAsShipping: boolean;
  shippingMethod: ShippingMethodInfo | null;
  
  // Payment
  selectedMethodId: string;
  selectedMethodItemId: string; 
  braintreeInstance: any | null;
  
  // Global Status
  isProcessing: boolean;
  error: string | null;

  // Actions
  setStep: (step: number) => void;
  setShippingAddress: (address: AddressInfo) => void;
  setBillingAddress: (address: AddressInfo) => void;
  setBillingSameAsShipping: (same: boolean) => void;
  setShippingMethod: (method: ShippingMethodInfo) => void;
  setSelectedMethodId: (id: string, itemId?: string) => void;
  setBraintreeInstance: (instance: any | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  resetCheckout: () => void;
}

import { createJSONStorage, persist } from 'zustand/middleware';

export const useSkateCheckoutStore = create<SkateCheckoutState>()(
  persist(
    (set) => ({
      currentStep: 1, // 1: Shipping, 2: Method, 3: Payment
      shippingAddress: null,
      billingAddress: null,
      billingSameAsShipping: true,
      shippingMethod: null,
      selectedMethodId: 'braintree',
      selectedMethodItemId: '',
      braintreeInstance: null,
      isProcessing: false,
      error: null,

      setStep: (step) => set({ currentStep: step }),
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setBillingAddress: (address) => set({ billingAddress: address }),
      setBillingSameAsShipping: (same) => set({ billingSameAsShipping: same }),
      setShippingMethod: (method) => set({ shippingMethod: method }),
      setSelectedMethodId: (id, itemId) => set({ selectedMethodId: id, selectedMethodItemId: itemId || '' }),
      setBraintreeInstance: (instance) => set({ braintreeInstance: instance }),
      setIsProcessing: (processing) => set({ isProcessing: processing }),
      setError: (error) => set({ error }),
      resetCheckout: () => set({
        currentStep: 1,
        shippingAddress: null,
        billingAddress: null,
        billingSameAsShipping: true,
        shippingMethod: null,
        isProcessing: false,
        error: null
      })
    }),
    {
      name: 'checkout_state',
      storage: createJSONStorage(() => sessionStorage),
      // Chỉ lưu những trường dữ liệu cần thiết, loại bỏ braintreeInstance vì nó gây lỗi Circular JSON
      partialize: (state) => ({
        currentStep: state.currentStep,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        billingSameAsShipping: state.billingSameAsShipping,
        shippingMethod: state.shippingMethod,
        selectedMethodId: state.selectedMethodId,
        selectedMethodItemId: state.selectedMethodItemId,
      }),
    }
  )
);

// Export store for external JS (Sitecore scripts)
if (typeof window !== 'undefined') {
  (window as any).SkateCheckoutStore = useSkateCheckoutStore;
}
