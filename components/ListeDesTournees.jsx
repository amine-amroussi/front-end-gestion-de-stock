"use client";
import { useEffect, useState } from "react";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import PrintAfternoonInvoice from "./PrintAfternoonInvoice";
import { toast } from "sonner";

const ListeDesTournees = () => {
  const { tripState: { trips, loadingTrip, error, pagination }, fetchAllTrips, fetchTripById } = useTrip();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [filterInputs, setFilterInputs] = useState({
    startDate: "",
    endDate: "",
    employee: "",
    truck: "",
    status: "",
    search: "",
    sortBy: "date",
    sortOrder: "DESC",
    pageSize: 10
  });
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    employee: "",
    truck: "",
    status: "",
    search: "",
    sortBy: "date",
    sortOrder: "DESC",
    pageSize: 10
  });

  useEffect(() => {
    fetchAllTrips(1, { page: 1, limit: 10, sortBy: "date", sortOrder: "DESC" });
  }, []);

  const fetchTripsWithFilters = async (page = 1) => {
    const queryParams = {
      page,
      limit: appliedFilters.pageSize,
      startDate: appliedFilters.startDate || undefined,
      endDate: appliedFilters.endDate || undefined,
      employee: appliedFilters.employee || undefined,
      truck: appliedFilters.truck || undefined,
      status: appliedFilters.status === "all" ? undefined : appliedFilters.status,
      search: appliedFilters.search || undefined,
      sortBy: appliedFilters.sortBy,
      sortOrder: appliedFilters.sortOrder
    };
    await fetchAllTrips(page, queryParams);
  };

  const handleFilterInputChange = (key, value) => {
    setFilterInputs((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const newFilters = {
      ...filterInputs,
      status: filterInputs.status === "all" ? "" : filterInputs.status
    };
    setAppliedFilters(newFilters);
    const queryParams = {
      page: 1,
      limit: newFilters.pageSize,
      startDate: newFilters.startDate || undefined,
      endDate: newFilters.endDate || undefined,
      employee: newFilters.employee || undefined,
      truck: newFilters.truck || undefined,
      status: newFilters.status || undefined,
      search: newFilters.search || undefined,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder
    };
    fetchAllTrips(1, queryParams);
  };

  const resetFilters = () => {
    const defaultFilters = {
      startDate: "",
      endDate: "",
      employee: "",
      truck: "",
      status: "",
      search: "",
      sortBy: "date",
      sortOrder: "DESC",
      pageSize: 10
    };
    setFilterInputs(defaultFilters);
    setAppliedFilters(defaultFilters);
    fetchAllTrips(1, { page: 1, limit: 10, sortBy: "date", sortOrder: "DESC" });
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
      "Bénéfice"
    ];
    const rows = trips.map(trip => [
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
      trip.benefit || 0
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
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
      if (isNaN(parsedTripId)) {
        console.error("Invalid trip ID:", tripId);
        return;
      }
      const trip = await fetchTripById(parsedTripId);
      setSelectedTrip(trip);
      setIsModalOpen(true);

      if (!trip.isActive) {
        setInvoiceData({
          tripId: trip.id,
          truck: trip.TruckAssociation?.matricule,
          driver: trip.DriverAssociation?.name,
          seller: trip.SellerAssociation?.name,
          date: trip.date,
          zone: trip.zone,
          products: trip.TripProducts.map(p => ({
            designation: p.ProductAssociation?.designation,
            qttOut: p.qttOut,
            qttOutUnite: p.qttOutUnite,
            qttReutour: p.qttReutour,
            qttReutourUnite: p.qttReutourUnite,
            qttVendu: p.qttVendu,
            priceUnite: p.ProductAssociation?.priceUnite,
            totalRevenue: p.qttVendu * (p.ProductAssociation?.priceUnite || 0)
          })),
          boxes: trip.TripBoxes.map(b => ({
            designation: b.BoxAssociation?.designation || "Inconnu",
            qttOut: b.qttOut,
            qttIn: b.qttIn
          })),
          wastes: trip.TripWastes.map(w => ({
            product: w.WasteAssociation?.ProductAssociation?.trip || w.product || "Inconnu",
            type: w.type,
            qtt: w.qtt
          })) || [],
          charges: trip.TripCharges.map(c => ({
            type: c.ChargeAssociation?.charge || "N/A",
            amount: c.amount
          })) || [],
          totals: {
            waitedAmount: trip.waitedAmount,
            receivedAmount: trip.receivedAmount,
            benefit: trip.deff,
            deff: trip.deff,
            tripCharges: trip.totalCharges,
            totalWastes: tripCharges
          }
        });
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Erreur lors de la récupération des détails de la tournée : " + error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
    setInvoiceData(null);
  };

  if (loadingTrip) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-gray-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Liste des Tournées</h2>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Date Début</Label>
            <Input
              type="date"
              value={filterInputs.startDate}
              onChange={(e) => handleFilterInputChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <Label>Date Fin</Label>
            <Input
              type="date"
              value={filterInputs.endDate}
              onChange={(e) => handleFilterInputChange("endDate", e.target.value)}
            />
          </div>
          <div>
            <Label>Rechercher (Zone/ID)</Label>
            <Input
              value={filterInputs.search}
              onChange={(e) => handleFilterInputChange("search", e.target.value)}
              placeholder="Zone ou ID"
            />
          </div>
          <div>
            <Label>Employé (Nom/CIN)</Label>
            <Input
              value={filterInputs.employee}
              onChange={(e) => handleFilterInputChange("employee", e.target.value)}
              placeholder="Nom ou CIN"
            />
          </div>
          <div>
            <Label>Camion</Label>
            <Input
              value={filterInputs.truck}
              onChange={(e) => handleFilterInputChange("truck", e.target.value)}
              placeholder="Matricule"
            />
          </div>
          <div>
            <Label>Statut</Label>
            <Select
              value={filterInputs.status}
              onValueChange={(value) => handleFilterInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trier Par</Label>
            <Select
              value={filterInputs.sortBy}
              onValueChange={(value) => handleFilterInputChange("sortBy", value)}
            >
              <SelectTrigger>
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
            <Label>Ordre</Label>
            <Select
              value={filterInputs.sortOrder}
              onValueChange={(value) => handleFilterInputChange("sortOrder", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Descendant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Descendant</SelectItem>
                <SelectItem value="ASC">Ascendant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Par Page</Label>
            <Select
              value={filterInputs.pageSize.toString()}
              onValueChange={(value) => handleFilterInputChange("pageSize", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={applyFilters} className="bg-blue-500 hover:bg-blue-600">
            Appliquer les Filtres
          </Button>
          <Button onClick={resetFilters} variant="outline">
            Réinitialiser
          </Button>
          <Button onClick={exportToCSV}>
            Exporter CSV
          </Button>
        </div>
      </div>

      {trips.length === 0 ? (
        <p className="text-center text-gray-500">Aucune tournée disponible.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className={`border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                  trip.deff < 0 ? "bg-red-100 border-red-300" : ""
                }`}
                onClick={() => handleTripClick(trip.id)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">ID: {trip.id}</p>
                    <p className="text-sm text-gray-600">Camion: {trip.TruckAssociation?.matricule || "N/A"}</p>
                    <p className="text-sm text-gray-600">Zone: {trip.zone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date: {format(new Date(trip.date), "dd/MM/yyyy")}</p>
                    <p className="text-sm text-gray-600">Statut: {trip.isActive ? "Active" : "Terminée"}</p>
                    <p className="text-sm text-gray-600">
                      Différence: {trip.deff || 0} MAD
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between items-center">
            <Button
              onClick={() => fetchTripsWithFilters(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600"
            >
              Page Suivante
            </Button>
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage} sur {pagination.totalPages} (Total: {pagination.totalItems} tournées)
            </p>
          </div>
        </>
      )}

      {isModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
              <h5 className="text-xl font-semibold text-gray-800">
                Détails de la Tournée #{selectedTrip.id}
              </h5>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700 font-medium">Camion:</p>
                  <p className="text-gray-600">{selectedTrip.TruckAssociation?.matricule || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Conducteur:</p>
                  <p className="text-gray-600">{selectedTrip.DriverAssociation?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Vendeur:</p>
                  <p className="text-gray-600">{selectedTrip.SellerAssociation?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Assistant:</p>
                  <p className="text-gray-600">{selectedTrip.AssistantAssociation?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Zone:</p>
                  <p className="text-gray-600">{selectedTrip.zone}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Date:</p>
                  <p className="text-gray-600">{format(new Date(selectedTrip.date), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Statut:</p>
                  <p className="text-gray-600">{selectedTrip.isActive ? "Active" : "Terminée"}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Différence:</p>
                  <p className="text-gray-600">{selectedTrip.deff || 0} MAD</p>
                </div>
              </div>

              {/* Products Table */}
              {selectedTrip.TripProducts && selectedTrip.TripProducts.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-lg font-medium text-gray-800 mb-2">Produits</h6>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left border-b">Désignation</th>
                          <th className="p-2 text-left border-b">Qté Sortie (Caisses)</th>
                          <th className="p-2 text-left border-b">Qté Sortie (Unités)</th>
                          <th className="p-2 text-left border-b">Qté Retour (Caisses)</th>
                          <th className="p-2 text-left border-b">Qté Retour (Unités)</th>
                          <th className="p-2 text-left border-b">Qté Vendue</th>
                          <th className="p-2 text-left border-b">Prix Unitaire (MAD)</th>
                          <th className="p-2 text-left border-b">Total (MAD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTrip.TripProducts.map((product, index) => {
                          const capacityByBox = product.ProductAssociation?.capacityByBox || 0;
                          const priceUnite = product.ProductAssociation?.priceUnite || 0;
                          const totalRevenue = product.qttVendu * priceUnite;
                          return (
                            <tr key={index} className="border-b">
                              <td className="p-2">{product.ProductAssociation?.designation || "Inconnu"}</td>
                              <td className="p-2">{product.qttOut}</td>
                              <td className="p-2">{product.qttOutUnite}</td>
                              <td className="p-2">{product.qttReutour || 0}</td>
                              <td className="p-2">{product.qttReutourUnite || 0}</td>
                              <td className="p-2">{product.qttVendu || 0}</td>
                              <td className="p-2">{priceUnite}</td>
                              <td className="p-2">{totalRevenue}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Boxes Table */}
              {selectedTrip.TripBoxes && selectedTrip.TripBoxes.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-lg font-medium text-gray-800 mb-2">Boîtes</h6>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left border-b">Désignation</th>
                          <th className="p-2 text-left border-b">Qté Initiale</th>
                          <th className="p-2 text-left border-b">Qté Entrée</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTrip.TripBoxes.map((box, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{box.BoxAssociation?.designation || "Inconnu"}</td>
                            <td className="p-2">{box.qttOut}</td>
                            <td className="p-2">{box.qttIn || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Wastes Table */}
              {selectedTrip.TripWastes && selectedTrip.TripWastes.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-lg font-medium text-gray-800 mb-2">Déchets</h6>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left border-b">Produit</th>
                          <th className="p-2 text-left border-b">Type</th>
                          <th className="p-2 text-left border-b">Quantité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTrip.TripWastes.map((waste, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{waste.WasteAssociation?.ProductAssociation?.designation || waste.product || "Inconnu"}</td>
                            <td className="p-2">{waste.type || "N/A"}</td>
                            <td className="p-2">{waste.qtt || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-gray-700 font-medium">
                    Total des déchets: {selectedTrip.totalWastes || 0} unités
                  </p>
                </div>
              )}

              {/* Charges Table */}
              {selectedTrip.TripCharges && selectedTrip.TripCharges.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-lg font-medium text-gray-800 mb-2">Charges</h6>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left border-b">Type</th>
                          <th className="p-2 text-left border-b">Montant (MAD)</th>
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
                  <p className="mt-2 text-gray-700 font-medium">
                    Total des charges: {selectedTrip.totalCharges || 0} MAD
                  </p>
                </div>
              )}

              {/* Financial Summary */}
              <div className="mt-4">
                <h6 className="text-lg font-medium text-gray-800 mb-2">Résumé Financier</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700 font-medium">Montant Total:</p>
                    <p className="text-gray-600">
                      {selectedTrip.TripProducts
                        ?.reduce((sum, p) => sum + (p.qttVendu * (p.ProductAssociation?.priceUnite || 0)), 0)
                        || "0.00"} MAD
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Montant Attendu:</p>
                    <p className="text-gray-600">
                      {selectedTrip.isActive ? "Non disponible" : (selectedTrip.waitedAmount || 0)} MAD
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Montant Reçu:</p>
                    <p className="text-gray-600">
                      {selectedTrip.isActive ? "Non disponible" : (selectedTrip.receivedAmount || 0)} MAD
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Différence:</p>
                    <p className="text-gray-600">
                      {selectedTrip.isActive ? "Non disponible" : (selectedTrip.deff || 0)} MAD
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Bénéfice:</p>
                    <p className="text-gray-600">
                      {selectedTrip.isActive ? "Non disponible" : (selectedTrip.benefit || 0)} MAD
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Fermer
                </Button>
                {!selectedTrip.isActive && invoiceData && (
                  <PrintAfternoonInvoice invoiceData={invoiceData} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeDesTournees;