"use client";
import { ChevronRight, ChevronLeft, Trash, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useEmployee } from "@/store/employeeStore";
// import AddEmployeeSheet from "./sheet/AddEmployeeSheet";
import { Button } from "./ui/button";
import EditEmployeeSheet from "./sheet/EditEmployeeSheet";

const ListeDesEmployes = () => {
  const [open, setOpen] = useState(false);
  const [selectedCin, setSelectedCin] = useState(null);

  const {
    employeeState: { employees, loadingEmployee, error, pagination },
    fetchAllEmployees,
    nextPage,
  } = useEmployee();

  useEffect(() => {
    fetchAllEmployees(pagination.currentPage, pagination.pageSize);
  }, [fetchAllEmployees, pagination.currentPage, pagination.pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAllEmployees(newPage, pagination.pageSize);
    }
  };

  

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxPagesToShow / 2)
    );
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxPagesToShow - 1
    );

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

  const handleEmployeeEdited = () => {
    fetchAllEmployees(pagination.currentPage, pagination.pageSize);
    setEditOpen(false);
    setSelectedCin(null);
  };

  return (
    <div className="container mx-auto p-4">
      <EditEmployeeSheet
        open={open}
        setOpen={setOpen}
        cin={selectedCin}
        onEmployeeEdited={handleEmployeeEdited}
      />
      {loadingEmployee && (
        <p className="text-center">Chargement des employés...</p>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loadingEmployee && !error && employees.length === 0 && (
        <p className="text-center">Aucun employé trouvé.</p>
      )}

      {!loadingEmployee && !error && employees.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salaire Fixe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr
                  key={employee.cin}
                  className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.cin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.tel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.salary_fix}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button>
                      <Trash className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700" />
                    </button>
                    <button onClick={() => {setSelectedCin(employee.cin); setOpen(true);}}>
                      <Edit className="w-4 h-4 cursor-pointer text-blue-500 hover:text-blue-700" />
                    </button>
                  </td>
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
          Affichage de {employees.length} sur {pagination.totalItems} employés
          (Page {pagination.currentPage} sur {pagination.totalPages})
        </p>
      )}
    </div>
  );
};

export default ListeDesEmployes;
