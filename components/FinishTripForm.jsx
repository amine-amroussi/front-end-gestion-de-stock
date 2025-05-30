"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

const FinishTripForm = ({ tripDetails, onSubmit, onCancel, products, boxes }) => {
  const [formData, setFormData] = useState({
    tripProducts: [],
    tripBoxes: [],
    tripWastes: [],
    tripCharges: [],
    receivedAmount: "",
  });

  useEffect(() => {
    if (tripDetails) {
      console.log("Trip Products:", tripDetails.TripProducts);
      setFormData({
        tripProducts: tripDetails.TripProducts.map(p => ({
          product_id: parseInt(p.product),
          designation: products.find(prod => prod.id === parseInt(p.product))?.designation || "Inconnu",
          priceUnite: products.find(prod => prod.id === parseInt(p.product))?.priceUnite || 0,
          capacityByBox: products.find(prod => prod.id === parseInt(p.product))?.capacityByBox || 0,
          qttReutour: 0,
          qttReutourUnite: 0,
        })),
        tripBoxes: tripDetails.TripBoxes.map(b => ({
          box_id: parseInt(b.box),
          designation: boxes.find(box => box.id === parseInt(b.box))?.designation || "Inconnu",
          qttIn: 0,
        })),
        tripWastes: [],
        tripCharges: [],
        receivedAmount: "",
      });
    }
  }, [tripDetails, products, boxes]);

  const handleChange = (type, index, field, value) => {
    const updatedForm = { ...formData };
    updatedForm[type][index] = { ...updatedForm[type][index], [field]: value };
    setFormData(updatedForm);
  };

  const calculateSoldUnits = (product, index) => {
    const { capacityByBox } = product;
    const qttOut = tripDetails.TripProducts[index].qttOut || 0;
    const qttOutUnite = tripDetails.TripProducts[index].qttOutUnite || 0;
    const qttReutour = parseInt(product.qttReutour) || 0;
    const qttReutourUnite = parseInt(product.qttReutourUnite) || 0;
    const totalUnitsOut = qttOut * capacityByBox + qttOutUnite;
    const totalUnitsReturned = qttReutour * capacityByBox + qttReutourUnite;
    return totalUnitsOut - totalUnitsReturned;
  };

  const addWaste = () => {
    setFormData({
      ...formData,
      tripWastes: [...formData.tripWastes, { product_id: "", type: "", qtt: "" }],
    });
  };

  const removeWaste = (index) => {
    setFormData({
      ...formData,
      tripWastes: formData.tripWastes.filter((_, i) => i !== index),
    });
  };

  const addCharge = () => {
    setFormData({
      ...formData,
      tripCharges: [...formData.tripCharges, { type: "", amount: "" }],
    });
  };

  const removeCharge = (index) => {
    setFormData({
      ...formData,
      tripCharges: formData.tripCharges.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const submitData = {
        tripProducts: formData.tripProducts.map(p => {
          const productExists = products.some(prod => prod.id === p.product_id);
          if (!productExists) {
            console.warn(`Produit invalide (ID: ${p.product_id}) ignoré. Vérifiez les données des produits.`);
            return null;
          }
          const qttReutour = parseInt(p.qttReutour) || 0;
          const qttReutourUnite = parseInt(p.qttReutourUnite) || 0;
          if (qttReutour < 0 || qttReutourUnite < 0) {
            throw new Error(`Quantités retournées invalides pour le produit ${p.designation}`);
          }
          return {
            product_id: p.product_id,
            qttReutour,
            qttReutourUnite,
          };
        }).filter(p => p !== null),
        tripBoxes: formData.tripBoxes.map(b => {
          if (!boxes.some(box => box.id === b.box_id)) {
            throw new Error(`Boîte invalide (ID: ${b.box_id})`);
          }
          const qttIn = parseInt(b.qttIn) || 0;
          if (qttIn < 0) {
            throw new Error(`Quantité entrée invalide pour la boîte ${b.designation}`);
          }
          return {
            box_id: b.box_id,
            qttIn,
          };
        }),
        tripWastes: formData.tripWastes.map(w => {
          if (!w.product_id || !w.type || w.qtt === "") {
            throw new Error("Tous les champs des déchets (produit, type, quantité) sont requis.");
          }
          const qtt = parseInt(w.qtt) || 0;
          if (qtt <= 0) {
            throw new Error("La quantité des déchets doit être supérieure à 0.");
          }
          return {
            product: w.product_id,
            type: w.type,
            qtt,
          };
        }),
        tripCharges: formData.tripCharges.map(c => {
          if (!c.type || c.amount === "") {
            throw new Error("Tous les champs des charges (type, montant) sont requis.");
          }
          const amount = parseFloat(c.amount) || 0;
          if (amount <= 0) {
            throw new Error("Le montant des charges doit être supérieur à 0.");
          }
          return {
            type: c.type,
            amount,
          };
        }),
        receivedAmount: parseFloat(formData.receivedAmount) || 0,
      };
      console.log("Submitting finishTrip data:", submitData);
      onSubmit(submitData);
    } catch (error) {
      console.error("Form validation error:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h6 className="text-md font-medium text-black">Produits Retournés:</h6>
        {formData.tripProducts.map((product, index) => {
          const soldUnits = calculateSoldUnits(product, index);
          const totalPrice = soldUnits * product.priceUnite;
          return (
            <div key={index} className="border p-2 rounded space-y-2 mt-2">
              <p>
                {product.designation} (ID: {product.product_id})
                (Sortie: {tripDetails.TripProducts[index].qttOut} caisses,{" "}
                {tripDetails.TripProducts[index].qttOutUnite} unités)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Qté Retour (Caisses)</Label>
                  <Input
                    type="number"
                    value={product.qttReutour}
                    onChange={(e) => handleChange("tripProducts", index, "qttReutour", e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Qté Retour (Unités)</Label>
                  <Input
                    type="number"
                    value={product.qttReutourUnite}
                    onChange={(e) => handleChange("tripProducts", index, "qttReutourUnite", e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Qté Vendue (Unités)</Label>
                  <Input
                    type="text"
                    value={soldUnits}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Prix Unitaire (MAD)</Label>
                  <Input
                    type="text"
                    value={product.priceUnite}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Prix Total (MAD)</Label>
                  <Input
                    type="text"
                    value={totalPrice}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h6 className="text-md font-medium text-black">Boîtes Entrées:</h6>
        {formData.tripBoxes.map((box, index) => (
          <div key={index} className="border p-2 rounded space-y-2 mt-2">
            <p>
              {box.designation} (ID: {box.box_id})
              (Qté Initiale: {tripDetails.TripBoxes[index].qttOut})
            </p>
            <div>
              <Label>Qté Entrée</Label>
              <Input
                type="number"
                value={box.qttIn}
                onChange={(e) => handleChange("tripBoxes", index, "qttIn", e.target.value)}
                min="0"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <h6 className="text-md font-medium text-black">Déchets:</h6>
        {formData.tripWastes.map((waste, index) => (
          <div key={index} className="border p-2 rounded space-y-2 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Produit</Label>
                <select
                  value={waste.product_id}
                  onChange={(e) => handleChange("tripWastes", index, "product_id", e.target.value)}
                  className="w-full border rounded p-1"
                >
                  <option value="">Sélectionnez</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.designation}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <Input
                  value={waste.type}
                  onChange={(e) => handleChange("tripWastes", index, "type", e.target.value)}
                />
              </div>
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  value={waste.qtt}
                  onChange={(e) => handleChange("tripWastes", index, "qtt", e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={() => removeWaste(index)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addWaste} className="mt-2">
          <Plus className="w-4 h-4" /> Ajouter Déchet
        </Button>
      </div>

      <div>
        <h6 className="text-md font-medium text-black">Charges:</h6>
        {formData.tripCharges.map((charge, index) => (
          <div key={index} className="border p-2 rounded space-y-2 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Type</Label>
                <Input
                  value={charge.type}
                  onChange={(e) => handleChange("tripCharges", index, "type", e.target.value)}
                />
              </div>
              <div>
                <Label>Montant (MAD)</Label>
                <Input
                  type="number"
                  value={charge.amount}
                  onChange={(e) => handleChange("tripCharges", index, "amount", e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={() => removeCharge(index)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addCharge} className="mt-2">
          <Plus className="w-4 h-4" /> Ajouter Charge
        </Button>
      </div>

      <div>
        <Label>Montant Reçu (MAD)</Label>
        <Input
          type="number"
          value={formData.receivedAmount}
          onChange={(e) => setFormData({ ...formData, receivedAmount: e.target.value })}
          min="0"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Confirmer</Button>
      </div>
    </form>
  );
};

export default FinishTripForm;