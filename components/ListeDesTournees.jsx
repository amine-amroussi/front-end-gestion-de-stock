"use client";
import { useEffect, useState } from "react";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import PrintAfternoonInvoice from "./PrintAfternoonInvoice";

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
      console.log(`Fetching trip with ID: ${parsedTripId}`);
      const trip = await fetchTripById(parsedTripId);
      console.log("Fetched trip data:", JSON.stringify(trip, null, 2));
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
            totalRevenue: p.qttVendu * (p.ProductAssociation?.priceUnite || 0),
          })),
          boxes: trip.TripBoxes.map(b => ({
            designation: b.BoxAssociation?.designation,
            qttOut: b.qttOut,
            qttIn: b.qttIn,
          })),
          wastes: trip.TripWastes.map(w => ({
            product: w.WasteAssociation?.ProductAssociation?.designation || w.product || "Inconnu",
            type: w.type,
            qtt: w.qtt,
          })) || [],
          charges: trip.TripCharges.map(c => ({
            type: c.ChargeAssociation?.type || "N/A",
            amount: c.amount,
          })) || [],
          totals: {
            waitedAmount: trip.waitedAmount,
            receivedAmount: trip.receivedAmount,
            benefit: trip.benefit,
            deff: trip.deff,
            totalCharges: trip.totalCharges,
            totalWastes: trip.totalWastes,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching trip:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Erreur lors de la récupération des détails de la tournée: " + error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
    setInvoiceData(null);
  };

  if (loadingTrip) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Liste des Tournées</h2>
      {trips.length === 0 ? (
        <p className="text-center text-gray-500">Aucune tournée disponible.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className="border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleTripClick(trip.id)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">ID: {trip.id}</p>
                    <p className="text-sm text-gray-600">Camion: {trip.TruckAssociation?.matricule || "N/A"}</p>
                    <p className="text-sm text-gray-600">Zone: {trip.zone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date: {new Date(trip.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Statut: {trip.isActive ? "Active" : "Terminée"}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={nextPage}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
            >
              Page Suivante
            </button>
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
                  <p className="text-gray-600">{new Date(selectedTrip.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Statut:</p>
                  <p className="text-gray-600">{selectedTrip.isActive ? "Active" : "Terminée"}</p>
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
                          const totalUnitsOut = product.qttOut * capacityByBox + product.qttOutUnite;
                          const totalUnitsRetour = (product.qttReutour || 0) * capacityByBox + (product.qttReutourUnite || 0);
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
                            <td className="p-2">{(charge.amount || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-gray-700 font-medium">
                    Total des charges: {(selectedTrip.totalCharges || 0)} MAD
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

              {/* Actions */}
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