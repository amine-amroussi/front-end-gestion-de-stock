import { format } from "date-fns";

const PrintInvoice = ({ formData, products, boxes, employees }) => {
  const getEmployeeName = (cin) => {
    const employee = employees.find(emp => emp.cin === cin);
    return employee ? employee.name : "N/A";
  };

  const calculateTotalAmount = () => {
    let total = 0;
    formData.tripProducts.forEach((product) => {
      const productData = products.find(p => p.id === parseInt(product.product_id));
      if (productData && productData.priceUnite) {
        const capacityByBox = productData.capacityByBox || 0;
        const totalUnits = product.qttOut * capacityByBox + (product.qttOutUnite || 0);
        total += totalUnits * productData.priceUnite;
      }
    });
    return total.toFixed(2);
  };

  const totalBoxesOut = formData.tripBoxes?.reduce((sum, box) => sum + box.qttOut, 0) || 0;
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const handlePrint = () => {
    const totalAmount = calculateTotalAmount();
    const invoiceContent = `
      <html>
      <head>
        <title>Facture Pré-Tournée</title>
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
            <p><strong>Facture Pré-Tournée N°:</strong> N/A</p>
            <p><strong>Camion:</strong> ${formData.truck_matricule || "N/A"}</p>
            <p><strong>Conducteur:</strong> ${getEmployeeName(formData.driver_id)}</p>
            <p><strong>Vendeur:</strong> ${getEmployeeName(formData.seller_id)}</p>
            <p><strong>Assistant:</strong> ${getEmployeeName(formData.assistant_id)}</p>
            <p><strong>Date de la Tournée:</strong> ${format(new Date(formData.date), "dd/MM/yyyy")}</p>
            <p><strong>Zone:</strong> ${formData.zone || "N/A"}</p>
            <p><strong>Imprimé le:</strong> ${currentDate}</p>
          </div>
          <div class="items">
            <h3>Produits</h3>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Qté (Caisses)</th>
                  <th>Qté (Unités)</th>
                  <th>Prix (MAD)</th>
                </tr>
              </thead>
              <tbody>
                ${
                  formData.tripProducts?.length > 0
                    ? formData.tripProducts
                        .map((product) => {
                          const productData = products.find(p => p.id === parseInt(product.product_id));
                          if (productData && productData.priceUnite) {
                            const capacityByBox = productData.capacityByBox || 0;
                            const totalUnits = product.qttOut * capacityByBox + (product.qttOutUnite || 0);
                            const itemTotal = totalUnits * productData.priceUnite;
                            return `
                              <tr>
                                <td>${productData.designation || "N/A"}</td>
                                <td>${product.qttOut}</td>
                                <td>${product.qttOutUnite || 0}</td>
                                <td>${itemTotal.toFixed(2)}</td>
                              </tr>
                            `;
                          }
                          return "";
                        })
                        .join("")
                    : '<tr><td colspan="4">Aucun produit</td></tr>'
                }
              </tbody>
            </table>
            <h3>Caisses</h3>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Qté Entrée</th>
                  <th>Qté Sortie</th>
                </tr>
              </thead>
              <tbody>
                ${
                  formData.tripBoxes?.length > 0
                    ? formData.tripBoxes
                        .map((box) => {
                          const boxData = boxes.find(b => b.id === parseInt(box.box_id));
                          return `
                            <tr>
                              <td>${boxData?.designation || "N/A"}</td>
                              <td>0</td>
                              <td>${box.qttOut}</td>
                            </tr>
                          `;
                        })
                        .join("")
                    : '<tr><td colspan="3">Aucune caisse</td></tr>'
                }
                <tr>
                  <td><strong>Total</strong></td>
                  <td>0</td>
                  <td>${totalBoxesOut}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">
            <p><strong>Montant Total:</strong> ${totalAmount} MAD</p>
          </div>
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
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
      alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site.");
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-1.5 px-4 rounded-md"
    >
      Imprimer Facture
    </button>
  );
};

export default PrintInvoice;
