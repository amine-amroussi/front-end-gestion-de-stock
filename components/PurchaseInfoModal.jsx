"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";

const PurchaseInfoModal = ({ open, setOpen, purchase }) => {
  if (!open || !purchase) return null;

  const totalBoxesIn = purchase.BoxAssociation?.reduce((sum, pb) => sum + (pb.qttIn || 0), 0) || 0;
  const totalBoxesOut = purchase.BoxAssociation?.reduce((sum, pb) => sum + (pb.qttOut || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Détails de l'Achat #{purchase.id}</h2>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <p><strong>Fournisseur:</strong></p>
            <p>{purchase.SupplierAssociation?.name || "N/A"}</p>
            <p><strong>Date:</strong></p>
            <p>{format(new Date(purchase.date), "dd/MM/yyyy")}</p>
            <p><strong>Total:</strong></p>
            <p>{purchase.total} MAD</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Produits:</h3>
            {purchase.ProductAssociation?.length > 0 ? (
              <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté (Caisses)</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté (Unités)</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.ProductAssociation.map((prod, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">{prod.ProductAssociation?.designation || "N/A"}</td>
                      <td className="border border-gray-200 px-4 py-2">{prod.qtt || 0}</td>
                      <td className="border border-gray-200 px-4 py-2">{prod.qttUnite || 0}</td>
                      <td className="border border-gray-200 px-4 py-2">{(prod.price || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun produit</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Caisses:</h3>
            {purchase.BoxAssociation?.length > 0 ? (
              <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté Entrée</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté Sortie</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.BoxAssociation.map((box, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">{box.BoxAssociation?.designation || "N/A"}</td>
                      <td className="border border-gray-200 px-4 py-2">{box.qttIn || 0}</td>
                      <td className="border border-gray-200 px-4 py-2">{box.qttOut || 0}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="border border-gray-200 px-4 py-2">Total</td>
                    <td className="border border-gray-200 px-4 py-2">{totalBoxesIn}</td>
                    <td className="border border-gray-200 px-4 py-2">{totalBoxesOut}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>Aucune caisse</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Déchets:</h3>
            {(purchase.purchaseWaste?.length > 0 || []).length > 0 ? (
              <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.purchaseWaste?.map((waste, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">{waste.product || "N/A"}</td>
                      <td className="border border-gray-200 px-4 py-2">{waste.qtt || 0}</td>
                      <td className="border border-gray-200 px-4 py-2">{waste.type || "N/A"}</td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            ) : (
              <p>Aucun déchet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInfoModal;
