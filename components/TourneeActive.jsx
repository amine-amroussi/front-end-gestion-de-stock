"use client";
import { useTrip } from "@/store/tripStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axiosInstance";
import PrintInvoice from "./PrintInvoice"; // Adjust the path based on your project structure

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
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, boxesRes, employeesRes] = await Promise.all([
          axiosInstance.get("/product"),
          axiosInstance.get("/box"),
          axiosInstance.get("/employee"),
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
  }, []);

  if (loadingTrip)
    return <p className="text-center text-gray-400">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  console.log("activeTrips in TourneeActive:", activeTrips);
  if (!activeTrips || activeTrips.length === 0)
    return (
      <p className="text-center text-gray-400">
        Il n'y a pas de tournées actives.
      </p>
    );

  const handleShowDetails = async (tripId) => {
    try {
      console.log("Attempting to fetch details for tripId:", tripId);
      const trip = await fetchTripById(tripId);
      setSelectedTripId(tripId);
      setTripDetails(trip);
      setIsModalOpen(true);
      console.log("Trip details:", trip);
    } catch (error) {
      console.error("Error fetching trip details:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      const errorMessage = error.message || "Erreur lors de la récupération des détails de la tournée.";
      toast.error(errorMessage);
      if (errorMessage.includes("non trouvée")) {
        await fetchActiveTrips();
        toast.info("La liste des tournées actives a été mise à jour.");
        setTripDetails(null);
      }
    }
  };

  const handleFinishTrip = async (tripId) => {
    try {
      const formData = { tripProducts: [], tripBoxes: [], receivedAmount: 0 };
      await finishTrip(tripId, formData);
      console.log(`Trip ${tripId} finished`);
      setTripDetails(null);
      setIsModalOpen(false); // Close modal after finishing
    } catch (error) {
      console.error("Error finishing trip:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTripDetails(null);
    setSelectedTripId(null);
  };

  // Map tripDetails to match PrintInvoice expected formData structure
  const mapTripDetailsToFormData = (trip) => {
    if (!trip) return null;
    return {
      truck_matricule: trip.TruckAssociation?.matricule || "N/A",
      driver_id: trip.DriverAssociation?.cin || "",
      seller_id: trip.SellerAssociation?.cin || "",
      assistant_id: trip.AssistantAssociation?.cin || "",
      date: trip.date,
      zone: trip.zone || "N/A",
      tripProducts: trip.TripProducts?.map(product => ({
        product_id: product.ProductAssociation?.id,
        qttOut: product.qttOut,
        qttOutUnite: product.qttOutUnite,
      })) || [],
      tripBoxes: trip.TripBoxes?.map(box => ({
        box_id: box.BoxAssociation?.id,
        qttOut: box.qttOut,
      })) || [],
    };
  };

  const formattedTripDetails = mapTripDetailsToFormData(tripDetails);

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
                <span className="">Camion:</span>
                <span className="text-black">
                  {trip.TruckAssociation?.matricule || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Conducteur:</span>
                <span className="">
                  {trip.DriverAssociation?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Vendeur:</span>
                <span className="">
                  {trip.SellerAssociation?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Assistant:</span>
                <span className="">
                  {trip.AssistantAssociation?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Zone:</span>
                <span className="">{trip.zone}</span>
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
                onClick={() => handleFinishTrip(trip.id)}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-sm py-1.5 rounded-md"
              >
                Terminer
              </Button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && tripDetails && (
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
              {tripDetails.TripProducts && tripDetails.TripProducts.length > 0 && (
                <div className="mt-2">
                  <h6 className="text-md font-medium text-black">Produits Sortis (Matin):</h6>
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
                        const capacityByBox = product.ProductAssociation?.capacityByBox || 0;
                        const totalUnits = product.qttOut * capacityByBox + product.qttOutUnite;
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-1">{product.ProductAssociation.designation}</td>
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
                        <td className="p-1">{tripDetails.TripProducts.length} produits</td>
                        <td className="p-1"></td>
                        <td className="p-1">
                          {tripDetails.TripProducts.reduce((sum, product) => {
                            const capacityByBox = product.ProductAssociation?.capacityByBox || 0;
                            return sum + (product.qttOut * capacityByBox + product.qttOutUnite);
                          }, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              {tripDetails.TripBoxes && tripDetails.TripBoxes.length > 0 && (
                <div className="mt-2">
                  <h6 className="text-md font-medium text-black">Boîtes Sorties (Matin):</h6>
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
                          <td className="p-1">{box.BoxAssociation.designation}</td>
                          <td className="p-1">{box.qttOut}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-medium">
                        <td className="p-1">Total</td>
                        <td className="p-1">{tripDetails.TripBoxes.length} boîtes</td>
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
                    onClick={() => handleFinishTrip(selectedTripId)}
                    className="text-sm py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    Terminer
                  </Button>
                )}
                <PrintInvoice
                  formData={formattedTripDetails}
                  products={products}
                  boxes={boxes}
                  employees={employees}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourneeActive;
