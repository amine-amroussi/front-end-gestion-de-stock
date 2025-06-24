"use client";
import { useEffect, useState } from "react";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axiosInstance";
import PrintAfternoonInvoice from "./PrintAfternoonInvoice";

const ListeDesTournees = () => {
  const {
    tripState: { trips, loadingTrip, error, pagination },
    fetchAllTrips,
    fetchTripById,
    finishTrip,
    emptyTruck,
  } = useTrip();

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [lastTripDetails, setLastTripDetails] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [selectedMatricule, setSelectedMatricule] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employee: "", // Now used as seller CIN
    truck: "",
    status: "completed",
    search: "",
    sortBy: "date",
    sortOrder: "DESC",
    pageSize: 10,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const trucksRes = await axiosInstance.get("/truck");
        setTrucks(trucksRes.data.trucks || []);
        await fetchAllTrips(1, {
          page: 1,
          limit: filters.pageSize,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          status: "completed",
        });
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Erreur lors de la récupération des données initiales.");
      }
    };
    fetchInitialData();
  }, [fetchAllTrips]);

  const fetchTripsWithFilters = async (page = 1) => {
    try {
      const queryParams = {
        page,
        limit: filters.pageSize,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        employee: filters.employee || undefined, // Seller CIN
        truck: filters.truck || undefined,
        status: "completed",
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      await fetchAllTrips(page, queryParams);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Erreur lors de l'application des filtres.");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchTripsWithFilters(1);
  };

  const resetFilters = () => {
    const defaultFilters = {
      startDate: "",
      endDate: "",
      employee: "",
      truck: "",
      status: "completed",
      search: "",
      sortBy: "date",
      sortOrder: "DESC",
      pageSize: 10,
    };
    setFilters(defaultFilters);
    fetchAllTrips(1, { 
      page: 1, 
      limit: 10, 
      sortBy: "date", 
      sortOrder: "DESC",
      status: "completed",
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTripsWithFilters(page);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Date",
      "Camion",
      "Zone",
      "Statut",
      "Conducteur",
      "Vendeur",
      "Montant Attendu",
      "Montant Reçu",
      "Différence",
      "Bénéfice",
    ];
    const rows = trips.map((trip) => [
      trip.id,
      format(new Date(trip.date), "dd/MM/yyyy"),
      trip.TruckAssociation?.matricule || "N/A",
      trip.zone,
      trip.isActive ? "Active" : "Terminée",
      trip.DriverAssociation?.name || "N/A",
      trip.SellerAssociation?.name || "N/A",
      trip.waitedAmount || 0,
      trip.receivedAmount || 0,
      trip.deff || 0,
      trip.benefit || 0,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `trips_export_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTripClick = async (tripId) => {
    try {
      const parsedTripId = parseInt(tripId, 10);
      if (isNaN(parsedTripId)) throw new Error("ID de tournée invalide");
      const trip = await fetchTripById(parsedTripId);
      setSelectedTrip(trip);
      setIsModalOpen(true);

      if (trip.TruckAssociation?.matricule) {
        const response = await axiosInstance.get(`/trip/last/${trip.TruckAssociation.matricule}`);
        setLastTripDetails(response.data);
      } else {
        setLastTripDetails(null);
      }

      if (!trip.isActive) {
        setInvoiceData({
          tripId: trip.id,
          truck: trip.TruckAssociation?.matricule,
          driver: trip.DriverAssociation?.name,
          seller: trip.SellerAssociation?.name,
          date: trip.date,
          zone: trip.zone,
          products: trip.TripProducts?.map((p) => ({
            designation: p.ProductAssociation?.designation,
            qttOut: p.qttOut,
            qttOutUnite: p.qttOutUnite,
            qttReutour: p.qttReutour,
            qttReutourUnite: p.qttReutourUnite,
            qttVendu: p.qttVendu,
            priceUnite: p.ProductAssociation?.priceUnite,
            totalRevenue: p.qttVendu * (p.ProductAssociation?.priceUnite || 0),
          })) || [],
          boxes: trip.TripBoxes?.map((b) => ({
            designation: b.BoxAssociation?.designation || "Inconnu",
            qttOut: b.qttOut,
            qttIn: b.qttIn,
          })) || [],
          wastes: trip.TripWastes?.map((w) => ({
            product: w.WasteAssociation?.ProductAssociation?.designation || w.product || "Inconnu",
            type: w.type,
            qtt: w.qtt,
            priceUnite: w.WasteAssociation?.ProductAssociation?.priceUnite || 0,
            cost: w.qtt * (w.WasteAssociation?.ProductAssociation?.priceUnite || 0),
          })) || [],
          charges: trip.TripCharges?.map((c) => ({
            type: c.ChargeAssociation?.type || "N/A",
            amount: c.amount,
          })) || [],
          totals: {
            waitedAmount: trip.waitedAmount || 0,
            receivedAmount: trip.receivedAmount || 0,
            benefit: trip.benefit || 0,
            deff: trip.deff || 0,
            tripCharges: trip.TripCharges?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
            totalWasteCost: trip.TripWastes?.reduce(
              (sum, w) => sum + w.qtt * (w.WasteAssociation?.ProductAssociation?.priceUnite || 0),
              0
            ) || 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Erreur lors de la récupération des détails de la tournée.");
    }
  };

  const handleEmptyTruck = async () => {
    try {
      if (!selectedTrip || !lastTripDetails) {
        throw new Error("Aucune tournée ou données du dernier trajet disponibles.");
      }
      const formData = {
        tripProducts: lastTripDetails.tripProducts.map((product) => ({
          product_id: product.product,
          qttReutour: product.qttOut || 0,
          qttReutourUnite: product.qttOutUnite || 0,
        })),
        tripBoxes: lastTripDetails.tripBoxes.map((box) => ({
          box_id: box.box,
          qttIn: box.qttOut || 0,
        })),
        tripWastes: [],
        tripCharges: [],
        receivedAmount: 0,
      };
      await finishTrip(selectedTrip.id, formData);
      setSelectedTrip(null);
      setLastTripDetails(null);
      setIsModalOpen(false);
      setInvoiceData(null);
      await fetchTripsWithFilters(pagination.currentPage);
      toast.success("Camion vidé avec succès !");
    } catch (error) {
      console.error("Error emptying truck:", error);
      toast.error("Erreur lors du vidage du camion.");
    }
  };

  const handleEmptyTruckByMatricule = async () => {
    try {
      if (!selectedMatricule) {
        toast.error("Veuillez sélectionner un camion.");
        return;
      }
      await emptyTruck(selectedMatricule);
      setSelectedMatricule("");
      await fetchTripsWithFilters(pagination.currentPage);
      toast.success("Camion vidé avec succès !");
    } catch (error) {
      console.error("Error emptying truck by matricule:", error);
      toast.error("Erreur lors du vidage du camion.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
    setInvoiceData(null);
    setLastTripDetails(null);
  };

  if (loadingTrip) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Liste des Tournées</h2>

      {/* Empty Truck Section */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vider un Camion</h3>
        <div className="flex gap-4 items-end">
          <div className="w-64">
            <Label htmlFor="truck-select" className="text-sm font-medium">Camion</Label>
            <Select value={selectedMatricule} onValueChange={setSelectedMatricule}>
              <SelectTrigger id="truck-select">
                <SelectValue placeholder="Sélectionner un camion" />
              </SelectTrigger>
              <SelectContent>
                {trucks.map((truck) => (
                  <SelectItem key={truck.matricule} value={truck.matricule}>
                    {truck.matricule}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleEmptyTruckByMatricule}
            disabled={!selectedMatricule}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Vider
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium">Date Début</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-sm font-medium">Date Fin</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="employee" className="text-sm font-medium">CIN Vendeur</Label>
            <Input
              id="employee"
              type="text"
              value={filters.employee}
              onChange={(e) => handleFilterChange("employee", e.target.value)}
              placeholder="CIN du vendeur"
            />
          </div>
          <div>
            <Label htmlFor="truck" className="text-sm font-medium">Camion</Label>
            <Input
              id="truck"
              value={filters.truck}
              onChange={(e) => handleFilterChange("truck", e.target.value)}
              placeholder="Matricule"
            />
          </div>
          <div>
            <Label htmlFor="search" className="text-sm font-medium">Recherche (Zone/ID)</Label>
            <Input
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Zone ou ID"
            />
          </div>
          <div>
            <Label htmlFor="sortBy" className="text-sm font-medium">Trier Par</Label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="zone">Zone</SelectItem>
                <SelectItem value="waitedAmount">Montant Attendu</SelectItem>
                <SelectItem value="receivedAmount">Montant Reçu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sortOrder" className="text-sm font-medium">Ordre</Label>
            <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
              <SelectTrigger id="sortOrder">
                <SelectValue placeholder="Descendant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Descendant</SelectItem>
                <SelectItem value="ASC">Ascendant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
            Appliquer
          </Button>
          <Button onClick={resetFilters} variant="outline">Réinitialiser</Button>
          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white">
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Trip List */}
      {trips.length === 0 ? (
        <p className="text-center text-gray-500">Aucune tournée disponible.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className={`border p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 ${
                  trip.deff < 0 ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                onClick={() => handleTripClick(trip.id)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">ID: {trip.id}</p>
                    <p className="text-sm text-gray-600">Camion: {trip.TruckAssociation?.matricule || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date: {format(new Date(trip.date), "dd/MM/yyyy")}</p>
                    <p className="text-sm text-gray-600">Zone: {trip.zone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut: Terminée</p>
                    <p className="text-sm text-gray-600">Différence: {trip.deff || 0} MAD</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Première
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Précédente
              </Button>
              <Select
                value={pagination.currentPage.toString()}
                onValueChange={(value) => handlePageChange(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder={pagination.currentPage} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <SelectItem key={page} value={page.toString()}>
                      {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Suivante
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="bg-blue-600 text-white disabled:bg-gray-300 hover:bg-blue-700"
              >
                Dernière
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage} sur {pagination.totalPages} ({pagination.totalItems} tournées)
            </p>
          </div>
        </>
      )}

      {/* Trip Details Modal */}
      {isModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Tournée #{selectedTrip.id}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-500 text-2xl">
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Camion:</p>
                <p>{selectedTrip.TruckAssociation?.matricule || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Conducteur:</p>
                <p>{selectedTrip.DriverAssociation?.name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Vendeur:</p>
                <p>{selectedTrip.SellerAssociation?.name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Assistant:</p>
                <p>{selectedTrip.AssistantAssociation?.name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Zone:</p>
                <p>{selectedTrip.zone}</p>
              </div>
              <div>
                <p className="font-medium">Date:</p>
                <p>{format(new Date(selectedTrip.date), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="font-medium">Statut:</p>
                <p>Terminée</p>
              </div>
              <div>
                <p className="font-medium">Différence:</p>
                <p>{selectedTrip.deff || 0} MAD</p>
              </div>
            </div>

            {selectedTrip.TripProducts?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Produits</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Désignation</th>
                        <th className="p-2 text-left">Sortie (Caisses)</th>
                        <th className="p-2 text-left">Sortie (Unités)</th>
                        <th className="p-2 text-left">Retour (Caisses)</th>
                        <th className="p-2 text-left">Retour (Unités)</th>
                        <th className="p-2 text-left">Vendu</th>
                        <th className="p-2 text-left">Prix (MAD)</th>
                        <th className="p-2 text-left">Total (MAD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrip.TripProducts.map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{product.ProductAssociation?.designation || "Inconnu"}</td>
                          <td className="p-2">{product.qttOut || 0}</td>
                          <td className="p-2">{product.qttOutUnite || 0}</td>
                          <td className="p-2">{product.qttReutour || 0}</td>
                          <td className="p-2">{product.qttReutourUnite || 0}</td>
                          <td className="p-2">{product.qttVendu || 0}</td>
                          <td className="p-2">{product.ProductAssociation?.priceUnite || 0}</td>
                          <td className="p-2">{(product.qttVendu || 0) * (product.ProductAssociation?.priceUnite || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTrip.TripBoxes?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Boîtes</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Désignation</th>
                        <th className="p-2 text-left">Sortie</th>
                        <th className="p-2 text-left">Retour</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrip.TripBoxes.map((box, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{box.BoxAssociation?.designation || "Inconnu"}</td>
                          <td className="p-2">{box.qttOut || 0}</td>
                          <td className="p-2">{box.qttIn || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTrip.TripWastes?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Déchets</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Produit</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Quantité</th>
                        <th className="p-2 text-left">Prix Unitaire (MAD)</th>
                        <th className="p-2 text-left">Coût Total (MAD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrip.TripWastes.map((waste, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{waste.WasteAssociation?.ProductAssociation?.designation || waste.product || "Inconnu"}</td>
                          <td className="p-2">{waste.type || "N/A"}</td>
                          <td className="p-2">{waste.qtt || 0}</td>
                          <td className="p-2">{waste.WasteAssociation?.ProductAssociation?.priceUnite || 0}</td>
                          <td className="p-2">{(waste.qtt || 0) * (waste.WasteAssociation?.ProductAssociation?.priceUnite || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTrip.TripCharges?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Charges</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Montant (MAD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrip.TripCharges.map((charge, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{charge.ChargeAssociation?.type || "N/A"}</td>
                          <td className="p-2">{charge.amount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!selectedTrip.isActive && invoiceData && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Facture</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Montant Attendu:</p>
                    <p>{invoiceData.totals?.waitedAmount - parseFloat(invoiceData.totals?.tripCharges) || 0} MAD</p>
                  </div>
                  <div>
                    <p className="font-medium">Montant Reçu:</p>
                    <p>{invoiceData.totals?.receivedAmount || 0} MAD</p>
                  </div>
                  <div>
                    <p className="font-medium">Bénéfice:</p>
                    <p>{invoiceData.totals?.benefit || 0} MAD</p>
                  </div>
                  <div>
                    <p className="font-medium">Différence:</p>
                    <p>{invoiceData.totals?.deff || 0} MAD</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Charges:</p>
                    <p>{invoiceData.totals?.tripCharges || 0} MAD</p>
                  </div>
                  <div>
                    <p className="font-medium">Coût Total Déchets:</p>
                    <p>{invoiceData.totals?.totalWasteCost || 0} MAD</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              {!selectedTrip.isActive && invoiceData && (
                <PrintAfternoonInvoice invoiceData={invoiceData} />
              )}
              {lastTripDetails && (
                <Button onClick={handleEmptyTruck} className="bg-red-600 hover:bg-red-700 text-white">
                  Vider le Camion
                </Button>
              )}
              <Button onClick={closeModal} variant="outline">Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeDesTournees;