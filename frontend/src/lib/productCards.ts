import {
  PiggyBank,
  Landmark,
  Wallet,
  Home,
  Car,
  GraduationCap,
  Store,
  Building2,
  Wheat,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface ProductCardDef {
  key: string;
  name: string;
  icon: LucideIcon;
  gradient: string;
}

export const productCards: ProductCardDef[] = [
  { key: "Savings", name: "Savings Account", icon: PiggyBank, gradient: "from-sky-500 to-blue-600" },
  { key: "Current", name: "Current Account", icon: Landmark, gradient: "from-amber-400 to-yellow-500" },
  { key: "Salary", name: "Salary Account", icon: Wallet, gradient: "from-rose-400 to-pink-500" },
  { key: "Home Loan", name: "Home Loan", icon: Home, gradient: "from-white to-white" },
  { key: "Vehicle Loan", name: "Vehicle Loan", icon: Car, gradient: "from-white to-white" },
  { key: "Education/Personal Loan", name: "Education/Personal Loan", icon: GraduationCap, gradient: "from-white to-white" },
  { key: "Retails", name: "Retail Loan", icon: Store, gradient: "from-rose-50 to-rose-50" },
  { key: "MSME", name: "MSME", icon: Building2, gradient: "from-indigo-50 to-indigo-50" },
  { key: "Agriculture", name: "Agriculture", icon: Wheat, gradient: "from-indigo-50 to-indigo-50" },
  { key: "Insurance", name: "Insurance", icon: ShieldCheck, gradient: "from-indigo-50 to-indigo-50" },
];

export const chartColors: Record<string, string> = {
  Savings: "#2778e8",
  Current: "#f2a72e",
  Salary: "#ef5a79",
  TASC: "#8a65d6",
  "Other Deposits": "#21a873",
  Deposits: "#1769e8",
  "Home Loan": "#5b55e7",
  "Vehicle Loan": "#00a6a6",
  "Education/Personal Loan": "#f59a23",
  Retails: "#d95f59",
  "Other Loans": "#7b61a8",
  "3rd Party": "#4c78a8",
  MSME: "#7b61a8",
  Agriculture: "#2ca25f",
  Insurance: "#ef5a79",
};

export const reportItems = [
  "Deposits",
  "Retail",
  "Government Scheme",
  "MSME",
  "Agriculture",
  "Insurance",
  "Mutual Fund",
  "Builder Tie-up",
  "Dealer Tie-up",
  "Savings",
  "Current",
  "Salary",
  "TASC",
  "Other Deposits",
  "Home Loan",
  "Vehicle Loan",
  "Education/Personal Loan",
  "Retails",
  "Other Loans",
  "3rd Party",
];

export const reportCategories = ["All Products", ...reportItems];
