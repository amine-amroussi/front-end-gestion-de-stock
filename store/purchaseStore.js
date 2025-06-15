import { create } from "zustand";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axiosInstance";

export const usePurchase = create((set) => ({
  purchaseState: {
    purchases: [],
    loadingPurchase: false,
    purchasNames: [],
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllPurchases: async (page = 1, limit = 10, filters = {}) => {
    set((state) => ({
      purchaseState: {
        ...state.purchaseState,
        loadingPurchase: true,
        error: null,
      },
    }));
    try {
      const params = {
        page,
        limit,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minTotal && { minTotal: filters.minTotal }),
        ...(filters.maxTotal && { maxTotal: filters.maxTotal }),
        ...(filters.search && { search: filters.search }),
      };
      console.log("fetchAllPurchases params:", JSON.stringify(params, null, 2));
      const response = await axiosInstance.get("/purchase", { params });
      console.log("fetchAllPurchases response:", JSON.stringify(response.data, null, 2));

      const { purchases, pagination, WastesArray } = response.data.data;

      // Ensure purchases include WastesArray
      const updatedPurchases = purchases.map((purchase) => {
        const wasteData = WastesArray.find((w) => w.purchaseId === purchase.id);
        return {
          ...purchase,
          WastesArray: wasteData || { purchaseId: purchase.id, details: [] },
        };
      });

      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          purchases: updatedPurchases,
          pagination,
          loadingPurchase: false,
        },
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || "Failed to fetch purchases";
      console.error("fetchAllPurchases error:", {
        message: errorMessage,
        status: error.response?.status,
        response: error.response?.data,
      });
      set((state) => ({
        purchaseState: {
          ...state.purchaseState,
          error: errorMessage,
          loadingPurchase: false,
        },
      }));
      toast.error(errorMessage);
    }
  },

  nextPage: async () => {
    set((state) => {
      const nextPage = state.purchaseState.pagination.currentPage + 1;
      if (nextPage <= state.purchaseState.pagination.totalPages) {
        state.fetchAllPurchases(
          nextPage,
          state.purchaseState.pagination.pageSize
        );
      }
      return state;
    });
  },
}));