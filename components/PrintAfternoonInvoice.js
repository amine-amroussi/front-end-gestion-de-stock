import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const PrintAfternoonInvoice = ({ invoiceData }) => {
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const calculateTotalAmount = (products) => {
    let total = 0;
    products.forEach((product) => {
      if (product.priceUnite) {
        const totalUnits = product.qttVendu || 0;
        total += totalUnits * product.priceUnite;
      }
    });
    return total;
  };

  const totalBoxesOut = invoiceData.boxes?.reduce((sum, box) => sum + (box.qttOut || 0), 0) || 0;
  const totalBoxesIn = invoiceData.boxes?.reduce((sum, box) => sum + (box.qttIn || 0), 0) || 0;

  const handlePrint = () => {
    const totalAmount = calculateTotalAmount(invoiceData.products || []);
    const invoiceContent = `
      <html>
      <head>
        <title>Facture Post-Tournée Après-Midi</title>
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
            <p><strong>Facture Post-Tournée N°:</strong> ${invoiceData.tripId || "N/A"}</p>
            <p><strong>Camion:</strong> ${invoiceData.truck || "N/A"}</p>
            <p><strong>Conducteur:</strong> ${invoiceData.driver || "N/A"}</p>
            <p><strong>Vendeur:</strong> ${invoiceData.seller || "N/A"}</p>
            <p><strong>Date de la Tournée:</strong> ${invoiceData.date ? format(new Date(invoiceData.date), "dd/MM/yyyy") : "N/A"}</p>
            <p><strong>Zone:</strong> ${invoiceData.zone || "N/A"}</p>
            <p><strong>Imprimé le:</strong> ${currentDate}</p>
          </div>
          <div class="items">
            <h3>Produits</h3>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Qté Sortie (Caisses)</th>
                  <th>Qté Sortie (Unités)</th>
                  <th>Qté Retour (Caisses)</th>
                  <th>Qté Retour (Unités)</th>
                  <th>Qté Vendue (Unités)</th>
                  <th>Prix Unitaire (MAD)</th>
                  <th>Total (MAD)</th>
                </tr>
              </thead>
              <tbody>
                ${
                  invoiceData.products?.length > 0
                    ? invoiceData.products.map((product) => {
                        const totalRevenue = (product.qttVendu || 0) * (product.priceUnite || 0);
                        return `
                          <tr>
                            <td>${product.designation || "N/A"}</td>
                            <td>${product.qttOut || 0}</td>
                            <td>${product.qttOutUnite || 0}</td>
                            <td>${product.qttReutour || 0}</td>
                            <td>${product.qttReutourUnite || 0}</td>
                            <td>${product.qttVendu || 0}</td>
                            <td>${(product.priceUnite || 0)}</td>
                            <td>${totalRevenue}</td>
                          </tr>
                        `;
                      }).join("")
                    : '<tr><td colspan="8">Aucun produit</td></tr>'
                }
              </tbody>
            </table>
            <h3>Caisses</h3>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Qté Sortie</th>
                  <th>Qté Entrée</th>
                </tr>
              </thead>
              <tbody>
                ${
                  invoiceData.boxes?.length > 0
                    ? invoiceData.boxes.map((box) => `
                        <tr>
                          <td>${box.designation || "N/A"}</td>
                          <td>${box.qttOut || 0}</td>
                          <td>${box.qttIn || 0}</td>
                        </tr>
                      `).join("")
                    : '<tr><td colspan="3">Aucune caisse</td></tr>'
                }
                <tr>
                  <td><strong>Total</strong></td>
                  <td>${totalBoxesOut}</td>
                  <td>${totalBoxesIn}</td>
                </tr>
              </tbody>
            </table>
            <h3>Déchets</h3>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Type</th>
                  <th>Quantité</th>
                </tr>
              </thead>
              <tbody>
                ${
                  invoiceData.wastes?.length > 0
                    ? invoiceData.wastes.map((waste) => `
                        <tr>
                          <td>${waste.product || "Inconnu"}</td>
                          <td>${waste.type || "N/A"}</td>
                          <td>${waste.qtt || 0}</td>
                        </tr>
                      `).join("")
                    : '<tr><td colspan="3">Aucun déchet</td></tr>'
                }
              </tbody>
            </table>
            <h3>Charges</h3>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Montant (MAD)</th>
                </tr>
              </thead>
              <tbody>
                ${
                  invoiceData.charges?.length > 0
                    ? invoiceData.charges.map((charge) => `
                        <tr>
                          <td>${charge.type || "N/A"}</td>
                          <td>${(charge.amount || 0)}</td>
                        </tr>
                      `).join("")
                    : '<tr><td colspan="2">Aucune charge</td></tr>'
                }
                <tr>
                  <td><strong>Total</strong></td>
                  <td>${(invoiceData.totals?.totalCharges || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">
            <p><strong>Montant Total:</strong> ${totalAmount} MAD</p>
            <p><strong>Montant Attendu:</strong> ${(invoiceData.totals?.waitedAmount || 0)} MAD</p>
            <p><strong>Montant Reçu:</strong> ${(invoiceData.totals?.receivedAmount || 0)} MAD</p>
            <p><strong>Différence:</strong> ${(invoiceData.totals?.deff || 0)} MAD</p>
            <p><strong>Bénéfice:</strong> ${(invoiceData.totals?.benefit || 0)} MAD</p>
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
    <Button
      onClick={handlePrint}
      className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-1.5 px-4 rounded-md"
    >
      Imprimer Facture Après-Midi
    </Button>
  );
};

export default PrintAfternoonInvoice;