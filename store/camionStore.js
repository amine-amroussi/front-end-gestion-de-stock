import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";

export const useCamion = create((set, get) => ({
  camionState: {
    camions: [],
    selectedCamion: null,
  },
  fetchAllCamions: async () => {
    try {
      const response = await axiosInstance.get(`/Truck`);
      if (response.status === 200) {
        console.log(response);
        
        set((state) => ({
          camionState: {
            ...state.camionState,
            camions: response.data.trucks,
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },
  fetchCamion: async (id) => {
    try {
      const response = await axiosInstance.get(`/Truck/${id}`);
      if (response.status === 200) {
        set((state) => ({
          camionState: {
            ...state.camionState,
            selectedCamion: response.data.data.camion,
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },
  createCamion: async (camionInfo) => {
    try {
      const response = await axiosInstance.post("/Truck", camionInfo);
      if (response.status === 201) {
        await get().fetchAllCamions();
      }
    } catch (error) {
      console.log(error);
    }
  },
  editCamion: async (camionInfo, id) => {
    try {
      const response = await axiosInstance.patch(`/Truck/${id}`, camionInfo);
      if (response.status === 200) {
        await get().fetchAllCamions();
        set((state) => ({
          camionState: {
            ...state.camionState,
            selectedCamion: null,
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },
}));
