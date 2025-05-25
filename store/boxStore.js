const { axiosInstance } = require("@/utils/axiosInstance");
const { create } = require("zustand");

export const useBox = create((set, get) => ({
  boxState: {
    boxes: [],
    selectedBoxes: [],
    selectedBoxId: "",
    lodingBox: false,
  },
  fetchAllBoxes: async () => {
    try {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: true } }));

      const response = await axiosInstance.get("/box");
      if (response.status === 200) {
        const data = await response.data;
        console.log(data);
        set((state) => ({
          boxState: { ...state.boxState, boxes: data.boxes },
        }));
      }
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
    } catch (error) {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
      console.log(error);
    }
  },
  createBox: async (boxInfo) => {
    try {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: true } }));
      const response = await axiosInstance.post("/box", boxInfo);
      if (response.status === 201) {
        const data = await response.data;
        console.log(data);
        await get().fetchAllBoxes();
      }
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
    } catch (error) {
      set((state) => ({ boxState: { ...state.boxState, lodingBox: false } }));
      console.log(error);
    }
  },

  editBox: async (boxInfo, boxId) => {
    try {
      const response = await axiosInstance.patch(`/box/${boxId}`, boxInfo);
      if (response.status === 200) {
        const data = await response.data;
        console.log(data);
        await get().fetchAllBoxes();
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteBox : async (boxId) => {
    try {
      const response = await axiosInstance.delete(`/box/${boxId}`);
      if (response.status === 200) {
        const data = await response.data;
        console.log(data);
        await get().fetchAllBoxes();
      }
    } catch (error) {
      console.log(error);
    }
  }
}));
