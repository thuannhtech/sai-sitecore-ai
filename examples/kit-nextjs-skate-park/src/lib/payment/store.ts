import { create } from 'zustand';

interface SkatePaymentState {
  selectedMethodId: string;
  selectedMethodItemId: string; // ID của Item trong Sitecore
  activeConfig: any | null;
  braintreeInstance: any | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setSelectedMethodId: (id: string, itemId?: string) => void;
  setActiveConfig: (config: any | null) => void;
  setBraintreeInstance: (instance: any | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSkatePaymentStore = create<SkatePaymentState>((set) => ({
  selectedMethodId: 'braintree',
  selectedMethodItemId: '',
  activeConfig: null,
  braintreeInstance: null,
  isProcessing: false,
  error: null,

  setSelectedMethodId: (id: string, itemId?: string) =>
    set({ selectedMethodId: id, selectedMethodItemId: itemId || '' }),
  setActiveConfig: (config: any | null) => set({ activeConfig: config }),
  setBraintreeInstance: (instance: any | null) => set({ braintreeInstance: instance }),
  setIsProcessing: (processing: boolean) => set({ isProcessing: processing }),
  setError: (error: string | null) => set({ error }),
}));
