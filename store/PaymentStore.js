import { create } from "zustand";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";

export const usePaymentStore = create((set, get) => ({
  state: {
    payments: [],
    selectedPayment: null,
    employees: [],
    summary: { totalPayments: 0, totalNetPay: 0, totalCredit: 0 },
    loading: false,
    error: null,
    pagination: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
    filters: { status: "", search: "" },
    sort: { sortBy: "year", sortOrder: "DESC" },
  },

  fetchPayments: async (page = 1, limit = 10, filters = {}, sort = {}) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const params = {
        page,
        limit,
        status: filters.status || "",
        search: filters.search || "",
        sortBy: sort.sortBy || "year",
        sortOrder: sort.sortOrder || "DESC",
      };

      const response = await axiosInstance.get("/payment", { params });
      if (response.status === 200) {
        const data = response.data.data || response.data;
        set((state) => ({
          state: {
            ...state.state,
            payments: Array.isArray(data.payments) ? data.payments : [],
            pagination: {
              totalItems: data.pagination?.totalItems || 0,
              totalPages: data.pagination?.totalPages || 0,
              currentPage: page,
              pageSize: limit,
            },
            loading: false,
          },
        }));
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch payments",
        },
      }));
      toast.error(
        error.message || "Erreur lors de la récupération des paiements."
      );
    }
  },

  fetchPaymentsForEmployeeBetweenDates: async (
    employeeId,
    startMonth,
    startYear,
    endMonth,
    endYear
  ) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const params = { employeeId, startMonth, startYear, endMonth, endYear };
      const requestUrl = axiosInstance.getUri({
        url: "/payment/between-dates",
        params,
      });
      console.log("Request URL:", requestUrl);
      const response = await axiosInstance.get("/payment/between-dates", {
        params,
      });

      if (response.status === 200) {
        const data = response.data.data || response.data;
        set((state) => ({
          state: { ...state.state, loading: false, error: null },
        }));

        return Array.isArray(data.payments) ? data.payments : [];
      } else {
        set((state) => ({
          state: { ...state.state, loading: false, error: null },
        }));

        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error(
        "Error fetching payments:",
        error.message,
        error.response?.data,
        error.response?.status
      );
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch payments",
        },
      }));
      toast.error(
        error.message || "Erreur lors de la récupération des paiements."
      );
      return [];
    }
  },

  fetchEmployees: async () => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.get("/payment/employees");
      console.log("Fetch Employees Response:", response.data);
      if (response.status === 200) {
        set((state) => ({
          state: {
            ...state.state,
            employees: Array.isArray(response.data.employees)
              ? response.data.employees
              : [],
            loading: false,
          },
        }));
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Fetch Employees Error:", error);
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch employees",
        },
      }));
      toast.error(
        error.message || "Erreur lors de la récupération des employés."
      );
    }
  },

  fetchPaymentById: async (id) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.get(`/payment/${id}`);
      if (response.status === 200) {
        set((state) => ({
          state: {
            ...state.state,
            selectedPayment: response.data.payment || null,
            loading: false,
          },
        }));
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch payment",
        },
      }));
      toast.error(
        error.message || "Erreur lors de la récupération du paiement."
      );
    }
  },

  createPayment: async (paymentInfo) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.post("/payment", paymentInfo);
      if (response.status === 200) {
        await get().fetchPayments(
          get().state.pagination.currentPage,
          get().state.pagination.pageSize,
          get().state.filters,
          get().state.sort
        );
        set((state) => ({ state: { ...state.state, loading: false } }));
        toast.success("Paiement créé avec succès !");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to create payment",
        },
      }));
      toast.error(error.message || "Erreur lors de la création du paiement.");
    }
  },

  updatePayment: async (paymentId, status) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const response = await axiosInstance.patch(`/payment/${paymentId}`, {
        status,
      });
      if (response.status === 200) {
        await get().fetchPayments(
          get().state.pagination.currentPage,
          get().state.pagination.pageSize,
          get().state.filters,
          get().state.sort
        );
        set((state) => ({
          state: { ...state.state, selectedPayment: null, loading: false },
        }));
        toast.success("Paiement mis à jour avec succès !");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to update payment",
        },
      }));
      toast.error(
        error.message || "Erreur lors de la mise à jour du paiement."
      );
    }
  },

  fetchSummary: async (month, year) => {
    set((state) => ({ state: { ...state.state, loading: true, error: null } }));
    try {
      const params = {};
      if (month && year) {
        params.month = month;
        params.year = year;
      }
      const response = await axiosInstance.get("/payment/summary", { params });
      if (response.status === 200) {
        set((state) => ({
          state: {
            ...state.state,
            summary: response.data.summary || {
              totalPayments: 0,
              totalNetPay: 0,
              totalCredit: 0,
            },
            loading: false,
          },
        }));
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      set((state) => ({
        state: {
          ...state.state,
          loading: false,
          error: error.message || "Failed to fetch summary",
        },
      }));
      toast.error(error.message || "Erreur lors de la récupération du résumé.");
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      state: {
        ...state.state,
        filters: { ...state.state.filters, ...newFilters },
        pagination: { ...state.state.pagination, currentPage: 1 },
      },
    }));
  },

  setSort: (newSort) => {
    set((state) => ({
      state: {
        ...state.state,
        sort: { ...state.state.sort, ...newSort },
        pagination: { ...state.state.pagination, currentPage: 1 },
      },
    }));
  },

  goToNextPage: async () => {
    const { currentPage, totalPages } = get().state.pagination;
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      set((state) => ({
        state: {
          ...state.state,
          pagination: { ...state.state.pagination, currentPage: nextPage },
        },
      }));
      await get().fetchPayments(
        nextPage,
        get().state.pagination.pageSize,
        get().state.filters,
        get().state.sort
      );
    }
  },
}));
