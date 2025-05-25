"use client";
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
import { useState, useEffect } from "react";
import { useWastes } from "@/store/wastesStore";
import { useProduct } from "@/store/productStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AddWasteSheet = ({ open, setOpen, onWasteAdded }) => {
  const { createWaste, fetchWastes, error } = useWastes();
  const { productState: { products, loadingProduct }, fetchAllProducts } = useProduct();

  const [formData, setFormData] = useState({
    product: "",
    qtt: "",
    type: "",
  });

  useEffect(() => {
    fetchAllProducts(); // Fetch products when the sheet opens
  }, [fetchAllProducts]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Erreur lors de la gestion des déchets.");
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductChange = (value) => {
    setFormData({ ...formData, product: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWaste(formData);
      toast.success("Déchet ajouté avec succès !");
      setFormData({ product: "", qtt: "", type: "" });
      setOpen(false);
      if (onWasteAdded) onWasteAdded();
      fetchWastes();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout du déchet.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter un Déchet</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter un nouveau déchet.
          </SheetDescription>
        </SheetHeader>
        {error && <p className="text-red-500 px-4">{error.message}</p>}
        <form className="text-sm flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="product">Produit</Label>
            <Select
              value={formData.product}
              onValueChange={handleProductChange}
              name="product"
              disabled={loadingProduct}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un produit" />
              </SelectTrigger>
              <SelectContent>
                {loadingProduct ? (
                  <SelectItem value="loading" disabled>
                    Chargement...
                  </SelectItem>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.designation}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Aucun produit disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="qtt">Quantité</Label>
            <Input
              id="qtt"
              type="number"
              placeholder="Entrez la quantité"
              name="qtt"
              value={formData.qtt}
              onChange={handleChange}
              disabled={loadingProduct}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              type="text"
              placeholder="Entrez le type (ex: Damaged)"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loadingProduct}
            />
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingProduct}>
              {loadingProduct ? "Ajout..." : "Ajouter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddWasteSheet;
