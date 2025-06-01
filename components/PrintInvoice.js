import { format } from "date-fns";

const PrintInvoice = (purchase) => {
  console.log("PrintInvoice called with:", purchase);

  const totalBoxesIn =
    purchase.BoxAssociation?.reduce((sum, pb) => sum + pb.qttIn, 0) || 0;
  const totalBoxesOut =
    purchase.BoxAssociation?.reduce((sum, pb) => sum + pb.qttOut, 0) || 0;
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const invoiceContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Facture N°${purchase.id || "N/A"}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1, h2 { text-align: center; }
        .footer { text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Facture N°: ${purchase.id || "N/A"}</h1>
      <p><strong>Fournisseur:</strong> ${purchase.SupplierAssociation?.name || "N/A"}</p>
      <p><strong>Date d'Achat:</strong> ${
        purchase.date ? format(new Date(purchase.date), "dd/MM/yyyy") : "N/A"
      }</p>
      <p><strong>Date d'impression:</strong> ${currentDate}</p>

      <h2>Produits</h2>
      <table>
        <tr>
          <th>Désignation</th>
          <th>Qté (Caisses)</th>
          <th>Qté (Unités)</th>
          <th>Prix (MAD)</th>
        </tr>
        ${
          purchase.ProductAssociation?.length
            ? purchase.ProductAssociation.map(
                (prod) => `
          <tr>
            <td>${prod.ProductAssociation?.designation || "N/A"}</td>
            <td>${prod.qtt || 0}</td>
            <td>${prod.qttUnite || 0}</td>
            <td>${prod.price || 0}</td>
          </tr>
        `
              ).join("")
            : '<tr><td colspan="4">Aucun produit</td></tr>'
        }
      </table>

      <h2>Caisses</h2>
      <table>
        <tr>
          <th>Désignation</th>
          <th>Qté Entrée</th>
          <th>Qté Sortie</th>
        </tr>
        ${
          purchase.BoxAssociation?.length
            ? purchase.BoxAssociation.map(
                (box) => `
          <tr>
            <td>${box.BoxAssociation?.designation || "N/A"}</td>
            <td>${box.qttIn || 0}</td>
            <td>${box.qttOut || 0}</td>
          </tr>
        `
              ).join("")
            : '<tr><td colspan="3">Aucune caisse</td></tr>'
        }
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>${totalBoxesIn}</strong></td>
          <td><strong>${totalBoxesOut}</strong></td>
        </tr>
      </table>

      <h2>Déchets</h2>
      <table>
        <tr>
          <th>Désignation</th>
          <th>Quantité</th>
          <th>Type</th>
        </tr>
        ${
          purchase.purchaseWaste?.length
            ? purchase.purchaseWaste.map(
                (waste) => `
          <tr>
            <td>${waste.designation || "N/A"}</td>
            <td>${waste.qtt || 0}</td>
            <td>${waste.type || "N/A"}</td>
          </tr>
        `
              ).join("")
            : '<tr><td colspan="3">Aucun déchet</td></tr>'
        }
      </table>

      <p><strong>Total de l'Achat:</strong> ${purchase.total || 0} MAD</p>

      <div class="footer">
        <p>Merci pour votre confiance !</p>
        <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          // Optionally close the window after printing
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "", "height=600,width=800");
  if (!printWindow) {
    alert("Please allow pop-ups for this site to print the invoice.");
    return;
  }
  printWindow.document.write(invoiceContent);
  printWindow.document.close();
};

export default PrintInvoice;