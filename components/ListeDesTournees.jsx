"use client";
import { useEffect } from "react";
import { useTrip } from "@/store/tripStore";

const ListeDesTournees = () => {
  const { tripState: { trips, loadingTrip, error, pagination }, fetchAllTrips, fetchTripById, nextPage } = useTrip();

  useEffect(() => {
    fetchAllTrips(pagination.currentPage, pagination.pageSize);
  }, [fetchAllTrips, pagination.currentPage, pagination.pageSize]);

  const handleTripClick = async (tripId) => {
    try {
      const parsedTripId = parseInt(tripId, 10);
      console.log("Clicking trip with ID:", parsedTripId, "Type:", typeof parsedTripId);
      if (isNaN(parsedTripId)) {
        console.error("Invalid trip ID:", tripId);
        return;
      }
      const trip = await fetchTripById(parsedTripId);
      console.log("Selected trip:", trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
    }
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
    </div>
  );
};

export default ListeDesTournees;
