import { format } from "date-fns";
import { ShowToast } from "@/utils/toast";

const PrintInvoice = (purchase) => {
  if (!purchase || !purchase.id) {
    ShowToast.error("Aucun achat valide sélectionné pour l'impression.");
    return;
  }

  console.log("PrintInvoice called with:", JSON.stringify(purchase, null, 2));

  const hasMissingDesignations = purchase.PurchaseWastes?.some(
    (waste) => !waste.ProductAssociation?.designation
  );
  if (hasMissingDesignations) {
    ShowToast.warning("Certains produits de déchets n'ont pas de désignation. Les données peuvent être incomplètes.");
  }

  const totalBoxesIn = purchase.BoxAssociation?.reduce((sum, pb) => sum + (pb.qttIn || 0), 0) || 0;
  const totalBoxesOut = purchase.BoxAssociation?.reduce((sum, pb) => sum + (pb.qttOut || 0), 0) || 0;
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const invoiceContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Facture #${purchase.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .invoice { max-width: 800px; margin: auto; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .info, .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; text-align: right; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>Facture N°: ${purchase.id || "N/A"}</h1>
        </div>
        <div class="info">
          <p><strong>Fournisseur:</strong> ${purchase.SupplierAssociation?.name || "N/A"}</p>
          <p><strong>Date d'Achat:</strong> ${
            purchase.date ? format(new Date(purchase.date), "dd/MM/yyyy") : "N/A"
          }</p>
          <p><strong>Date d'impression:</strong> ${currentDate}</p>
        </div>

        <div class="section">
          <h2>Produits</h2>
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
                  : `<tr><td colspan="4">Aucun produit</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Caisses</h2>
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
                purchase.BoxAssociation?.length
                  ? purchase.BoxAssociation.map(
                      (box) => `
                        <tr>
                          <td>${box.BoxAssociation?.designation || "N/A"}</td>
                          <td>${box.qttIn || 0}</td>
                          <td>${box.qttOut || 0}</td>
                        </tr>
                      `
                    ).join("") +
                    `
                      <tr>
                        <td><strong>Total</strong></td>
                        <td><strong>${totalBoxesIn}</strong></td>
                        <td><strong>${totalBoxesOut}</strong></td>
                      </tr>
                    `
                  : `<tr><td colspan="3">Aucune caisse</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Déchets</h2>
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Quantité</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${
                purchase.PurchaseWastes?.length
                  ? purchase.PurchaseWastes.map(
                      (waste) => `
                        <tr>
                          <td>${waste.ProductAssociation?.designation || `Produit ${waste.product}`}</td>
                          <td>${waste.qtt || 0}</td>
                          <td>${waste.type || "N/A"}</td>
                        </tr>
                      `
                    ).join("")
                  : `<tr><td colspan="3">Aucun déchet</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="total">
          <p>Total de l'Achat: ${purchase.total || 0} MAD</p>
        </div>

        <div class="footer">
          <p>Merci pour votre confiance !</p>
          <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const confirmPrint = confirm("Voulez-vous imprimer la facture ?");
  if (!confirmPrint) {
    ShowToast.info("Impression annulée.");
    return;
  }

  const printWindow = window.open("", "", "height=600,width=800");
  if (!printWindow) {
    ShowToast.error("Veuillez autoriser les pop-ups pour imprimer la facture.");
    return;
  }
  printWindow.document.write(invoiceContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

export default PrintInvoice;