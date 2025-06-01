import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { ShowToast } from "@/utils/toast";

export const useProduct = create((set, get) => ({
  productState: {
    products: [],
    selectedProducts: [],
    selectedProduct: "",
    loadingProduct: false,
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
        productState: { ...state.productState, loadingProduct: true },
      }));

      const response = await axiosInstance.get(`/product`, {
        params: { page, limit },
      });

      if (response.status === 200) {
        const data = response.data;
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
        },
      }));
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération des produits.");
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
      ShowToast.error("Erreur lors du changement de page.");
    }
  },
  createProduct: async (productInfo) => {
    const toastId = ShowToast.loading("Ajout d'un produit...");
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true },
      }));
      const response = await axiosInstance.post("/product", {
        designation: productInfo.designation,
        genre: productInfo.genre,
        priceUnite: Number(productInfo.priceUnite),
        capacityByBox: Number(productInfo.capacityByBox),
        box: productInfo.box,
      });
      if (response.status === 201) {
        const data = response.data;
        await get().fetchAllProducts(get().productState.pagination.currentPage, get().productState.pagination.pageSize);
        ShowToast.dismiss(toastId);
        ShowToast.successAdd(`Le produit`);
      }
    } catch (error) {
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la création du produit.");
    } finally {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
    }
  },
  getProduct: async (id) => {
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true },
      }));
      const response = await axiosInstance.get(`/product/${id}`);
      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          productState: {
            ...state.productState,
            selectedProduct: data.data.product,
            loadingProduct: false,
          },
        }));
      }
    } catch (error) {
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la récupération du produit.");
    } finally {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
    }
  },
  editProduct: async (productInfo, id) => {
    const toastId = ShowToast.loading("Mise à jour du produit...");
    try {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: true },
      }));
      const response = await axiosInstance.patch(`/product/${id}`, {
        designation: productInfo.designation,
        genre: productInfo.genre,
        priceUnite: Number(productInfo.priceUnite),
        capacityByBox: Number(productInfo.capacityByBox),
        box: productInfo.box,
      });
      if (response.status === 200) {
        const data = response.data;
        await get().fetchAllProducts(get().productState.pagination.currentPage, get().productState.pagination.pageSize);
        ShowToast.dismiss(toastId);
        ShowToast.successUpdate(`Le produit`);
      }
    } catch (error) {
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la mise à jour du produit.");
    } finally {
      set((state) => ({
        productState: { ...state.productState, loadingProduct: false },
      }));
    }
  },
}));