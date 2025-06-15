"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

const FinishTripForm = ({
  tripDetails,
  onSubmit,
  onCancel,
  onPrevious,
  products,
  boxes,
  excludeReceivedAmount,
}) => {
  const [formData, setFormData] = useState({
    tripProducts: [],
    tripBoxes: [],
    tripWastes: [],
    tripCharges: [],
    receivedAmount: "",
  });

  useEffect(() => {
    console.log("FinishTripForm useEffect triggered", {
      tripDetails: tripDetails
        ? {
            id: tripDetails.id,
            TripProducts: tripDetails.TripProducts?.map((p) => ({
              product: p.product,
              designation: p.ProductAssociation?.designation,
            })),
          }
        : null,
      products: products?.map((p) => ({
        id: p.id,
        designation: p.designation,
      })),
      boxes: boxes?.map((b) => ({ id: b.id, designation: b.designation })),
    });

    if (tripDetails) {
      const tripProducts =
        tripDetails.TripProducts?.map((p) => {
          const productId = Number(p.product);
          const productFromProps = products.find(
            (prod) => Number(prod.id) === productId
          );
          const designation =
            p.ProductAssociation?.designation ||
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
        tripBoxes:
          tripDetails.TripBoxes?.map((b) => ({
            box_id: Number(b.box),
            designation:
              b.BoxAssociation?.designation ||
              boxes.find((box) => Number(box.id) === Number(b.box))
                ?.designation ||
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
      tripWastes: [
        ...formData.tripWastes,
        { product_id: "", type: "", qtt: "" },
      ],
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
      // Validate form data
      if (formData.tripWastes.some(w => !w.product_id || !w.type || !w.qtt)) {
        throw new Error("Tous les champs des déchets sont requis.");
      }
      if (formData.tripCharges.some(c => !c.type || !c.amount)) {
        throw new Error("Tous les champs des charges sont requis.");
      }

      const submitData = {
        tripProducts: formData.tripProducts.map((p) => ({
          product_id: p.product_id,
          qttReutour: parseInt(p.qttReutour) || 0,
          qttReutourUnite: parseInt(p.qttReutourUnite) || 0,
        })),
        tripBoxes: formData.tripBoxes.map((b) => ({
          box_id: b.box_id,
          qttIn: parseInt(b.qttIn) || 0,
        })),
        tripWastes: formData.tripWastes.map((w) => ({
          product: w.product_id,
          type: w.type,
          qtt: parseInt(w.qtt) || 0,
        })),
        tripCharges: formData.tripCharges.map((c) => ({
          type: c.type,
          amount: parseFloat(c.amount) || 0,
        })),
      };

      // Only include receivedAmount if excludeReceivedAmount is false
      if (!excludeReceivedAmount) {
        submitData.receivedAmount = parseFloat(formData.receivedAmount) || 0;
        if (submitData.receivedAmount < 0) {
          throw new Error("Le montant reçu ne peut pas être négatif.");
        }
      }

      onSubmit(submitData);
    } catch (error) {
      console.error("Form validation error:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h6 className="text-md font-medium text-gray-800">Produits Retournés:</h6>
        {formData.tripProducts.length === 0 ? (
          <p className="text-red-500 text-sm">
            Aucun produit disponible pour cette tournée.
          </p>
        ) : (
          formData.tripProducts.map((product, index) => {
            const tripProduct = tripDetails.TripProducts.find(
              (tp) => Number(tp.product) === Number(product.product_id)
            );
            return (
              <div key={index} className="border p-2 rounded space-y-2 mt-2">
                <p className="text-sm text-gray-700">
                  {product.designation} (ID: {product.product_id})
                  {tripProduct && (
                    <>
                      {" "}
                      (Sortie: {tripProduct.qttOut} caisses,{" "}
                      {tripProduct.qttOutUnite} unités)
                    </>
                  )}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label>Qté Retour (Caisses)</Label>
                    <Input
                      type="number"
                      value={product.qttReutour}
                      onChange={(e) =>
                        handleChange(
                          "tripProducts",
                          index,
                          "qttReutour",
                          e.target.value
                        )
                      }
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Qté Retour (Unités)</Label>
                    <Input
                      type="number"
                      value={product.qttReutourUnite}
                      onChange={(e) =>
                        handleChange(
                          "tripProducts",
                          index,
                          "qttReutourUnite",
                          e.target.value
                        )
                      }
                      min="0"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div>
        <h6 className="text-md font-medium text-gray-800">Boîtes Entrées:</h6>
        {formData.tripBoxes.length === 0 ? (
          <p className="text-red-500 text-sm">
            Aucune boîte disponible pour cette tournée.
          </p>
        ) : (
          formData.tripBoxes.map((box, index) => {
            const tripBox = tripDetails.TripBoxes.find(
              (tb) => Number(tb.box) === Number(box.box_id)
            );
            return (
              <div key={index} className="border p-2 rounded space-y-2 mt-2">
                <p className="text-sm text-gray-700">
                  {box.designation} (ID: {box.box_id})
                  {tripBox && <> (Sortie: {tripBox.qttOut})</>}
                </p>
                <div>
                  <Label>Qté Entrée</Label>
                  <Input
                    type="number"
                    value={box.qttIn}
                    onChange={(e) =>
                      handleChange("tripBoxes", index, "qttIn", e.target.value)
                    }
                    min="0"
                    className="mt-1"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div>
        <h6 className="text-md font-medium text-gray-800">Déchets:</h6>
        {formData.tripWastes.map((waste, index) => (
          <div key={index} className="border p-2 rounded space-y-2 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label>Produit</Label>
                <select
                  value={waste.product_id}
                  onChange={(e) =>
                    handleChange("tripWastes", index, "product_id", e.target.value)
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.designation || `ID: ${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <Input
                  value={waste.type}
                  onChange={(e) =>
                    handleChange("tripWastes", index, "type", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  value={waste.qtt}
                  onChange={(e) =>
                    handleChange("tripWastes", index, "qtt", e.target.value)
                  }
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeWaste(index)}
              className="mt-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addWaste}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Ajouter Déchet
        </Button>
      </div>

      <div>
        <h6 className="text-md font-medium text-gray-800">Charges:</h6>
        {formData.tripCharges.map((charge, index) => (
          <div key={index} className="border p-2 rounded space-y-2 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Type</Label>
                <Input
                  value={charge.type}
                  onChange={(e) =>
                    handleChange("tripCharges", index, "type", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Montant (MAD)</Label>
                <Input
                  type="number"
                  value={charge.amount}
                  onChange={(e) =>
                    handleChange("tripCharges", index, "amount", e.target.value)
                  }
                  min="0"
                  step="0.01"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeCharge(index)}
              className="mt-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={addCharge}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Ajouter Charge
        </Button>
      </div>

      {!excludeReceivedAmount && (
        <div>
          <Label>Montant Reçu (MAD)</Label>
          <Input
            type="number"
            value={formData.receivedAmount}
            onChange={(e) =>
              setFormData({ ...formData, receivedAmount: e.target.value })
            }
            min="0"
            step="0.01"
            className="mt-1"
            placeholder="Entrez le montant reçu"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        {!excludeReceivedAmount && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Précédent
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {excludeReceivedAmount ? "Suivant" : "Confirmer"}
        </Button>
      </div>
    </form>
  );
};

export default FinishTripForm;