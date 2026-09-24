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
import type { Tone } from "./tones";

export interface ProductCardDef {
  key: string;
  name: string;
  /** Short label for the phone icon grid. */
  short: string;
  icon: LucideIcon;
  tone: Tone;
}

export const productCards: ProductCardDef[] = [
  { key: "Savings", name: "Savings Account", short: "Savings", icon: PiggyBank, tone: "blue" },
  { key: "Current", name: "Current Account", short: "Current", icon: Landmark, tone: "orange" },
  { key: "Salary", name: "Salary Account", short: "Salary", icon: Wallet, tone: "pink" },
  { key: "Home Loan", name: "Home Loan", short: "Home Loan", icon: Home, tone: "indigo" },
  { key: "Vehicle Loan", name: "Vehicle Loan", short: "Vehicle", icon: Car, tone: "teal" },
  { key: "Education/Personal Loan", name: "Education/Personal Loan", short: "Edu/Personal", icon: GraduationCap, tone: "violet" },
  { key: "Retails", name: "Retail Loan", short: "Retail", icon: Store, tone: "red" },
  { key: "MSME", name: "MSME", short: "MSME", icon: Building2, tone: "cyan" },
  { key: "Agriculture", name: "Agriculture", short: "Agri", icon: Wheat, tone: "green" },
  { key: "Insurance", name: "Insurance", short: "Insurance", icon: ShieldCheck, tone: "yellow" },
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
