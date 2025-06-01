
"use client";
import { Plus, ChevronRight, ChevronLeft, Eye, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { usePurchase } from "@/store/purchaseStore";
import AddPurchase from "./AddPurchase";
import PurchaseInfoModal from "./PurchaseInfoModal";
import { Button } from "./ui/button";
import { format } from "date-fns";
import PrintInvoice from "./PrintInvoice.js";

const ListeDesPurchases = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const {
    purchaseState: { purchases, loadingPurchase, error, pagination },
    fetchAllPurchases,
    nextPage,
  } = usePurchase();

  useEffect(() => {
    fetchAllPurchases(pagination.currentPage, pagination.pageSize);
  }, [fetchAllPurchases, pagination.currentPage, pagination.pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllPurchases(newPage, pagination.pageSize);
    }
  };

  const handlePurchaseAdded = () => {
    fetchAllPurchases(pagination.currentPage, pagination.pageSize);
    setAddOpen(false);
  };

  const handleInfoClick = (purchase) => {
    setSelectedPurchase(purchase);
    setInfoOpen(true);
  };

  const handlePrintInvoice = (purchase) => {
    PrintInvoice(purchase);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === pagination.currentPage ? "default" : "outline"}
          onClick={() => handlePageChange(i)}
          className="mx-1 h-8 w-8"
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setAddOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Effectuer un achat
        </Button>
      </div>

      {loadingPurchase && <p className="text-center text-gray-500">Chargement des achats...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loadingPurchase && !error && purchases.length === 0 && (
        <p className="text-center text-gray-500">Aucun achat trouvé.</p>
      )}

      <AddPurchase open={addOpen} setOpen={setAddOpen} onPurchaseAdded={handlePurchaseAdded} />
      <PurchaseInfoModal
        open={infoOpen}
        setOpen={setInfoOpen}
        purchase={selectedPurchase}
      />

      {!loadingPurchase && !error && purchases.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produits
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caisses (In/Out)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => {
                const totalBoxesIn = purchase.BoxAssociation?.reduce((sum, pb) => sum + pb.qttIn, 0) || 0;
                const totalBoxesOut = purchase.BoxAssociation?.reduce((sum, pb) => sum + pb.qttOut, 0) || 0;
                return (
                  <tr
                    key={purchase.id}
                    className="text-sm text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{purchase.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {purchase.SupplierAssociation?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(purchase.date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{purchase.total} MAD</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {purchase.ProductAssociation?.length || 0} produit(s)
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {totalBoxesIn}/{totalBoxesOut}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInfoClick(purchase)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintInvoice(purchase)}
                          className="flex items-center gap-1"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          {renderPageNumbers()}
          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pagination.currentPage === pagination.totalPages}
            className="h-8"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {pagination.totalItems > 0 && (
        <p className="text-center mt-2 text-sm text-gray-500">
          Affichage de {purchases.length} sur {pagination.totalItems} achats (Page{" "}
          {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesPurchases;