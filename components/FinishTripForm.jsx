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
    console.log("FinishTripForm useEffect triggered", {
      tripDetails: tripDetails ? {
        id: tripDetails.id,
        TripProducts: tripDetails.TripProducts?.map(p => ({
          product: p.product,
          designation: p.ProductAssociation?.designation,
        })),
      } : null,
      products: products?.map(p => ({ id: p.id, designation: p.designation })),
      boxes: boxes?.map(b => ({ id: b.id, designation: b.designation })),
    });

    if (tripDetails) {
      const tripProducts = tripDetails.TripProducts?.map(p => {
        const productId = Number(p.product);
        const productFromProps = products.find(prod => Number(prod.id) === productId);
        const designation = p.ProductAssociation?.designation || 
                           productFromProps?.designation || 
                           "Produit inconnu";
        return {
          product_id: productId,
          designation,
          qttReutour: 0,
          qttReutourUnite: 0,
        };
      }) || [];

      setFormData({
        tripProducts,
        tripBoxes: tripDetails.TripBoxes?.map(b => ({
          box_id: Number(b.box),
          designation: b.BoxAssociation?.designation || 
                      boxes.find(box => Number(box.id) === Number(b.box))?.designation || 
                      "Boîte inconnue",
          qttIn: 0,
        })) || [],
        tripWastes: [],
        tripCharges: [],
        receivedAmount: "",
      });

      if (!tripProducts.length) {
        console.warn("No trip products found in tripDetails");
        toast.warning("Aucun produit associé à cette tournée.");
      }
    }
  }, [tripDetails, products, boxes]);

  const handleChange = (type, index, field, value) => {
    const updatedForm = { ...formData };
    updatedForm[type][index] = { ...updatedForm[type][index], [field]: value };
    setFormData(updatedForm);
    console.log(`Updated ${type}[${index}].${field}:`, value);
  };

  const addWaste = () => {
    setFormData({
      ...formData,
      tripWastes: [...formData.tripWastes, { product_id: "", type: "", qtt: "" }],
    });
    console.log("Added waste entry");
  };

  const removeWaste = (index) => {
    setFormData({
      ...formData,
      tripWastes: formData.tripWastes.filter((_, i) => i !== index),
    });
    console.log("Removed waste entry:", index);
  };

  const addCharge = () => {
    setFormData({
      ...formData,
      tripCharges: [...formData.tripCharges, { type: "", amount: "" }],
    });
    console.log("Added charge entry");
  };

  const removeCharge = (index) => {
    setFormData({
      ...formData,
      tripCharges: formData.tripCharges.filter((_, i) => i !== index),
    });
    console.log("Removed charge entry:", index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      console.log("Submitting form with data:", {
        tripProducts: formData.tripProducts,
        products: products.map(p => ({ id: p.id, designation: p.designation })),
      });

      const submitData = {
        tripProducts: formData.tripProducts.map(p => {
          // Skip validation if ProductAssociation exists in tripDetails
          const tripProduct = tripDetails.TripProducts.find(tp => Number(tp.product) === Number(p.product_id));
          if (!tripProduct && !products.some(prod => Number(prod.id) === Number(p.product_id))) {
            console.warn(`Invalid product ID: ${p.product_id} not found in products or tripDetails`);
            throw new Error(`Produit invalide (ID: ${p.product_id})`);
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
        }),
        tripBoxes: formData.tripBoxes.map(b => {
          if (!boxes.some(box => Number(box.id) === Number(b.box_id))) {
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
        {formData.tripProducts.length === 0 ? (
          <p className="text-red-500 text-sm">Aucun produit disponible pour cette tournée.</p>
        ) : (
          formData.tripProducts.map((product, index) => (
            <div key={index} className="border p-2 rounded space-y-2 mt-2">
              <p>
                {product.designation} (ID: {product.product_id})
                {tripDetails.TripProducts[index] && (
                  <>
                    (Sortie: {tripDetails.TripProducts[index].qttOut} caisses,{" "}
                    {tripDetails.TripProducts[index].qttOutUnite} unités)
                  </>
                )}
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
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h6 className="text-md font-medium text-black">Boîtes Entrées:</h6>
        {formData.tripBoxes.map((box, index) => (
          <div key={index} className="border p-2 rounded space-y-2 mt-2">
            <p>
              {box.designation} (ID: {box.box_id})
              {tripDetails.TripBoxes[index] && (
                <> (Sortie: {tripDetails.TripBoxes[index].qttOut})</>
              )}
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
                    <option key={p.id} value={p.id}>{p.designation || `ID: ${p.id}`}</option>
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