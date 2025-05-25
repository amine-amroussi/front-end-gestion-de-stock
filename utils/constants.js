import {
  Package2,
  LayoutDashboard,
  ScanBarcode,
  Scan,
  User,
  Truck,
  Users,
  TicketCheck,
  MilkOff,
  ArrowDownUp,
} from "lucide-react";

export const links = [
  {
    name: "Table de board",
    url: "/",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    name: "Crates",
    url: "/crates",
    icon: <Package2  className="w-4 h-4"/>,
  },
  {
    name: "Produits",
    url: "/produits",
    icon: <ScanBarcode  className="w-4 h-4"/>,
  },
  {
    name: "Employée",
    url: "/employee",
    icon: <User  className="w-4 h-4"/>,
  },
  {
    name: "Camions",
    url: "/camions",
    icon: <Truck  className="w-4 h-4"/>,
  },
  {
    name: "Fournisseurs",
    url: "/fournisseurs",
    icon: <Users  className="w-4 h-4"/>,
  },
  {
    name: "Les Achats",
    url: "/achats",
    icon: <TicketCheck  className="w-4 h-4"/>,
  },
  {
    name: "Les Pertes",
    url: "/pertes",
    icon: <MilkOff className="w-4 h-4" />,
  },
  {
    name: "Tournnes",
    url: "/tournnes",
    icon: <ArrowDownUp  className="w-4 h-4"/>,
  },
];
