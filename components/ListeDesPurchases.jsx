"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronRight, ChevronLeft, Eye, Printer, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { usePurchase } from "@/store/purchaseStore";
import AddPurchase from "./AddPurchase";
import AddBoxWastePurchase from "./AddBoxWastePurchase";
import PurchaseInfoModal from "./PurchaseInfoModal";
import PrintInvoice from "./PrintInvoice";

const FilterSection = ({ filters, setFilters, applyFilters, resetFilters, showFilters, toggleFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Button
        onClick={toggleFilters}
        className="flex items-center gap-2"
        variant={showFilters ? "default" : "outline"}
      >
        <Filter className="size-4" />
        {showFilters ? "Masquer Filtres" : "Filtres"}
      </Button>
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">
                Date Début
              </Label>
              <Input
                id="startDate"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">
                Date Fin
              </Label>
              <Input
                id="endDate"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full text-sm"
              />
            </div>
            <div>
              <Label htmlFor="minTotal" className="text-sm font-medium">
                Total Min (MAD)
              </Label>
              <Input
                id="minTotal"
                type="number"
                name="minTotal"
                value={filters.minTotal}
                onChange={handleFilterChange}
                min="0"
                className="w-full text-sm"
              />
            </div>
            <div>
              <Label htmlFor="maxTotal" className="text-sm font-medium">
                Total Max (MAD)
              </Label>
              <Input
                id="maxTotal"
                type="number"
                name="maxTotal"
                value={filters.maxTotal}
                onChange={handleFilterChange}
                min="0"
                className="w-full text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Recherche (ID/Fournisseur)
              </Label>
              <Input
                id="search"
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="ID ou nom du fournisseur"
                className="w-full text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} className="flex items-center gap-2">
              Appliquer Filtres
            </Button>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="size-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const PurchaseTable = ({ purchases, handleInfoClick, handlePrintInvoice }) => {
  const groupedPurchases = purchases.reduce((acc, purchase) => {
    const key = purchase.relatedPurchaseIds?.join(",") || purchase.id.toString();
    acc[key] = acc[key] || [];
    acc[key].push(purchase);
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Fournisseur
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Produits
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
              Caisses (In/Out)
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.values(groupedPurchases).map((group, index) => {
            const purchase = group[0];
            const total = group.reduce((sum, p) => sum + (p.total || 0), 0);
            const productCount = group.reduce(
              (sum, p) => sum + (p.ProductAssociation?.length || 0),
              0
            );
            const totalBoxesIn = group.reduce(
              (sum, p) =>
                sum + (p.BoxAssociation?.reduce((s, pb) => s + (pb.qttIn || 0), 0) || 0),
              0
            );
            const totalBoxesOut = group.reduce(
              (sum, p) =>
                sum + (p.BoxAssociation?.reduce((s, pb) => s + (pb.qttOut || 0), 0) || 0),
              0
            );

            return (
              <tr
                key={index}
                className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">{purchase.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {purchase.SupplierAssociation?.name ?? "N/A"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {format(new Date(purchase.date), "dd/MM/yyyy")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{total.toFixed(2)} MAD</td>
                <td className="px-4 py-3 whitespace-nowrap">{productCount} produit(s)</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
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
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintInvoice(purchase)}
                      className="flex items-center gap-1"
                    >
                      <Printer className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const PaginationControls = ({ pagination, handlePageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={pagination.currentPage === i ? "default" : "outline"}
          onClick={() => handlePageChange(i)}
          className="mx-1 size-8"
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  return (
    pagination.totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="h-8"
        >
          <ChevronLeft className="size-4" />
          Précédent
        </Button>
        {renderPageNumbers()}
        <Button
          variant="outline"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="h-8"
        >
          Suivant
          <ChevronRight className="size-4" />
        </Button>
      </div>
    )
  );
};

const ListeDesPurchases = () => {
  const [state, setState] = useState({
    addOpen: false,
    addBoxWasteOpen: false,
    infoOpen: false,
    printOpen: false,
    showFilters: false,
    selectedPurchase: null,
    filters: {
      startDate: "",
      endDate: "",
      minTotal: "",
      maxTotal: "",
      search: "",
    },
  });

  const {
    purchaseState: { purchases, error, loading: loadingPurchase, pagination },
    fetchAllPurchases,
  } = usePurchase();

  const applyFilters = useCallback(() => {
    fetchAllPurchases(1, pagination.pageSize, state.filters);
  }, [fetchAllPurchases, state.filters, pagination.pageSize]);

  const resetFilters = useCallback(() => {
    const emptyFilters = {
      startDate: "",
      endDate: "",
      minTotal: "",
      maxTotal: "",
      search: "",
    };
    setState((prev) => ({ ...prev, filters: emptyFilters }));
    fetchAllPurchases(1, pagination.pageSize, emptyFilters);
  }, [fetchAllPurchases, pagination.pageSize]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        fetchAllPurchases(newPage, pagination.pageSize, state.filters);
      }
    },
    [fetchAllPurchases, state.filters, pagination.pageSize, pagination.totalPages]
  );

  const handlePurchaseAdded = useCallback(() => {
    fetchAllPurchases(1, pagination.pageSize, state.filters);
    setState((prev) => ({ ...prev, addOpen: false, addBoxWasteOpen: false }));
  }, [fetchAllPurchases, pagination.pageSize, state.filters]);

  const handleInfoClick = useCallback((purchase) => {
    setState((prev) => ({ ...prev, infoOpen: true, selectedPurchase: purchase }));
  }, []);

  const handlePrintInvoice = useCallback((purchase) => {
    setState((prev) => ({ ...prev, printOpen: true, selectedPurchase: purchase }));
  }, []);

  useEffect(() => {
    fetchAllPurchases(pagination.currentPage, pagination.pageSize, state.filters);
  }, [fetchAllPurchases, pagination.currentPage, pagination.pageSize, state.filters]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Button
            onClick={() => setState((prev) => ({ ...prev, addOpen: true }))}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Effectuer un achat
          </Button>
          <Button
            onClick={() => setState((prev) => ({ ...prev, addBoxWasteOpen: true }))}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Achat Caisses/Déchets
          </Button>
          <FilterSection
            filters={state.filters}
            setFilters={(filters) => setState((prev) => ({ ...prev, filters }))}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            showFilters={state.showFilters}
            toggleFilters={() =>
              setState((prev) => ({ ...prev, showFilters: !prev.showFilters }))
            }
          />
        </div>
      </div>

      {loadingPurchase && (
        <p className="text-center text-gray-500 text-sm">Chargement des achats...</p>
      )}
      {error && <p className="text-center text-red-500 text-sm">{error}</p>}
      {!loadingPurchase && !error && purchases.length === 0 && (
        <p className="text-center text-gray-600 text-sm">Aucun achat trouvé.</p>
      )}

      <AddPurchase
        open={state.addOpen}
        setOpen={(open) => setState((prev) => ({ ...prev, addOpen: open }))}
        onPurchaseAdded={handlePurchaseAdded}
      />
      <AddBoxWastePurchase
        open={state.addBoxWasteOpen}
        setOpen={(open) => setState((prev) => ({ ...prev, addBoxWasteOpen: open }))}
        onPurchaseAdded={handlePurchaseAdded}
      />
      <PurchaseInfoModal
        open={state.infoOpen}
        setOpen={(open) => setState((prev) => ({ ...prev, infoOpen: open }))}
        purchase={state.selectedPurchase}
      />
      <PrintInvoice
        open={state.printOpen}
        setOpen={(open) => setState((prev) => ({ ...prev, printOpen: open }))}
        purchase={state.selectedPurchase}
      />

      {!loadingPurchase && !error && purchases.length > 0 && (
        <PurchaseTable
          purchases={purchases}
          handleInfoClick={handleInfoClick}
          handlePrintInvoice={handlePrintInvoice}
        />
      )}

      <PaginationControls pagination={pagination} handlePageChange={handlePageChange} />

      {pagination.totalItems > 0 && (
        <p className="text-center mt-2 text-sm text-gray-600">
          Affichage de {purchases.length} sur {pagination.totalItems} achats (Page{" "}
          {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesPurchases;