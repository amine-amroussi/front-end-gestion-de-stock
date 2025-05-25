import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";

export const useTrip = create((set, get) => ({
  tripState: {
    trips: [],
    activeTrips: [],
    loadingTrip: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllTrips: async (page = 1, limit = 10) => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      const response = await axiosInstance.get(`/trip`, {
        params: { page, limit },
      });
      console.log("fetchAllTrips response:", response.data);

      if (response.status === 200) {
        const { trips, totalItems, totalPages, currentPage } = response.data;
        set((state) => ({
          tripState: {
            ...state.tripState,
            trips,
            pagination: {
              totalItems,
              totalPages,
              currentPage,
              pageSize: limit,
            },
          },
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la récupération des tournées.";
      console.error("fetchAllTrips error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  fetchActiveTrips: async () => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      console.log("Fetching active trips from /trip/active");
      const response = await axiosInstance.get(`/trip/active`);
      console.log("fetchActiveTrips response:", response.data);

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          tripState: { ...state.tripState, activeTrips: data.trips || [] },
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la récupération des tournées actives.";
      console.error("fetchActiveTrips error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  fetchTripById: async (tripId) => {
    try {
      const parsedTripId = parseInt(tripId, 10);
      console.log("Fetching trip by ID:", parsedTripId);
      if (isNaN(parsedTripId)) {
        throw new Error("ID de tournée invalide");
      }
      console.log(`Requesting /trip/${parsedTripId}`);
      const response = await axiosInstance.get(`/trip/${parsedTripId}`);
      console.log("fetchTripById response:", response.data);
      if (!response.data.trip) {
        throw new Error("No trip data returned in response");
      }
      return response.data.trip;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la récupération de la tournée par ID.";
      console.error("fetchTripById error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
  startTrip: async (tripData) => {
    try {
      console.log("Sending startTrip request with data:", tripData);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      const response = await axiosInstance.post(`/trip/start`, tripData);
      console.log("startTrip response:", response.data);

      if (response.status === 201) {
        set((state) => ({
          tripState: {
            ...state.tripState,
            activeTrips: [...state.tripState.activeTrips, response.data.trip],
          },
        }));
        await get().fetchActiveTrips();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors du démarrage de la tournée.";
      console.error("startTrip error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
      throw error;
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  finishTrip: async (tripId, tripData) => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      const response = await axiosInstance.post(`/trip/finish/${tripId}`, tripData);
      console.log("finishTrip response:", response.data);

      if (response.status === 200) {
        set((state) => ({
          tripState: {
            ...state.tripState,
            activeTrips: state.tripState.activeTrips.filter(trip => trip.id !== tripId),
          },
        }));
        await get().fetchAllTrips(get().tripState.pagination.currentPage, get().tripState.pagination.pageSize);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la finalisation de la tournée.";
      console.error("finishTrip error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  generateInvoice: async (tripId, type) => {
    try {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: true, error: null },
      }));

      const response = await axiosInstance.get(`/trip/invoice/${tripId}`, {
        params: { type },
      });
      console.log("generateInvoice response:", response.data);

      if (response.status === 200) {
        return response.data.invoice;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la génération de la facture.";
      console.error("generateInvoice error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false, error: errorMessage },
      }));
      toast.error(errorMessage);
      throw error;
    } finally {
      set((state) => ({
        tripState: { ...state.tripState, loadingTrip: false },
      }));
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().tripState.pagination.currentPage;
      const totalPages = get().tripState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          tripState: {
            ...state.tripState,
            pagination: { ...state.tripState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllTrips(nextPage, get().tripState.pagination.pageSize);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors du changement de page.";
      console.error("nextPage error:", error.response?.data || error);
      set((state) => ({
        tripState: { ...state.tripState, error: errorMessage },
      }));
      toast.error(errorMessage);
    }
  },
}));
