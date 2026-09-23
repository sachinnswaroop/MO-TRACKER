export type Role = "admin" | "administrator" | "mo";

export interface Me {
  username: string;
  role: Role;
  mo_name: string | null;
  cac: string | null;
}

export interface LoginResponse extends Me {
  ok: true;
}

export interface AppState {
  loaded: boolean;
  filename: string | null;
  rows: number;
  date_from: string | null;
  report_date: string | null;
  last_updated?: string | null;
}

export interface Summary {
  total_leads: number;
  lead_amount_lakh: number;
  converted: number;
  converted_actual_number: number;
  converted_actual_amount_lakh: number;
  pending: number;
  pending_amount_lakh: number;
  rejected: number;
  conversion_pct: number;
}

export interface StatusRow {
  status: string;
  number: number;
  amount_lakh: number;
  actual_number: number;
  actual_amount_lakh: number;
}

export interface SubproductRow {
  category: string;
  subproduct: string;
  total_leads: number;
  lead_amount_lakh: number;
  converted: number;
  converted_actual_number: number;
  converted_actual_amount_lakh: number;
  pending: number;
  pending_amount_lakh: number;
  statuses: StatusRow[];
}

export interface Option {
  value: string;
  label: string;
}

export interface DashboardCard {
  category: string;
  summary: Summary;
}

export interface DashboardData {
  mode: string;
  start: string;
  end: string;
  max_date: string;
  last_updated: string | null;
  months: string[];
  cards: DashboardCard[];
  subcategories: Option[];
}

export interface DailyPerformanceRow {
  date: string;
  label: string;
  leads: number;
  converted: number;
  pending: number;
  rejection: number;
}

export interface DailyPerformanceData {
  product: string;
  start: string;
  end: string;
  rows: DailyPerformanceRow[];
}

export interface CategoryReportData {
  category: string;
  subproduct: string;
  mode: string;
  start: string;
  end: string;
  summary: Summary;
  statuses: StatusRow[];
  subproducts: SubproductRow[];
  subcategories: Option[];
  months: string[];
}

export interface ProductRow {
  group: string;
  total_leads: number;
  lead_amount_lakh: number;
  converted: number;
  converted_actual_number: number;
  converted_actual_amount_lakh: number;
  pending: number;
  pending_amount_lakh: number;
  rejected: number;
}

export interface ReportData {
  mode: string;
  start: string;
  end: string;
  as_on: string;
  selected_report_date: string;
  products: ProductRow[];
  subproducts: SubproductRow[];
  statuses: StatusRow[];
  months: string[];
  max_date: string;
  regions: string[];
  branches: string[];
  last_updated: string | null;
}

export interface PendingLeadRow {
  product_name: string;
  number: number;
  amount_lakh: number;
  region: string;
  branch: string;
  assigned_date: string;
}

export interface PendingLeadsData {
  category: string;
  subproduct: string;
  mode: string;
  start: string;
  end: string;
  rows: PendingLeadRow[];
  subcategories: Option[];
  months: string[];
  max_date: string;
}

export interface NotificationItem {
  type: "Retail" | "Deposits";
  mo: string;
  cac: string;
  achievement: number;
  target: number;
  actual: number;
}

export interface NotificationsData {
  mode: string;
  start: string;
  end: string;
  items: NotificationItem[];
}

export interface TourPlan {
  id: number;
  user_id: string;
  mo_name: string;
  date: string;
  category: string;
  plan: string;
  created_at: string;
}

export interface TourReport {
  id: number;
  user_id: string;
  date: string;
  home_loan_no: number;
  home_loan_amt: number;
  vehicle_loan_no: number;
  vehicle_loan_amt: number;
  other_retail_no: number;
  other_retail_amt: number;
  builder_tieup: number;
  dealer_tieup: number;
  deposits_no: number;
  deposits_amt: number;
  third_party_no: number;
  third_party_amt: number;
}

export interface CoActivityReport {
  id: number;
  user_id: string;
  date: string;
  lms: string;
  google_form: string;
}

export interface MyActivity {
  tour_plans: TourPlan[];
  tour_reports: TourReport[];
  co_reports: CoActivityReport[];
}

export interface OfficerInfo {
  user_id: string;
  mo_name: string;
  cac: string;
}

export interface ActivityStatusRow {
  date: string;
  user_id: string;
  mo_name: string;
  cac: string;
  tour_plan: "Planned" | "Not Planned";
  tour_report: "Reported" | "Not Reported";
  co_report: "Reported" | "Partial" | "Not Reported";
}

export interface AdminActivityData {
  officers: OfficerInfo[];
  status: ActivityStatusRow[];
  tour_plans: (TourPlan & { cac: string })[];
  tour_reports: (TourReport & { mo_name: string; cac: string })[];
  co_reports: (CoActivityReport & { mo_name: string; cac: string })[];
  show: string;
  focus: string;
}

export interface UserRow {
  user_id: string;
  password: string;
  role: Role;
  name: string;
  cac: string | null;
}

export interface UsersData {
  users: UserRow[];
}

export type MonthlyTargets = Record<
  string,
  { retail: Record<string, number>; deposits: Record<string, number> }
>;

export interface TargetsData {
  targets: MonthlyTargets;
}

export interface MoReportRow {
  name: string;
  cac: string;
  summary: Summary;
  retail_target: Record<string, number>;
  retail_actual: Record<string, number>;
  deposit_target: Record<string, number>;
  deposit_actual: Record<string, number>;
}

export interface CoReportGroups {
  type: string;
  start?: string;
  end?: string;
  date?: string;
  rows: unknown[];
  groups?: Record<string, MoReportRow[]>;
}
