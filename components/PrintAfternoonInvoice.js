import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const PrintAfternoonInvoice = ({ invoiceData }) => {
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const handlePrint = () => {
    const invoiceContent = `
      Facture Post-Tournée N°: ${invoiceData.tripId || "N/A"}

      Camion: ${invoiceData.truck || "N/A"}
      Conducteur: ${invoiceData.driver || "N/A"}
      Vendeur: ${invoiceData.seller || "N/A"}
      Date de la Tournée: ${format(new Date(invoiceData.date), "dd/MM/yyyy")}
      Zone: ${invoiceData.zone || "N/A"}
      Imprimé le: ${currentDate}

      Produits
      Désignation | Qté Sortie (Caisses) | Qté Sortie (Unités) | Qté Retour (Caisses) | Qté Retour (Unités) | Qté Vendue | Prix Unitaire (MAD) | Total (MAD)
      ------------|---------------------|---------------------|---------------------|---------------------|------------|-------------------|------------
      ${
        invoiceData.products?.length > 0
          ? invoiceData.products
              .map(
                (product) => `
                  ${product.designation || "N/A"} | ${product.qttOut || 0} | ${
                  product.qttOutUnite || 0
                } | ${product.qttReutour || 0} | ${product.qttReutourUnite || 0} | ${
                  product.qttVendu || 0
                } | ${product.priceUnite} | ${product.totalRevenue}
                `
              )
              .join("")
          : "Aucun produit"
      }

      Caisses
      Désignation | Qté Sortie | Qté Entrée
      ------------|------------|------------
      ${
        invoiceData.boxes?.length > 0
          ? invoiceData.boxes
              .map(
                (box) => `
                  ${box.designation || "N/A"} | ${box.qttOut || 0} | ${box.qttIn || 0}
                `
              )
              .join("")
          : "Aucune caisse"
      }
      Total | ${invoiceData.boxes?.reduce((sum, box) => sum + (box.qttOut || 0), 0) || 0} | ${
      invoiceData.boxes?.reduce((sum, box) => sum + (box.qttIn || 0), 0) || 0
    }

      Déchets
      Produit | Type | Quantité
      --------|------|---------
      ${
        invoiceData.wastes?.length > 0
          ? invoiceData.wastes
              .map(
                (waste) => `
                  ${waste.product || "N/A"} | ${waste.type || "N/A"} | ${waste.qtt || 0}
                `
              )
              .join("")
          : "Aucun déchet"
      }

      Charges
      Type | Montant (MAD)
      ------|--------------
      ${
        invoiceData.charges?.length > 0
          ? invoiceData.charges
              .map(
                (charge) => `
                  ${charge.type || "N/A"} | ${(charge.amount || 0)}
                `
              )
              .join("")
          : "Aucune charge"
      }

      Résumé Financier
      Montant Attendu: ${(invoiceData.totals?.waitedAmount || 0)} MAD
      Montant Reçu: ${(invoiceData.totals?.receivedAmount || 0)} MAD
      Bénéfice: ${(invoiceData.totals?.benefit || 0)} MAD
      Différence: ${(invoiceData.totals?.deff || 0)} MAD

      Merci pour votre confiance !
      © ${new Date().getFullYear()} Entreprise Exemple
    `;

    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write("<pre>" + invoiceContent + "</pre>");
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } else {
      console.error("Failed to open print window. Please allow popups for this site.");
      alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups pour ce site.");
    }
  };

  return (
    <Button
      onClick={handlePrint}
      className="text-sm py-1.5 rounded-md bg-green-700 hover:bg-green-800 text-white"
    >
      Imprimer Facture Après-Midi
    </Button>
  );
};

export default PrintAfternoonInvoice;