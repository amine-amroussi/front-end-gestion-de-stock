"use client";
import { useEffect, useState } from "react";
import { usePaymentStore } from "@/store/PaymentStore";
import PaymentForm from "@/components/PaymentForm";
import PaymentSummary from "@/components/PaymentSummary";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Printer } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const PaymentPage = () => {
  const {
    state,
    fetchPayments,
    fetchEmployees,
    fetchPaymentsForEmployeeBetweenDates,
    setFilters,
    setSort,
    goToNextPage,
  } = usePaymentStore();

  const { payments, employees, loading, error, pagination, filters, sort } = state;
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    employeeId: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayments(pagination.currentPage, pagination.pageSize, filters, sort);
  }, [fetchEmployees, fetchPayments, pagination.currentPage, filters, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleSortChange = (field) => {
    setSort({
      sortBy: field,
      sortOrder: sort.sortBy === field && sort.sortOrder === "ASC" ? "DESC" : "ASC",
    });
  };

  const handleAddPayment = () => {
    if (!Array.isArray(employees) || employees.length === 0) {
      toast.error("Veuillez attendre que les employés soient chargés.");
      return;
    }
    setShowForm(true);
  };

  const getEmployeeName = (cin) => {
    const employee = employees.find((emp) => emp.cin === cin?.toString());
    return employee ? employee.name : "N/A";
  };

  const handleInvoiceFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrintInvoiceBetweenDates = async () => {
    const { employeeId, startMonth, startYear, endMonth, endYear } = invoiceForm;

    if (!employeeId || !startMonth || !startYear || !endMonth || !endYear) {
      toast.error("Veuillez remplir tous les champs pour générer la facture.");
      return;
    }

    const startM = parseInt(startMonth);
    const startY = parseInt(startYear);
    const endM = parseInt(endMonth);
    const endY = parseInt(endYear);

    if (isNaN(startM) || startM < 1 || startM > 12) {
      toast.error("Le mois de début doit être un nombre entre 1 et 12.");
      return;
    }
    if (isNaN(startY) || startY < 2000 || startY > 2100) {
      toast.error("L'année de début doit être un nombre entre 2000 et 2100.");
      return;
    }
    if (isNaN(endM) || endM < 1 || endM > 12) {
      toast.error("Le mois de fin doit être un nombre entre 1 et 12.");
      return;
    }
    if (isNaN(endY) || endY < 2000 || endY > 2100) {
      toast.error("L'année de fin doit être un nombre entre 2000 et 2100.");
      return;
    }

    const startDate = new Date(startY, startM - 1);
    const endDate = new Date(endY, endM - 1);
    if (startDate > endDate) {
      toast.error("La date de début doit être antérieure à la date de fin.");
      return;
    }

    const paymentsInRange = await fetchPaymentsForEmployeeBetweenDates(
      employeeId,
      startM,
      startY,
      endM,
      endY
    );

    if (state.error) {
      toast.error(`Erreur: ${state.error}`);
      return;
    }

    if (!paymentsInRange || paymentsInRange.length === 0) {
      toast.error("Aucun paiement trouvé pour cet employé dans cette période.");
      return;
    }

    // Calcul des totaux basés sur les données du backend
    const totalBase = paymentsInRange
      .reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
      .toFixed(2);
    const totalCredit = paymentsInRange
      .reduce((sum, p) => sum + parseFloat(p.credit || 0), 0)
      .toFixed(2);
    const totalNet = paymentsInRange
      .reduce((sum, p) => sum + parseFloat(p.net_pay || 0), 0)
      .toFixed(2);

    // Vérification que le totalNet correspond à totalBase - totalCredit (pour débogage)
    const calculatedNet = (parseFloat(totalBase) - parseFloat(totalCredit)).toFixed(2);
    if (parseFloat(totalNet) !== parseFloat(calculatedNet)) {
      console.warn("Mismatch in net calculation:", { totalNet, calculatedNet });
    }

    const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

    const invoiceContent = `
      <html>
      <head>
        <title>Facture de Paiement</title>
        <style>
          @media print {
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { margin: 0; padding: 20mm; font-family: Arial, sans-serif; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; }
            .details, .items { margin-top: 20px; }
            .details p { margin: 5px 0; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #000; padding: 8px; text-align: left; }
            .items th { background-color: #f5f5f5; }
            .total { margin-top: 20px; font-weight: bold; text-align: right; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          }
          @page { margin: 20mm; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="details">
            <p><strong>Facture de Paiement</strong></p>
            <p><strong>Employé:</strong> ${getEmployeeName(employeeId)}</p>
            <p><strong>Rôle:</strong> ${
              employees.find((emp) => emp.cin === employeeId)?.role || "N/A"
            }</p>
            <p><strong>Période:</strong> ${startMonth}/${startYear} - ${endMonth}/${endYear}</p>
            <p><strong>Imprimé le:</strong> ${currentDate}</p>
          </div>
          <div class="items">
            <h3>Détails de Paiement</h3>
            <table>
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Salaire de Base (MAD)</th>
                  <th>Ajustement de Crédit (MAD)</th>
                  <th>Total Net (MAD)</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                ${
                  paymentsInRange.map((payment) => `
                    <tr>
                      <td>${payment.month}/${payment.year}</td>
                      <td>${parseFloat(payment.total || 0).toFixed(2)}</td>
                      <td>${parseFloat(payment.credit || 0).toFixed(2)}</td>
                      <td>${parseFloat(payment.net_pay || 0).toFixed(2)}</td>
                      <td>${payment.status === "Paid" ? "Payé" : payment.status === "Cancelled" ? "Annulé" : "En attente"}</td>
                    </tr>
                  `).join("")
                }
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>${totalBase}</strong></td>
                  <td><strong>${totalCredit}</strong></td>
                  <td><strong>${totalNet}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">
            <p><strong>Montant Total Net:</strong> ${totalNet} MAD</p>
          </div>
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>© ${new Date().getFullYear()} Votre Entreprise</p>
          </div>
        </div>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
    } else {
      console.error("Failed to open print window. Please allow popups for this site.");
      toast.error("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site.");
    }
  };

  const handlePrintInvoice = (payment) => {
    const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");
    const isPreOrActiveTrip = false;

    const invoiceContent = `
      <html>
      <head>
        <title>Facture de Paiement</title>
        <style>
          @media print {
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { margin: 0; padding: 20mm; font-family: Arial, sans-serif; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; }
            .details, .items { margin-top: 20px; }
            .details p { margin: 5px 0; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #000; padding: 8px; text-align: left; }
            .items th { background-color: #f5f5f5; }
            .total { margin-top: 20px; font-weight: bold; text-align: right; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          }
          @page { margin: 20mm; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="details">
            <p><strong>Facture de Paiement N°:</strong> ${payment.payment_id || "N/A"}</p>
            <p><strong>Employé:</strong> ${getEmployeeName(payment.employee_cin)}</p>
            <p><strong>Rôle:</strong> ${payment.EmployeeAssociation?.role || "N/A"}</p>
            <p><strong>Période:</strong> ${format(
              new Date(payment.year, payment.month - 1, 1),
              "dd/MM/yyyy"
            )}</p>
            <p><strong>Imprimé le:</strong> ${currentDate}</p>
          </div>
          <div class="items">
            <h3>Détails de Paiement</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Montant (MAD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Salaire de Base</td>
                  <td>${parseFloat(payment.total || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Ajustement de Crédit</td>
                  <td>${parseFloat(payment.credit || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Total Net</strong></td>
                  <td><strong>${parseFloat(payment.net_pay || 0).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">
            <p><strong>Montant Total:</strong> ${parseFloat(payment.net_pay || 0).toFixed(2)} MAD</p>
          </div>
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>© ${new Date().getFullYear()} Votre Entreprise</p>
          </div>
        </div>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
    } else {
      console.error("Failed to open print window. Please allow popups for this site.");
      toast.error("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site.");
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Paiements des Employés</h1>
        <Button
          onClick={handleAddPayment}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          <Plus className="w-5 h-5" />
          Ajouter Paiement
        </Button>
      </div>

      <PaymentSummary />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Imprimer une Facture pour une Période</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            name="employeeId"
            value={invoiceForm.employeeId}
            onChange={handleInvoiceFormChange}
            className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un Employé</option>
            {employees.map((emp) => (
              <option key={emp.cin} value={emp.cin}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              name="startMonth"
              value={invoiceForm.startMonth}
              onChange={handleInvoiceFormChange}
              placeholder="Mois de Début (1-12)"
              className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="12"
            />
            <input
              type="number"
              name="startYear"
              value={invoiceForm.startYear}
              onChange={handleInvoiceFormChange}
              placeholder="Année de Début"
              className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="2000"
              max="2100"
            />
          </div>
          <div>|</div>
          <div className="flex gap-2">
            <input
              type="number"
              name="endMonth"
              value={invoiceForm.endMonth}
              onChange={handleInvoiceFormChange}
              placeholder="Mois de Fin (1-12)"
              className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="12"
            />
            <input
              type="number"
              name="endYear"
              value={invoiceForm.endYear}
              onChange={handleInvoiceFormChange}
              placeholder="Année de Fin"
              className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="2000"
              max="2100"
            />
          </div>
          <Button
            onClick={handlePrintInvoiceBetweenDates}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Imprimer Facture
          </Button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleFilterChange}
            placeholder="Rechercher par nom ou CIN..."
            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            name="status"
            value={filters.status || ""}
            onChange={handleFilterChange}
            className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="Pending">En attente</option>
            <option value="Paid">Payé</option>
            <option value="Cancelled">Annulé</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Chargement...</p>
      ) : !Array.isArray(payments) || payments.length === 0 ? (
        <p className="text-gray-600">Aucun paiement trouvé.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  {["ID", "Employé", "Mois/Année", "Salaire de Base", "Crédit", "Paiement Net", "Statut", "Actions"].map(
                    (header) => (
                      <th
                        key={header}
                        className="p-3 cursor-pointer hover:bg-gray-200"
                        onClick={() =>
                          handleSortChange(
                            header === "ID"
                              ? "payment_id"
                              : header === "Mois/Année"
                              ? "year"
                              : header.toLowerCase().replace(" ", "_")
                          )
                        }
                      >
                        {header}{" "}
                        {sort.sortBy ===
                          (header === "ID"
                            ? "payment_id"
                            : header === "Mois/Année"
                            ? "year"
                            : header.toLowerCase().replace(" ", "_")) && (
                          <span>{sort.sortOrder === "ASC" ? "↑" : "↓"}</span>
                        )}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{payment.payment_id}</td>
                    <td className="p-3">
                      {payment.EmployeeAssociation
                        ? `${payment.EmployeeAssociation.name} (${payment.EmployeeAssociation.role})`
                        : "N/A"}
                    </td>
                    <td className="p-3">{`${payment.month}/${payment.year}`}</td>
                    <td className="p-3">{payment.total} MAD</td>
                    <td className="p-3">{payment.credit} MAD</td>
                    <td className="p-3">{payment.net_pay} MAD</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          payment.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status === "Paid"
                          ? "Payé"
                          : payment.status === "Cancelled"
                          ? "Annulé"
                          : "En attente"}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPayment(payment)}
                        className="border-gray-300 hover:bg-gray-100 mr-2"
                      >
                        Modifier Statut
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintInvoice(payment)}
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage} sur {pagination.totalPages}
            </p>
            <Button
              onClick={goToNextPage}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Suivant <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {showForm && (
        <PaymentForm
          onClose={() => {
            setShowForm(false);
            setEditingPayment(null);
          }}
          initialData={editingPayment}
        />
      )}
    </div>
  );
};

export default PaymentPage;