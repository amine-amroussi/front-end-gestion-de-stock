
import { forwardRef, useImperativeHandle } from "react";
import { format } from "date-fns";

const PrintInvoice = forwardRef(({ formData, tripDetails, products, boxes, employees }, ref) => {
  const getEmployeeName = (cin) => {
    const employee = employees.find((emp) => emp.cin === cin?.toString());
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
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const isPreOrActiveTrip =
    tripDetails?.id?.toString().startsWith("PRE-") ||
    tripDetails?.TripProducts?.every(
      (product) => product.qttVendu === undefined || product.qttVendu === null
    );

  const handlePrint = () => {
    const totalAmount = calculateTotalAmount(tripDetails?.TripProducts || []);
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture Pré-Tournée</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .invoice { max-width: 800px; margin: auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .details, .products, .boxes { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h2>Facture Pré-Tournée N°: ${tripDetails?.id || "N/A"}</h2>
            <p>Imprimé le: ${currentDate}</p>
          </div>
          <div class="details">
            <p><strong>Camion:</strong> ${
              tripDetails?.TruckAssociation?.matricule || formData.truck_matricule || "N/A"
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
            <p><strong>Zone:</strong> ${tripDetails?.zone || formData.zone || "N/A"}</p>
          </div>
          <div class="products">
            <h3>Produits</h3>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Prix (MAD)</th>
                  <th>Qté Sortie (Caisses)</th>
                  <th>Qté Sortie (Unités)</th>
                  <th>${isPreOrActiveTrip ? "Quantité Totale (Unités)" : "Qté Vendue (Unités)"}</th>
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
                                product.product_id || product.ProductAssociation?.id
                              )
                          );
                        if (productData && productData.priceUnite) {
                          const capacityByBox = productData.capacityByBox || 0;
                          const totalUnitsOut =
                            (product.qttOut || 0) * capacityByBox + (product.qttOutUnite || 0);
                          const displayUnits = isPreOrActiveTrip
                            ? totalUnitsOut
                            : product.qttVendu !== undefined && product.qttVendu !== null
                            ? product.qttVendu
                            : totalUnitsOut;
                          const itemTotal = displayUnits * productData.priceUnite;
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
                    : "<tr><td colspan='6'>Aucun produit</td></tr>"
                }
              </tbody>
            </table>
          </div>
          <div class="boxes">
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
                        const displayQty = isPreOrActiveTrip ? box.qttOut || 0 : box.qttIn || 0;
                        return `
                          <tr>
                            <td>${boxData?.designation || "N/A"}</td>
                            <td>${displayQty}</td>
                          </tr>
                        `;
                      }).join("")
                    : "<tr><td colspan='2'>Aucune caisse</td></tr>"
                }
                <tr class="total">
                  <td>Total</td>
                  <td>${totalBoxesOut}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">
            <p>Montant Total: ${totalAmount} MAD</p>
          </div>
          <div class="total">
            <p>Commaission: ${totalAmount} MAD</p>
          </div>
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (printWindow) {
      try {
        printWindow.document.open();
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
      } catch (error) {
        console.error("Error writing to print window:", error);
        alert("Erreur lors de la génération de la facture. Veuillez réessayer.");
      }
    } else {
      console.error("Failed to open print window. Please allow popups for this site.");
      alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site.");
    }
  };

  useImperativeHandle(ref, () => ({
    handlePrint,
  }));

  return null;
});

export default PrintInvoice;
