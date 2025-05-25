"use client";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useWastes } from "@/store/wastesStore";
import { useProduct } from "@/store/productStore";
import { Button } from "@/components/ui/button";

const ListeDesWastes = () => {
  const {
    wasteState: { wastes, loadingWaste, error, pagination },
    fetchAllWastes,
    nextPage,
  } = useWastes();
  const { productState: { products }, fetchAllProducts } = useProduct();

  useEffect(() => {
    fetchAllWastes(pagination.currentPage, pagination.pageSize);
    fetchAllProducts(); // Fetch products to ensure designations are available
  }, [fetchAllWastes, fetchAllProducts, pagination.currentPage, pagination.pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllWastes(newPage, pagination.pageSize);
    }
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
          className="mx-1"
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  // Find the designation for a given product ID
  const getProductDesignation = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.designation : `Produit #${productId}`; // Fallback to ID if designation not found
  };

  return (
    <div className="container mx-auto">
      

      {loadingWaste && <p className="text-center">Chargement des déchets...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loadingWaste && !error && wastes.length === 0 && (
        <p className="text-center">Aucun déchet trouvé.</p>
      )}

      {!loadingWaste && !error && wastes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Désignation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wastes.map((waste) => (
                <tr
                  key={`${waste.product}-${waste.type}`}
                  className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{getProductDesignation(waste.product)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{waste.qtt}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{waste.type}</td>
                </tr>
              ))}
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
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          {renderPageNumbers()}

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {pagination.totalItems > 0 && (
        <p className="text-center mt-2 text-sm text-gray-500">
          Affichage de {wastes.length} sur {pagination.totalItems} déchets (Page{" "}
          {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesWastes;
