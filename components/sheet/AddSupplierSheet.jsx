import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { useSupplier } from "@/store/supplierStore";

const AddSupplierSheet = ({ open, setOpen, onSupplierAdded }) => {
  const { createSupplier, supplierState: { loadingSupplier, error } } = useSupplier();

  const [supplierInfo, setSupplierInfo] = useState({
    name: "",
    tel: "",
    address: "",
  });

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await createSupplier(supplierInfo);
      setOpen(false);
      setSupplierInfo({
        name: "",
        tel: "",
        address: "",
      });
      if (onSupplierAdded) onSupplierAdded();
    } catch (err) {
      console.error("Failed to add supplier:", err);
    }
  };

  const handleChange = (e) => {
    setSupplierInfo({
      ...supplierInfo,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter un Fournisseur</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter un nouveau fournisseur.
          </SheetDescription>
        </SheetHeader>
        {error && <p className="text-red-500 px-4">{error}</p>}
        <form className="text-sm flex flex-col gap-4" onSubmit={handleClick}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nom du fournisseur"
              name="name"
              value={supplierInfo.name}
              onChange={handleChange}
              disabled={loadingSupplier}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="tel">Téléphone</Label>
            <Input
              id="tel"
              type="text"
              placeholder="Numéro de téléphone"
              name="tel"
              value={supplierInfo.tel}
              onChange={handleChange}
              disabled={loadingSupplier}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              type="text"
              placeholder="Adresse"
              name="address"
              value={supplierInfo.address}
              onChange={handleChange}
              disabled={loadingSupplier}
            />
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingSupplier}>
              {loadingSupplier ? "Ajout..." : "Ajouter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddSupplierSheet;
