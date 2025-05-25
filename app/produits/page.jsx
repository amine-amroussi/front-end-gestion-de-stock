'use client'
import ListeDesProduits from "@/components/ListeDesProduits";
import AddProductSheet from "@/components/sheet/AddProductSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";


const Product = () => {
  const [open, setOpen] = useState(false);

  return (
    <main className="w-full">
      <AddProductSheet open={open} setOpen={setOpen}  />
      <h1 className="text-xl font-bold capitalize">Gestion des produits</h1>
      <div className="my-5 w-full flex items-center justify-between ">
        <Input
          className={"w-64 bg-gray-100"}
          name="search"
          type="search"
          placeholder="Rechercher un produit"
        />
        <Button className="cursor-pointer" onClick={() => setOpen(true)}>
          Ajouter un produit
        </Button>
      </div>
      <h3 className="mb-4 font-semibold"> Liste des produits</h3>
      <ListeDesProduits />
      {/* <ListeCrates /> */}
    </main>
  );
};

export default Product;
