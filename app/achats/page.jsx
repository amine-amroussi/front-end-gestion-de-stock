"use client";
import ListeDesPurchases from "@/components/ListeDesPurchases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const PurchasePage = () => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <main className="w-full p-6">
      <h1 className="text-2xl font-bold capitalize">Gestion des Achats</h1>
      <div className="my-6 flex items-center justify-between">
        <Input
          className="w-64 bg-gray-50"
          name="search"
          type="search"
          placeholder="Rechercher un achat..."
          disabled // Placeholder for future implementation
        />
        <Button onClick={() => setAddOpen(true)}>Effectuer un Achat</Button>
      </div>
      <ListeDesPurchases addOpen={addOpen} setAddOpen={setAddOpen} />
    </main>
  );
};

export default PurchasePage;