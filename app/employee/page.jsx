"use client";
import ListeDesEmployes from "@/components/ListeDesEmployes";
import AddEmployeeSheet from "@/components/sheet/AddEmployeeSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List } from "lucide-react";
import { useState } from "react";

const EmployeePage = () => {
  const [open, setOpen] = useState(false);

  return (
    <main className="w-full">
      <AddEmployeeSheet open={open} setOpen={setOpen} />
      <h1 className="text-xl font-bold capitalize">Gestion des employés</h1>
      <div className="my-5 w-full flex items-center justify-between ">
        <Input
          className={"w-64 bg-gray-100"}
          name="search"
          type="search"
          placeholder="Rechercher un Employé"
        />
        <Button className="cursor-pointer" onClick={() => setOpen(true)}>
          Ajouter un employé
        </Button>
      </div>
      <h3 className="mb-4 font-semibold"> Liste des employés</h3>
      {/* <ListeDesProduits /> */}
      {/* <ListeCrates /> */}
      <ListeDesEmployes />
    </main>
  );
};

export default EmployeePage;
