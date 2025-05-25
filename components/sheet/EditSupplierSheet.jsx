'use client'
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
import { useEffect, useState } from "react";
import { useSupplier } from "@/store/supplierStore";

const EditSupplierSheet = ({ open, setOpen, id, onSupplierEdited }) => {
  const {
    fetchSupplier,
    editSupplier,
    supplierState: { selectedSupplier, loadingSupplier, error },
  } = useSupplier();

  const [supplierInfo, setSupplierInfo] = useState({
    name: "",
    tel: "",
    address: "",
  });

  useEffect(() => {
    if (id) {
      fetchSupplier(id);
    }
  }, [id, fetchSupplier]);

  useEffect(() => {
    if (selectedSupplier) {
      setSupplierInfo({
        name: selectedSupplier.name || "",
        tel: selectedSupplier.tel || "",
        address: selectedSupplier.address || "",
      });
    }
  }, [selectedSupplier]);

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await editSupplier(supplierInfo, id);
      setOpen(false);
      setSupplierInfo({
        name: "",
        tel: "",
        address: "",
      });
      if (onSupplierEdited) onSupplierEdited();
    } catch (err) {
      console.error("Failed to edit supplier:", err);
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
          <SheetTitle>Modifier un Fournisseur</SheetTitle>
          <SheetDescription>
            Vous pouvez modifier un fournisseur en changeant les informations du formulaire.
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
              {loadingSupplier ? "Modification..." : "Modifier"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditSupplierSheet;
