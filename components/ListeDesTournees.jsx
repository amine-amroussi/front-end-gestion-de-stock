"use client";
import { useEffect, useState } from "react";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import PrintAfternoonInvoice from "./PrintAfternoonInvoice";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";

const ListeDesTournees = () => {
  const { tripState: { trips, loadingTrip, error, pagination }, fetchAllTrips, fetchTripById, nextPage } = useTrip();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchAllTrips(pagination.currentPage, pagination.pageSize);
  }, [fetchAllTrips, pagination.currentPage, pagination.pageSize]);

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
        const response = await axiosInstance.get(`/trip/invoice/${parsedTripId}?type=afternoon`);
        setInvoiceData(response.data.invoice);
      }
    } catch (error) {
      console.error("Error fetching trip or invoice:", error);
      toast.error("Erreur lors de la récupération des détails de la tournée ou de la facture.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
    setInvoiceData(null);
  };

  if (loadingTrip) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Liste des Tournées</h2>
      {trips.length === 0 ? (
        <p>Aucune tournée disponible.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className="border p-2 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => handleTripClick(trip.id)}
              >
                <p>ID: {trip.id}</p>
                <p>Camion: {trip.TruckAssociation?.matricule || "N/A"}</p>
                <p>Date: {new Date(trip.date).toLocaleDateString()}</p>
                <p>Zone: {trip.zone}</p>
                <p>Statut: {trip.isActive ? "Active" : "Terminée"}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <button
              onClick={nextPage}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Page Suivante
            </button>
            <p>
              Page {pagination.currentPage} sur {pagination.totalPages} (Total: {pagination.totalItems} tournées)
            </p>
          </div>
        </>
      )}

      {isModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
              <h5 className="text-lg font-medium text-black">
                Détails de la Tournée #{selectedTrip.id}
              </h5>
              <button
                onClick={closeModal}
                className="text-black hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-black">Camion:</span>
                <span>{selectedTrip.TruckAssociation?.matricule || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Conducteur:</span>
                <span>{selectedTrip.DriverAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Vendeur:</span>
                <span>{selectedTrip.SellerAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Assistant:</span>
                <span>{selectedTrip.AssistantAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Zone:</span>
                <span>{selectedTrip.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Date:</span>
                <span>{new Date(selectedTrip.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Statut:</span>
                <span>{selectedTrip.isActive ? "Active" : "Terminée"}</span>
              </div>
              {selectedTrip.TripProducts && selectedTrip.TripProducts.length > 0 ? (
                <div className="mt-2">
                  <h6 className="text-md font-medium text-black">Produits:</h6>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-1">Désignation</th>
                        <th className="text-left p-1">Qté Sortie (Caisses)</th>
                        <th className="text-left p-1">Qté Sortie (Unités)</th>
                        <th className="text-left p-1">Qté Retour (Caisses)</th>
                        <th className="text-left p-1">Qté Retour (Unités)</th>
                        <th className="text-left p-1">Qté Vendue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrip.TripProducts.map((product, index) => {
                        const capacityByBox = product.ProductAssociation?.capacityByBox || 0;
                        const totalUnitsOut = product.qttOut * capacityByBox + product.qttOutUnite;
                        const totalUnitsRetour = (product.qttReutour || 0) * capacityByBox + (product.qttReutourUnite || 0);
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-1">{product.ProductAssociation.designation}</td>
                            <td className="p-1">{product.qttOut}</td>
                            <td className="p-1">{product.qttOutUnite}</td>
                            <td className="p-1">{product.qttReutour || 0}</td>
                            <td className="p-1">{product.qttReutourUnite || 0}</td>
                            <td className="p-1">{product.qttVendu || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">Aucun produit enregistré.</div>
              )}
              {selectedTrip.TripBoxes && selectedTrip.TripBoxes.length > 0 ? (
                <div className="mt-2">
                  <h6 className="text-md font-medium text-black">Boîtes:</h6>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-1">Désignation</th>
                        <th className="text-left p-1">Qté Sortie</th>
                        <th className="text-left p-1">Qté Entrée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrip.TripBoxes.map((box, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-1">{box.BoxAssociation.designation}</td>
                          <td className="p-1">{box.qttOut}</td>
                          <td className="p-1">{box.qttIn || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">Aucune boîte enregistrée.</div>
              )}
              {invoiceData && (
                <>
                  <div className="mt-2">
                    <h6 className="text-md font-medium text-black">Résumé Financier:</h6>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Montant Attendu:</span>
                        <span>{(invoiceData.totals?.waitedAmount || 0)} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant Reçu:</span>
                        <span>{(invoiceData.totals?.receivedAmount || 0)} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bénéfice:</span>
                        <span>{(invoiceData.totals?.benefit || 0)} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Différence:</span>
                        <span>{(invoiceData.totals?.deff || 0)} MAD</span>
                      </div>
                    </div>
                  </div>
                  {invoiceData.wastes && invoiceData.wastes.length > 0 ? (
                    <div className="mt-2">
                      <h6 className="text-md font-medium text-black">Déchets:</h6>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-1">Produit</th>
                            <th className="text-left p-1">Type</th>
                            <th className="text-left p-1">Quantité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.wastes.map((waste, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-1">{waste.product}</td>
                              <td className="p-1">{waste.type}</td>
                              <td className="p-1">{waste.qtt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">Aucun déchet enregistré.</div>
                  )}
                  {invoiceData.charges && invoiceData.charges.length > 0 ? (
                    <div className="mt-2">
                      <h6 className="text-md font-medium text-black">Charges:</h6>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-1">Type</th>
                            <th className="text-left p-1">Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.charges.map((charge, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-1">{charge.type}</td>
                              <td className="p-1">{charge.amount} MAD</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">Aucune charge enregistrée.</div>
                  )}
                </>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  onClick={closeModal}
                  className="text-sm py-1.5 rounded-md bg-gray-300 hover:bg-gray-400"
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