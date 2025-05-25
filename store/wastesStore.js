import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";

export const useWastes  = create((set, get) => ({
  wasteState: {
    wastes: [],
    selectedWastes: [],
    selectedWaste: "",
    loadingWaste: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllWastes: async (page = 1, limit = 10) => {
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));

      const response = await axiosInstance.get(`/waste`, {
        params: { page, limit },
      });
      

      if (response.status === 200) {
        const data = response.data;
        
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            wastes: data.wastes,
            pagination: data.pagination || {
              totalItems: data.wastes.length,
              totalPages: Math.ceil(data.wastes.length / limit),
              currentPage: page,
              pageSize: limit,
            },
          },
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la récupération des déchets.";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      toast.error(errorMessage);
      console.error("Fetch wastes error:", error);
    } finally {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: false },
      }));
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().wasteState.pagination.currentPage;
      const totalPages = get().wasteState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            pagination: { ...state.wasteState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllWastes(nextPage, get().wasteState.pagination.pageSize);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du changement de page.";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          error: errorMessage,
        },
      }));
      toast.error(errorMessage);
      console.error("Next page error:", error);
    }
  },
  createWaste: async (wasteInfo) => {
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));
      const response = await axiosInstance.post("/waste", wasteInfo);
      if (response.status === 201 || response.status === 200) {
        await get().fetchAllWastes(get().wasteState.pagination.currentPage, get().wasteState.pagination.pageSize);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la création du déchet.";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      toast.error(errorMessage);
      console.error("Create waste error:", error);
    } finally {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: false },
      }));
    }
  },
  getWaste: async (id) => {
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));
      const response = await axiosInstance.get(`/waste/${id}`);
      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          wasteState: {
            ...state.wasteState,
            selectedWaste: data.waste,
            loadingWaste: false,
          },
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la récupération du déchet.";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      toast.error(errorMessage);
      console.error("Get waste error:", error);
    }
  },
  editWaste: async (wasteInfo, id) => {
    try {
      set((state) => ({
        wasteState: { ...state.wasteState, loadingWaste: true, error: null },
      }));
      const response = await axiosInstance.patch(`/waste/${id}`, wasteInfo);
      if (response.status === 200) {
        await get().fetchAllWastes(get().wasteState.pagination.currentPage, get().wasteState.pagination.pageSize);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la modification du déchet.";
      set((state) => ({
        wasteState: {
          ...state.wasteState,
          loadingWaste: false,
          error: errorMessage,
        },
      }));
      toast.error(errorMessage);
      console.error("Edit waste error:", error);
    }
  },
}));
