import { create } from 'zustand';

interface SkatePaymentState {
  selectedMethodId: string;
  braintreeInstance: any | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setSelectedMethodId: (id: string) => void;
  setBraintreeInstance: (instance: any | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSkatePaymentStore = create<SkatePaymentState>((set) => ({
  selectedMethodId: 'braintree', // Default is now Braintree
  braintreeInstance: null,
  isProcessing: false,
  error: null,

  setSelectedMethodId: (id: string) => set({ selectedMethodId: id }),
  setBraintreeInstance: (instance: any | null) => set({ braintreeInstance: instance }),
  setIsProcessing: (processing: boolean) => set({ isProcessing: processing }),
  setError: (error: string | null) => set({ error }),
}));
