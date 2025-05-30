import { format } from "date-fns";

const PrintInvoice = ({
  formData,
  tripDetails,
  products,
  boxes,
  employees,
}) => {
  const getEmployeeName = (cin) => {
    console.log("getEmployeeName called with cin:", cin);
    console.log("employees array:", employees);
    const employee = employees.find((emp) => emp.cin === cin?.toString());
    console.log("Found employee:", employee);
    return employee ? employee.name : "N/A";
  };

  const calculateTotalAmount = (tripProducts) => {
    let total = 0;
    tripProducts.forEach((product) => {
      const productData =
        product.ProductAssociation ||
        products.find(
          (p) =>
            p.id ===
            parseInt(product.product_id || product.ProductAssociation?.id)
        );
      if (productData && productData.priceUnite) {
        const capacityByBox = productData.capacityByBox || 0;
        const totalUnits =
          (product.qttOut || 0) * capacityByBox + (product.qttOutUnite || 0);
        total += totalUnits * productData.priceUnite;
      }
    });
    return total.toFixed(2);
  };

  const totalBoxesOut =
    tripDetails?.TripBoxes?.reduce((sum, box) => sum + (box.qttOut || 0), 0) ||
    0;
  const totalBoxesInitial =
    tripDetails?.TripBoxes?.reduce((sum, box) => sum + (box.qttOut || 0), 0) ||
    0; // For pre-confirmation/active trips
  const totalBoxesIn =
    tripDetails?.TripBoxes?.reduce((sum, box) => sum + (box.qttIn || 0), 0) ||
    0;
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  // Determine if this is a pre-confirmation or active (unfinished) trip
  const isPreOrActiveTrip =
    tripDetails?.id?.toString().startsWith("PRE-") ||
    tripDetails?.TripProducts?.every(
      (product) => product.qttVendu === undefined || product.qttVendu === null
    );

  const handlePrint = () => {
    const totalAmount = calculateTotalAmount(tripDetails?.TripProducts || []);
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
            <p><strong>Facture Pré-Tournée N°:</strong> ${
              tripDetails?.id || "N/A"
            }</p>
            <p><strong>Camion:</strong> ${
              tripDetails?.TruckAssociation?.matricule ||
              formData.truck_matricule ||
              "N/A"
            }</p>
            <p><strong>Conducteur:</strong> ${getEmployeeName(
              tripDetails?.driver_id || formData.driver_id
            )}</p>
            <p><strong>Vendeur:</strong> ${getEmployeeName(
              tripDetails?.seller_id || formData.seller_id
            )}</p>
            <p><strong>Assistant:</strong> ${getEmployeeName(
              tripDetails?.assistant_id || formData.assistant_id
            )}</p>
            <p><strong>Date de la Tournée:</strong> ${format(
              new Date(tripDetails?.date || formData.date),
              "dd/MM/yyyy"
            )}</p>
            <p><strong>Zone:</strong> ${
              tripDetails?.zone || formData.zone || "N/A"
            }</p>
            <p><strong>Imprimé le:</strong> ${currentDate}</p>
          </div>
          <div class="items">
            <h3>Produits</h3>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Prix (MAD)</th>
                  <th>Qté Sortie (Caisses)</th>
                  <th>Qté Sortie (Unités)</th>
                  <th>${
                    isPreOrActiveTrip
                      ? "Quantité Totale (Unités)"
                      : "Qté Vendue (Unités)"
                  }</th>
                  <th>Prix (MAD)</th>
                </tr>
              </thead>
              <tbody>
                ${
                  tripDetails?.TripProducts?.length > 0
                    ? tripDetails.TripProducts.map((product) => {
                        const productData =
                          product.ProductAssociation ||
                          products.find(
                            (p) =>
                              p.id ===
                              parseInt(
                                product.product_id ||
                                  product.ProductAssociation?.id
                              )
                          );
                        if (productData && productData.priceUnite) {
                          const capacityByBox = productData.capacityByBox || 0;
                          const totalUnitsOut =
                            (product.qttOut || 0) * capacityByBox +
                            (product.qttOutUnite || 0);
                          const displayUnits = isPreOrActiveTrip
                            ? totalUnitsOut
                            : product.qttVendu !== undefined &&
                              product.qttVendu !== null
                            ? product.qttVendu
                            : totalUnitsOut;
                          const itemTotal =
                            displayUnits * productData.priceUnite;
                          return `
                              <tr>
                                <td>${productData.designation || "N/A"}</td>
                                <td>${productData.priceUnite || "N/A"}</td>
                                <td>${product.qttOut || 0}</td>
                                <td>${product.qttOutUnite || 0}</td>
                                <td>${displayUnits}</td>
                                <td>${itemTotal.toFixed(2)}</td>
                              </tr>
                            `;
                        }
                        return "";
                      }).join("")
                    : '<tr><td colspan="5">Aucun produit</td></tr>'
                }
              </tbody>
            </table>
            <h3>Caisses</h3>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>${isPreOrActiveTrip ? "Qté Initiale" : "Qté Entrée"}</th>
                 
                </tr>
              </thead>
              <tbody>
                ${
                  tripDetails?.TripBoxes?.length > 0
                    ? tripDetails.TripBoxes.map((box) => {
                        const boxData =
                          box.BoxAssociation ||
                          boxes.find(
                            (b) =>
                              b.id ===
                              parseInt(box.box_id || box.BoxAssociation?.id)
                          );
                        const displayQty = isPreOrActiveTrip
                          ? box.qttOut || 0
                          : box.qttIn || 0;
                        return `
                            <tr>
                              <td>${boxData?.designation || "N/A"}</td>
                              <td>${box.qttOut || 0}</td>
                            </tr>
                          `;
                      }).join("")
                    : '<tr><td colspan="3">Aucune caisse</td></tr>'
                }
                <tr>
                  <td><strong>Total</strong></td>
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
      console.error(
        "Failed to open print window. Please allow popups for this site."
      );
      alert(
        "Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site."
      );
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
