"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Truck, Users, Package, ShoppingCart, BarChart2, Box, Trash2, Users2 } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import ChartCard from "@/components/ChartCard";
import QuickActions from "@/components/QuickActions";
import FilterSection from "@/components/FilterSection";
import { usePurchase } from "@/store/purchaseStore";
import { useTrip } from "@/store/tripStore";
import { useEmployee } from "@/store/employeeStore";
import { useBox } from "@/store/boxStore";
import { useCamion } from "@/store/camionStore";
import { useProduct } from "@/store/productStore";
import { useSupplier } from "@/store/supplierStore";
import { useWastes } from "@/store/wastesStore";
import { usePaymentStore } from "@/store/PaymentStore";
import { ShowToast } from "@/utils/toast";
import { format } from "date-fns";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
  });

  const { fetchAllPurchases, fetchTotalPurchaseAmount, purchaseState: { purchases, totalPurchaseAmount, pagination: purchasePagination } } = usePurchase();
  const { fetchAllTrips, fetchActiveTrips, fetchTotalTripRevenue, tripState: { trips, activeTrips, totalRevenue } } = useTrip();
  const { fetchAllEmployees, employeeState: { employees } } = useEmployee();
  const { fetchAllBoxes, boxState: { boxes } } = useBox();
  const { fetchAllCamions, camionState: { camions } } = useCamion();
  const { fetchAllProducts, productState: { products, pagination: productPagination } } = useProduct();
  const { fetchAllSuppliers, supplierState: { suppliers, pagination: supplierPagination } } = useSupplier();
  const { fetchAllWastes, wasteState: { wastes, pagination: wastePagination } } = useWastes();
  const { fetchSummary, state: { summary: paymentSummary } } = usePaymentStore();

  // Fetch data with React Query
  const { data: purchaseData, isLoading: purchaseLoading } = useQuery({
    queryKey: ["purchases", filters],
    queryFn: async () => {
      await Promise.all([
        fetchAllPurchases(1, 100, filters),
        fetchTotalPurchaseAmount(filters)
      ]);
      return {
        totalPurchases: purchasePagination.totalItems,
        totalPurchaseAmount,
        purchasesByDate: purchases.reduce((acc, p) => {
          const date = format(new Date(p.date), "yyyy-MM-dd");
          acc[date] = (acc[date] || 0) + (p.total || 0);
          return acc;
        }, {}),
      };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des achats"),
  });

  const { data: tripData, isLoading: tripLoading } = useQuery({
    queryKey: ["trips", filters],
    queryFn: async () => {
      await Promise.all([
        fetchAllTrips(1, { limit: 100, ...filters }),
        fetchActiveTrips(),
        fetchTotalTripRevenue(filters)
      ]);
      return {
        activeTrips: activeTrips.length,
        totalRevenue,
        tripsByDate: trips.reduce((acc, t) => {
          const date = format(new Date(t.date), "yyyy-MM-dd");
          acc[date] = (acc[date] || 0) + (t.receivedAmount || 0);
          return acc;
        }, {}),
      };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des tournées"),
  });

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      await fetchAllEmployees(1, 100);
      return { totalEmployees: employees.length };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des employés"),
  });

  const { data: boxData, isLoading: boxLoading } = useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      await fetchAllBoxes();
      return { totalBoxes: boxes.length };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des caisses"),
  });

  const { data: truckData, isLoading: truckLoading } = useQuery({
    queryKey: ["trucks"],
    queryFn: async () => {
      await fetchAllCamions();
      return { totalTrucks: camions.length };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des camions"),
  });

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      await fetchAllProducts(1, 100);
      return { totalProducts: productPagination.totalItems };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des produits"),
  });

  const { data: supplierData, isLoading: supplierLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      await fetchAllSuppliers(1, 100);
      return { totalSuppliers: supplierPagination.totalItems };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des fournisseurs"),
  });

  const { data: wasteData, isLoading: wasteLoading } = useQuery({
    queryKey: ["wastes"],
    queryFn: async () => {
      await fetchAllWastes(1, 100);
      return {
        totalWasteQuantity: wastes.reduce((sum, w) => sum + (parseFloat(w.qtt) || 0), 0),
      };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération des déchets"),
  });

  const { data: paymentData, isLoading: paymentLoading } = useQuery({
    queryKey: ["payments", filters],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      await fetchSummary(currentMonth, currentYear);
      return {
        totalNetPay: paymentSummary.totalNetPay || 0,
        paymentStatus: {
          pending: paymentSummary.totalPending || 0,
          paid: paymentSummary.totalPaid || 0,
          credit: paymentSummary.totalCredit || 0,
        },
      };
    },
    onError: (error) => ShowToast.error(error.message || "Erreur lors de la récupération du résumé des paiements"),
  });

  const handleApplyFilters = () => {
    // Trigger refetch by updating query keys
  };

  const chartDataPurchases = {
    labels: Object.keys(purchaseData?.purchasesByDate || {}),
    datasets: [{
      label: "Montant des Achats (MAD)",
      data: Object.values(purchaseData?.purchasesByDate || {}),
      backgroundColor: "rgba(59, 130, 246, 0.5)",
    }],
  };

  const chartDataTrips = {
    labels: Object.keys(tripData?.tripsByDate || {}),
    datasets: [{
      label: "Revenus des Tournées (MAD)",
      data: Object.values(tripData?.tripsByDate || {}),
      borderColor: "rgba(16, 185, 129, 1)",
      fill: false,
    }],
  };

  const chartDataPayments = {
    labels: ["En Attente", "Payé", "Crédit"],
    datasets: [{
      label: "Statut des Paiements",
      data: [
        paymentData?.paymentStatus.pending || 0,
        paymentData?.paymentStatus.paid || 0,
        paymentData?.paymentStatus.credit || 0,
      ],
      backgroundColor: [
        "rgba(239, 68, 68, 0.5)",
        "rgba(34, 197, 94, 0.5)",
        "rgba(245, 158, 11, 0.5)",
      ],
    }],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord</h1>

      <FilterSection
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Achats Totaux"
          value={purchaseData?.totalPurchases || 0}
          icon={<ShoppingCart className="size-6 text-blue-500" />}
          loading={purchaseLoading}
        />
        <MetricCard
          title="Montant Total des Achats"
          value={`${(purchaseData?.totalPurchaseAmount || 0).toFixed(2)} MAD`}
          icon={<DollarSign className="size-6 text-green-500" />}
          loading={purchaseLoading}
        />
        <MetricCard
          title="Tournées Actives"
          value={tripData?.activeTrips || 0}
          icon={<Truck className="size-6 text-yellow-500" />}
          loading={tripLoading}
        />
        <MetricCard
          title="Revenus Totaux des Tournées"
          value={`${(tripData?.totalRevenue || 0).toFixed(2)} MAD`}
          icon={<DollarSign className="size-6 text-emerald-500" />}
          loading={tripLoading}
        />
        <MetricCard
          title="Employés Totaux"
          value={employeeData?.totalEmployees || 0}
          icon={<Users className="size-6 text-purple-500" />}
          loading={employeeLoading}
        />
        <MetricCard
          title="Caisses Totales"
          value={boxData?.totalBoxes || 0}
          icon={<Box className="size-6 text-teal-500" />}
          loading={boxLoading}
        />
        <MetricCard
          title="Camions Totaux"
          value={truckData?.totalTrucks || 0}
          icon={<Truck className="size-6 text-indigo-500" />}
          loading={truckLoading}
        />
        <MetricCard
          title="Produits Totaux"
          value={productData?.totalProducts || 0}
          icon={<Package className="size-6 text-pink-500" />}
          loading={productLoading}
        />
        <MetricCard
          title="Fournisseurs Totaux"
          value={supplierData?.totalSuppliers || 0}
          icon={<Users2 className="size-6 text-orange-500" />}
          loading={supplierLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Achats au Fil du Temps" loading={purchaseLoading}>
          <Bar data={chartDataPurchases} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
        <ChartCard title="Revenus des Tournées au Fil du Temps" loading={tripLoading}>
          <Line data={chartDataTrips} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
        <ChartCard title="Statut des Paiements" loading={paymentLoading}>
          <Pie data={chartDataPayments} options={{ responsive: true }} />
        </ChartCard>
        <ChartCard title="Quantité Totale de Déchets" loading={wasteLoading}>
          <div className="text-2xl font-bold text-center">
            {wasteData?.totalWasteQuantity.toFixed(2) || 0} kg
          </div>
        </ChartCard>
      </div>

      <QuickActions />
    </div>
  );
};

export default Dashboard;