"use client";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useCharges } from "@/store/chargeStore";
import { Button } from "@/components/ui/button";
import { ShowToast } from "@/utils/toast";

const ListeDesCharges = () => {
  const {
    chargeState: { charges, loadingCharge, error, pagination },
    fetchAllCharges,
    nextPage,
  } = useCharges();

  useEffect(() => {
    fetchAllCharges(pagination.currentPage, pagination.pageSize);
  }, [fetchAllCharges, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    if (error) {
      ShowToast.error(error);
    }
  }, [error]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllCharges(newPage, pagination.pageSize);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="container mx-auto">
      {loadingCharge && <p className="text-center">Chargement des charges...</p>}
      {!loadingCharge && !error && charges.length === 0 && (
        <p className="text-center">Aucune charge trouvée.</p>
      )}

      {!loadingCharge && !error && charges.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant (MAD)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charges.map((charge) => (
                <tr
                  key={charge.id}
                  className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{charge.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{charge.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(charge.date)}</td>
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
          Affichage de {charges.length} sur {pagination.totalItems} charges (Page{" "}
          {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesCharges;