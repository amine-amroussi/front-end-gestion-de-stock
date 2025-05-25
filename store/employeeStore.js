import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";

export const useEmployee = create((set, get) => ({
  employeeState: {
    employees: [],
    selectedEmployee: null,
    loadingEmployee: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
  fetchAllEmployees: async (page = 1, limit = 10) => {
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));

      const response = await axiosInstance.get(`/employee`, {
        params: { page, limit },
      });

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            employees: data.data.employees,
            pagination: data.data.pagination,
            loadingEmployee: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.message || "Failed to fetch employees",
        },
      }));
      console.error("Fetch employees error:", error);
    }
  },
  fetchEmployee: async (cin) => {
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));

      const response = await axiosInstance.get(`/employee/${cin}`);

      if (response.status === 200) {
        const data = response.data;
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            selectedEmployee: data.employee,
            loadingEmployee: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.message || "Failed to fetch employee",
        },
      }));
      console.error("Fetch employee error:", error);
    }
  },
  editEmployee: async (employeeInfo, cin) => {
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));

      const response = await axiosInstance.patch(`/employee/${cin}`, employeeInfo);

      if (response.status === 200) {
        await get().fetchAllEmployees(
          get().employeeState.pagination.currentPage,
          get().employeeState.pagination.pageSize
        );
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            selectedEmployee: null,
            loadingEmployee: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.message || "Failed to update employee",
        },
      }));
      console.error("Edit employee error:", error);
    }
  },
  createEmployee: async (employeeInfo) => {
    try {
      set((state) => ({
        employeeState: { ...state.employeeState, loadingEmployee: true, error: null },
      }));
      const response = await axiosInstance.post("/employee", employeeInfo);
      if (response.status === 201) {
        await get().fetchAllEmployees(
          get().employeeState.pagination.currentPage,
          get().employeeState.pagination.pageSize
        );
      }
    } catch (error) {
      set((state) => ({
        employeeState: {
          ...state.employeeState,
          loadingEmployee: false,
          error: error.message || "Failed to create employee",
        },
      }));
      console.error("Create employee error:", error);
    }
  },
  nextPage: async () => {
    try {
      const currentPage = get().employeeState.pagination.currentPage;
      const totalPages = get().employeeState.pagination.totalPages;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPages) {
        set((state) => ({
          employeeState: {
            ...state.employeeState,
            pagination: { ...state.employeeState.pagination, currentPage: nextPage },
          },
        }));
        await get().fetchAllEmployees(nextPage, get().employeeState.pagination.pageSize);
      }
    } catch (error) {
      console.error("Next page error:", error);
    }
  },
}));
