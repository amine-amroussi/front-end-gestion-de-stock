"use client";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axiosInstance";
import PrintInvoice from "./PrintInvoice.jsx";
import FinishTripForm from "./FinishTripForm";

const TourneeActive = () => {
  const {
    tripState: { activeTrips, loadingTrip, error },
    fetchTripById,
    finishTrip,
    fetchActiveTrips,
  } = useTrip();
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active trips along with other data
        const [productsRes, boxesRes, employeesRes, activeTripsRes] =
          await Promise.all([
            axiosInstance.get("/product"),
            axiosInstance.get("/box"),
            axiosInstance.get("/employee"),
            fetchActiveTrips(), // Call fetchActiveTrips to populate activeTrips state
          ]);
        setProducts(productsRes.data.data?.products || []);
        setBoxes(boxesRes.data.boxes || []);
        setEmployees(employeesRes.data.data?.employees || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Erreur lors de la récupération des données.");
      }
    };
    fetchData();
  }, [fetchActiveTrips]); // Add fetchActiveTrips as a dependency

  const calculateEstimatedRevenue = (tripProducts) => {
    return tripProducts.reduce((total, product) => {
      const capacityByBox = product.ProductAssociation?.capacityByBox || 0;
      const priceUnite = product.ProductAssociation?.priceUnite || 0;
      const totalUnits =
        (product.qttOut || 0) * capacityByBox + (product.qttOutUnite || 0);
      return total + totalUnits * priceUnite;
    }, 0);
  };

  if (loadingTrip)
    return <p className="text-center text-gray-400">Chargement...</p>;
  // if (error) return <p className="text-center text-red-500">{error}</p>;

  if (!activeTrips || activeTrips.length === 0)
    return (
      <p className="text-center text-gray-400">
        Il n'y a pas de tournées actives.
      </p>
    );

  const handleShowDetails = async (tripId) => {
    try {
      const trip = await fetchTripById(tripId);
      setSelectedTripId(tripId);
      setTripDetails(trip);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Erreur lors de la récupération des détails de la tournée.");
      if (error.message.includes("non trouvée")) {
        await fetchActiveTrips();
        toast.info("La liste des tournées actives a été mise à jour.");
        setTripDetails(null);
      }
    }
  };

  const handleFinishTrip = async (formData) => {
    try {
      console.log(
        "Calling finishTrip with tripId:",
        selectedTripId,
        "and data:",
        formData
      );
      await finishTrip(selectedTripId, formData);
      setTripDetails(null);
      setIsFinishModalOpen(false);
      setIsModalOpen(false);
      await fetchActiveTrips();
      toast.success("Tournée terminée avec succès !");
    } catch (error) {
      console.error("Error finishing trip:", error);
      toast.error("Erreur lors de la finalisation de la tournée.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTripDetails(null);
    setSelectedTripId(null);
  };

  const openFinishModal = (tripId) => {
    setSelectedTripId(tripId);
    handleShowDetails(tripId);
    setIsFinishModalOpen(true);
  };

  const mapTripDetailsToFormData = (trip) => {
    if (!trip) return null;
    return {
      truck_matricule: trip.TruckAssociation?.matricule || "N/A",
      driver_id: trip.DriverAssociation?.cin || "",
      seller_id: trip.SellerAssociation?.cin || "",
      assistant_id: trip.AssistantAssociation?.cin || "",
      date: trip.date,
      zone: trip.zone || "N/A",
      tripProducts:
        trip.TripProducts?.map((product) => ({
          product_id: product.ProductAssociation?.id,
          qttOut: product.qttOut,
          qttOutUnite: product.qttOutUnite,
        })) || [],
      tripBoxes:
        trip.TripBoxes?.map((box) => ({
          box_id: box.BoxAssociation?.id,
          qttOut: box.qttOut,
        })) || [],
    };
  };

  const formattedTripDetails = mapTripDetailsToFormData(tripDetails);
  const estimatedRevenue = tripDetails
    ? calculateEstimatedRevenue(tripDetails.TripProducts)
    : 0;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mx-auto">
        {activeTrips.map((trip) => (
          <div
            key={trip.id}
            className="flex flex-col w-75 text-black p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
              <h4 className="text-lg font-medium text-black">
                Tournée #{trip.id}
              </h4>
              <span className="text-sm text-black-400">
                {new Date(trip.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span>Camion:</span>
                <span className="text-black">
                  {trip.TruckAssociation?.matricule || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Conducteur:</span>
                <span>{trip.DriverAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Vendeur:</span>
                <span>{trip.SellerAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Assistant:</span>
                <span>{trip.AssistantAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Zone:</span>
                <span>{trip.zone}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleShowDetails(trip.id)}
                className="flex-1 text-sm py-1.5 rounded-md"
              >
                Afficher Détails
              </Button>
              <Button
                onClick={() => openFinishModal(trip.id)}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-sm py-1.5 rounded-md"
              >
                Terminer
              </Button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && tripDetails && !isFinishModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
              <h5 className="text-lg font-medium text-black">
                Détails de la Tournée #{selectedTripId}
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
                <span>{tripDetails.TruckAssociation?.matricule || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Conducteur:</span>
                <span>{tripDetails.DriverAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Vendeur:</span>
                <span>{tripDetails.SellerAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Assistant:</span>
                <span>{tripDetails.AssistantAssociation?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Zone:</span>
                <span>{tripDetails.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Date:</span>
                <span>{new Date(tripDetails.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Statut:</span>
                <span>{tripDetails.isActive ? "Active" : "Terminée"}</span>
              </div>
              {tripDetails.TripProducts &&
                tripDetails.TripProducts.length > 0 && (
                  <div className="mt-2">
                    <h6 className="text-md font-medium text-black">
                      Produits Sortis (Matin):
                    </h6>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">Désignation</th>
                          <th className="text-left p-1">Qté Caisses</th>
                          <th className="text-left p-1">Qté Unités</th>
                          <th className="text-left p-1">Unités Totales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripDetails.TripProducts.map((product, index) => {
                          const capacityByBox =
                            product.ProductAssociation?.capacityByBox || 0;
                          const totalUnits =
                            (product.qttOut || 0) * capacityByBox +
                            (product.qttOutUnite || 0);
                          return (
                            <tr key={index} className="border-b">
                              <td className="p-1">
                                {product.ProductAssociation.designation}
                              </td>
                              <td className="p-1">{product.qttOut}</td>
                              <td className="p-1">{product.qttOutUnite}</td>
                              <td className="p-1">{totalUnits}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-medium">
                          <td className="p-1">Total</td>
                          <td className="p-1">
                            {tripDetails.TripProducts.length} produits
                          </td>
                          <td className="p-1"></td>
                          <td className="p-1">
                            {tripDetails.TripProducts.reduce((sum, product) => {
                              const capacityByBox =
                                product.ProductAssociation?.capacityByBox || 0;
                              return (
                                sum +
                                ((product.qttOut || 0) * capacityByBox +
                                  (product.qttOutUnite || 0))
                              );
                            }, 0)}
                          </td>
                        </tr>
                        <tr className="border-t font-medium">
                          <td className="p-1">Revenu Estimé</td>
                          <td className="p-1" colSpan="3">
                            {estimatedRevenue.toFixed(2)} €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              {tripDetails.TripBoxes && tripDetails.TripBoxes.length > 0 && (
                <div className="mt-2">
                  <h6 className="text-md font-medium text-black">
                    Boîtes Sorties (Matin):
                  </h6>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-1">Désignation</th>
                        <th className="text-left p-1">Qté Sortie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tripDetails.TripBoxes.map((box, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-1">
                            {box.BoxAssociation.designation}
                          </td>
                          <td className="p-1">{box.qttOut}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-medium">
                        <td className="p-1">Total</td>
                        <td className="p-1">
                          {tripDetails.TripBoxes.length} boîtes
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  onClick={closeModal}
                  className="text-sm py-1.5 rounded-md bg-gray-300 hover:bg-gray-400"
                >
                  Fermer
                </Button>
                {tripDetails.isActive && (
                  <Button
                    onClick={() => setIsFinishModalOpen(true)}
                    className="text-sm py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    Terminer
                  </Button>
                )}
                <PrintInvoice
                  formData={formattedTripDetails}
                  tripDetails={tripDetails} // Pass tripDetails
                  products={products}
                  boxes={boxes}
                  employees={employees}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isFinishModalOpen && tripDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
              <h5 className="text-lg font-medium text-black">
                Terminer la Tournée #{selectedTripId}
              </h5>
              <button
                onClick={() => setIsFinishModalOpen(false)}
                className="text-black hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <FinishTripForm
              tripDetails={tripDetails}
              onSubmit={handleFinishTrip}
              onCancel={() => setIsFinishModalOpen(false)}
              products={products}
              boxes={boxes}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TourneeActive;
