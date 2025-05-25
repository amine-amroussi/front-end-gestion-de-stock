import { format } from "date-fns";

const PrintInvoice = (purchase) => {
  const totalBoxesIn =
    purchase.BoxAssociation?.reduce((sum, pb) => sum + pb.qttIn, 0) || 0;
  const totalBoxesOut =
    purchase.BoxAssociation?.reduce((sum, pb) => sum + pb.qttOut, 0) || 0;
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  console.log(purchase);

  const invoiceContent = `
    <html>
      <head>
        <style>
          @media print {
          * {box-sizing: border-box; margin: 0; padding: 0;}  
            body { margin: 0; padding: 20mm; font-family: Arial, sans-serif; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; padding: 10mm 0; border-bottom: 2px solid #000; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; }
            .details, .items { margin-top: 20px; }
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
            <p><strong>Facture N°:</strong> ${purchase.id}</p>
            <p><strong>Fournisseur:</strong> ${
              purchase.SupplierAssociation?.name || "N/A"
            }</p>
            <p><strong>Date d'Achat:</strong> ${format(
              new Date(purchase.date),
              "dd/MM/yyyy"
            )}</p>
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
                 purchase.ProductAssociation?.map(
                   (prod) => `
  <tr>
    <td>${prod.ProductAssociation?.designation || "N/A"}</td>
    <td>${prod.qtt}</td>
    <td>${prod.qttUnite}</td>
    <td>${prod.price}</td>
  </tr>
`
                 ).join("") || '<tr><td colspan="4">Aucun produit</td></tr>'
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
                  purchase.BoxAssociation?.map(
                    (box) => `
  <tr>
    <td>${box.BoxAssociation?.designation || "N/A"}</td>
    <td>${box.qttIn}</td>
    <td>${box.qttOut}</td>
  </tr>
`
                  ).join("") || '<tr><td colspan="3">Aucune caisse</td></tr>'
                }
                <tr><td><strong>Total</strong></td><td>${totalBoxesIn}</td><td>${totalBoxesOut}</td></tr>
              </tbody>
            </table>
            <h3>Déchets</h3>
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
                  purchase.purchaseWaste
                    ?.map(
                      (waste) => `
                  <tr>
                    <td>${waste.designation || "N/A"}</td>
                    <td>${waste.qtt}</td>
                    <td>${waste.type}</td>
                  </tr>
                `
                    )
                    .join("") || '<tr><td colspan="3">Aucun déchet</td></tr>'
                }
              </tbody>
            </table>
          </div>
          <div class="total">
            <p><strong>Total de l'Achat:</strong> ${purchase.total} MAD</p>
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

  const printWindow = window.open("", "", "height=600,width=800");
  printWindow.document.write(invoiceContent);
  printWindow.document.close();
};

export default PrintInvoice;
