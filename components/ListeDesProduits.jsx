"use client";
import { Trash, Edit, Boxes, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useProduct } from "@/store/productStore";
import EditProductSheet from "./sheet/EditProductSheet";
import { Button } from "./ui/button";
import { ShowToast } from "@/utils/toast";
import { axiosInstance } from "@/utils/axiosInstance";

const ListeDesProduits = () => {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(null);
  const {
    productState: { products, loadingProduct, pagination },
    fetchAllProducts,
    nextPage,
  } = useProduct();

  useEffect(() => {
    fetchAllProducts(pagination.currentPage, pagination.pageSize);
  }, [fetchAllProducts, pagination.currentPage, pagination.pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllProducts(newPage, pagination.pageSize);
    }
  };

  const handleDelete = async (id) => {
    const toastId = ShowToast.loading("Suppression du produit...");
    try {
      const response = await axiosInstance.delete(`/product/${id}`);
      if (response.status === 200) {
        await fetchAllProducts(pagination.currentPage, pagination.pageSize);
        ShowToast.dismiss(toastId);
        ShowToast.successDelete();
      } else {
        throw new Error("Échec de la suppression");
      }
    } catch (error) {
      ShowToast.dismiss(toastId);
      ShowToast.error(error.response?.data?.msg || "Erreur lors de la suppression du produit.");
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

  return (
    <div className="overflow-x-auto">
      <EditProductSheet open={open} setOpen={setOpen} productId={productId} />
      {loadingProduct && <p className="text-gray-600 mb-4">Chargement...</p>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Designation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Genre
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              En stock
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unité en stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capacité de crate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Crate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products?.map((product) => {
            return (
              <tr
                key={product.id}
                className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
              >
                <td className="px-6 py-4 whitespace-nowrap">#{product?.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.designation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.genre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.stock || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.uniteInStock || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.priceUnite || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.capacityByBox || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.BoxAssociation ? product.BoxAssociation.designation : "Aucun crate"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="mr-2" onClick={() => handleDelete(product.id)}>
                    <Trash className="w-4 h-4 cursor-pointer" />
                  </button>
                  <button
                    onClick={() => {
                      setOpen(true);
                      setProductId(product.id);
                    }}
                  >
                    <Edit className="w-4 h-4 cursor-pointer" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {renderPageNumbers()}

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* Pagination Info */}
      {pagination.totalItems > 0 && (
        <p className="text-center mt-2 text-sm text-gray-500">
          Showing {products.length} of {pagination.totalItems} products (Page{" "}
          {pagination.currentPage} of {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesProduits;