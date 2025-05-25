import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";

export const usePurchase = create((set, get) => ({
  purchaseState: {
    purchases: [],
    selectedPurchase: null,
    loadingPurchase: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllPurchases: async (page = 1, limit = 10) => {
    try {
      set((state) => ({
        purchaseState: { ...state.purchaseState, loadingPurchase: true, error: null },
      }));

      const response = await axiosInstance.get(`/purchase`, {
        params: { page, limit },
      });

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          purchaseState: {
            ...state.purchaseState,
            purchases: data.data.purchases,
            pagination: data.data.pagination,
            loadingPurchase: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          loadingPurchase: false,
          error: error.response?.data?.message || "Failed to fetch purchases",
        },
      }));
      console.error("Fetch purchases error:", error);
    }
  },
  fetchPurchase: async (id) => {
    try {
      set((state) => ({
        purchaseState: { ...state.purchaseState, loadingPurchase: true, error: null },
      }));

      const response = await axiosInstance.get(`/purchase/${id}`);

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          purchaseState: {
            ...state.purchaseState,
            selectedPurchase: data.data.purchase,
            loadingPurchase: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          loadingPurchase: false,
          error: error.response?.data?.message || "Failed to fetch purchase",
        },
      }));
      console.error("Fetch purchase error:", error);
    }
  },
  createPurchase: async (purchaseInfo) => {
    try {
      set((state) => ({
        purchaseState: { ...state.purchaseState, loadingPurchase: true, error: null },
      }));

      const response = await axiosInstance.post("/purchase", purchaseInfo);

      if (response.status === 201) {
        await get().fetchAllPurchases(
          get().purchaseState.pagination.currentPage,
          get().purchaseState.pagination.pageSize
        );
        set((state) => ({
          purchaseState: {
            ...state.purchaseState,
            loadingPurchase: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          loadingPurchase: false,
          error: error.response?.data?.message || "Failed to create purchase",
        },
      }));
      console.error("Create purchase error:", error);
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().purchaseState.pagination.currentPage;
      const totalPages = get().purchaseState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          purchaseState: {
            ...state.purchaseState,
            pagination: { ...state.purchaseState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllPurchases(nextPage, get().purchaseState.pagination.pageSize);
      }
    } catch (error) {
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          error: error.response?.data?.message || "Failed to fetch next page",
        },
      }));
      console.error("Next page error:", error);
    }
  },
}));
