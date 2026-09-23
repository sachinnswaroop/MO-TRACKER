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
  /** Tailwind classes for the icon chip background + icon color. */
  accent: string;
}

export const productCards: ProductCardDef[] = [
  { key: "Savings", name: "Savings Account", icon: PiggyBank, accent: "bg-blue-50 text-blue-600" },
  { key: "Current", name: "Current Account", icon: Landmark, accent: "bg-amber-50 text-amber-600" },
  { key: "Salary", name: "Salary Account", icon: Wallet, accent: "bg-rose-50 text-rose-600" },
  { key: "Home Loan", name: "Home Loan", icon: Home, accent: "bg-indigo-50 text-indigo-600" },
  { key: "Vehicle Loan", name: "Vehicle Loan", icon: Car, accent: "bg-teal-50 text-teal-600" },
  { key: "Education/Personal Loan", name: "Education/Personal Loan", icon: GraduationCap, accent: "bg-violet-50 text-violet-600" },
  { key: "Retails", name: "Retail Loan", icon: Store, accent: "bg-orange-50 text-orange-600" },
  { key: "MSME", name: "MSME", icon: Building2, accent: "bg-slate-100 text-slate-600" },
  { key: "Agriculture", name: "Agriculture", icon: Wheat, accent: "bg-green-50 text-green-600" },
  { key: "Insurance", name: "Insurance", icon: ShieldCheck, accent: "bg-pink-50 text-pink-600" },
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
