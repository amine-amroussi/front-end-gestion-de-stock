
import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";

export const useProduct = create((set, get) => ({
  productState: {
    products: [],
    selectedProducts: [],
    selectedProduct: "",
    loadingProduct: false, // Fixed typo: lodingProduct -> loadingProduct
    error: null, // Added to store errors
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllProducts: async (page = 1, limit = 10) => {
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true, error: null },
      }));

      const response = await axiosInstance.get(`/product`, {
        params: { page, limit },
      });

      if (response.status === 200) {
        const data = response.data; // Removed unnecessary await
        set((state) => ({
          productState: {
            ...state.productState,
            products: data.data.products,
            pagination: data.data.pagination,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        productState: {
          ...state.productState,
          loadingProduct: false,
          error: error.message || "Failed to fetch products",
        },
      }));
      console.error("Fetch products error:", error);
    } finally {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().productState.pagination.currentPage;
      const totalPages = get().productState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          productState: {
            ...state.productState,
            pagination: { ...state.productState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllProducts(nextPage, get().productState.pagination.pageSize);
      }
    } catch (error) {
      console.error("Next page error:", error);
    }
  },
  createProduct: async (productInfo) => {
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true, error: null },
      }));
      const response = await axiosInstance.post("/product", productInfo);
      if (response.status === 201) {
        const data = response.data; // Removed unnecessary await
        await get().fetchAllProducts(get().productState.pagination.currentPage, get().productState.pagination.pageSize);
      }
    } catch (error) {
      set((state) => ({
        productState: {
          ...state.productState,
          loadingProduct: false,
          error: error.message || "Failed to create product",
        },
      }));
      console.error("Create product error:", error);
    }
  },
  getProduct: async (id) => {
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true, error: null },
      }));
      const response = await axiosInstance.get(`/product/${id}`);
      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          productState: {
            ...state.productState,
            selectedProduct: data.product,
            loadingProduct: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        productState: {
          ...state.productState,
          loadingProduct: false,
          error: error.message || "Failed to fetch product",
        },
      }));
      console.error("Get product error:", error);
    }
  },
  editProduct: async (productInfo, id) => {
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true, error: null },
      }));
      const response = await axiosInstance.patch(`/product/${id}`, productInfo);
      if (response.status === 200) {
        const data = response.data;
        await get().fetchAllProducts(get().productState.pagination.currentPage, get().productState.pagination.pageSize);
      }
    } catch (error) {
      set((state) => ({
        productState: {
          ...state.productState,
          loadingProduct: false,
          error: error.message || "Failed to edit product",
        },
      }));
      console.error("Edit product error:", error);
    }
  },
}));