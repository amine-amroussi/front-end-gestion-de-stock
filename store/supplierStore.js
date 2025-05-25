import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";

export const useSupplier = create((set, get) => ({
  supplierState: {
    suppliers: [],
    selectedSupplier: null,
    loadingSupplier: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllSuppliers: async (page = 1, limit = 10) => {
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.get(`/supplier`, {
        params: { page, limit },
      });

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            suppliers: data.data.suppliers,
            pagination: data.data.pagination,
            loadingSupplier: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.message || "Failed to fetch suppliers",
        },
      }));
      console.error("Fetch suppliers error:", error);
    }
  },
  fetchSupplier: async (id) => {
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.get(`/supplier/${id}`);

      if (response.status === 200) {
        const data = response.data;
        console.log(response);
        
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            selectedSupplier: data.supplier,
            loadingSupplier: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.message || "Failed to fetch supplier",
        },
      }));
      console.error("Fetch supplier error:", error);
    }
  },
  createSupplier: async (supplierInfo) => {
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.post("/supplier", supplierInfo);

      if (response.status === 201) {
        await get().fetchAllSuppliers(
          get().supplierState.pagination.currentPage,
          get().supplierState.pagination.pageSize
        );
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            loadingSupplier: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.message || "Failed to create supplier",
        },
      }));
      console.error("Create supplier error:", error);
    }
  },
  editSupplier: async (supplierInfo, id) => {
    try {
      set((state) => ({
        supplierState: { ...state.supplierState, loadingSupplier: true, error: null },
      }));

      const response = await axiosInstance.patch(`/supplier/${id}`, supplierInfo);

      if (response.status === 200) {
        await get().fetchAllSuppliers(
          get().supplierState.pagination.currentPage,
          get().supplierState.pagination.pageSize
        );
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            selectedSupplier: null,
            loadingSupplier: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        supplierState: {
          ...state.supplierState,
          loadingSupplier: false,
          error: error.message || "Failed to update supplier",
        },
      }));
      console.error("Edit supplier error:", error);
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().supplierState.pagination.currentPage;
      const totalPages = get().supplierState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          supplierState: {
            ...state.supplierState,
            pagination: { ...state.supplierState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllSuppliers(nextPage, get().supplierState.pagination.pageSize);
      }
    } catch (error) {
      console.error("Next page error:", error);
    }
  },
}));
