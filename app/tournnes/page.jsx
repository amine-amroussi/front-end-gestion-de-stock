"use client";
import { useEffect, useState } from "react";
import { useTrip } from "@/store/tripStore";
import TourneeActive from "@/components/TourneeActive";
import ListeDesTournees from "@/components/ListeDesTournees";
import StartTripForm from "@/components/StartTripForm";
import { Button } from "@/components/ui/button";

const TripPage = () => {
  const { tripState: { activeTrips }, fetchAllTrips, fetchActiveTrips, startTrip } = useTrip();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchAllTrips();
    fetchActiveTrips(); // Changed from fetchActiveTrip
  }, [fetchAllTrips, fetchActiveTrips]); // Updated dependency

  const handleStartNewTrip = () => {
    setIsFormOpen(true);
  };

  const handleTripStarted = async (formData) => {
    try {
      await startTrip(formData);
      setIsFormOpen(false);
      await fetchActiveTrips(); // Changed from fetchActiveTrip
    } catch (error) {
      console.error("Error starting trip:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tournées</h1>
      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tournées Actives</h2>
            <Button onClick={handleStartNewTrip}>
              Démarrer une Nouvelle Tournée
            </Button>
          </div>
          <TourneeActive />
        </section>
        <section>
          <ListeDesTournees />
        </section>
      </div>
      <StartTripForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onTripStarted={handleTripStarted}
      />
    </div>
  );
};

export default TripPage;
