# MO Tracker — Functional Spec

Reference doc for the React frontend rebuild. Captures what the app does today
(backend `app.py` + frontend `templates/index.html`) so the rebuild can keep
functionality identical while replacing the UI. The FastAPI backend and its
API contract are **not** changing — this is a frontend-only rebuild.

## What the app is

A lead / marketing-performance tracker for Central Bank of India's Bhopal CAC.
An admin uploads a daily Excel export of leads; the backend parses it with
pandas and serves dashboards/reports filtered by product, region, branch, MO,
and time period. Marketing Officers (MOs) also log daily field activity (tour
plans, tour reports, CO compliance).

## Roles

- **admin** — 1 account. Full access: upload, targets, user management, CO
  reports, MO activity monitor.
- **administrator** — 3 accounts. Same as admin minus upload/targets/user
  management.
- **mo** — 22 named Marketing Officers (hardcoded in `app.py` as
  `MARKETING_OFFICERS`). Sees their own data only; logs their own activity.

## Pages

| Page | Who sees it | What it does |
|---|---|---|
| Login | everyone | Username/password → session cookie (`POST /api/login`). Note: current HTML pre-fills `admin`/`admin@123` as default input values — don't carry that into the rebuild. |
| Dashboard | all | Hero banner with greeting; mode toggle (Monthly/Daily/Cumulative) + month/product/sub-product filter cards; 10 product cards (Savings, Current, Salary, Home Loan, Vehicle Loan, Education/Personal Loan, Retail Loan, MSME, Agriculture, Insurance) each showing leads/converted/pending + amounts; 7-day daily-performance stacked bar chart with product filter; lead-share donut chart; pending-by-product and rejection-by-product horizontal bar lists; "last updated" timestamp. |
| MO Activity (MO view) | mo | 3 tabs: **Tour Plan** (per-category entries: Liability / Loans / Govt. Business / 3rd Party, only for today or tomorrow, multiple free-text entries per category), **Tour Reporting** (daily numbers+amounts for Home Loan / Vehicle Loan / Other Retail / Deposits / 3rd Party + Builder/Dealer tie-up counts, with a "both zero or both >0" validation rule), **CO Reporting** (LMS Updation Yes/No, Google Form Yes/No). Each tab also shows the MO's own saved history below the form. |
| MO Activity Monitor (admin/administrator view) | admin, administrator | Same nav entry, different page. Date/MO/Show("No — Not Done")/Focus filters; summary tiles (tour plans, reports, CO reported/partial/not-reported counts); daily monitoring status table across all MOs; 3 detail tabs (Tour Plans / Daily Tour Reports / CO Reports); 4 Excel+PDF download pairs (monitoring, tour_plan, tour_report, co). |
| Report | all | Product-category + sub-product filters; monthly tabs when in monthly mode; sub-product performance table (leads/converted/pending + amounts) and status breakdown table; Excel/PDF download. |
| Pending Leads | all | Same filter shape as Report, but only Open + Under Process leads, with region/branch/assigned-date columns; Excel/PDF download. |
| Notifications | all | Lists MOs/CACs whose retail or deposit achievement is below 20% of target for the selected period. Badge count shown in the sidebar nav item. MOs see only their own alert; admin/administrator see all. |
| Upload | admin only | Single Excel (`.xlsx`/`.xls`) file input. Validates required columns (`Amount`, `LeadStatus`, `CreatorName`, `SubProductName`, `AssignedDate`) before accepting; replaces the single active lead dataset used by every report. |
| CO Report | admin, administrator | 7 tabs: Report I (CO format), II (Retail), III (Savings), IV (Current), V (Salary), VI-D (Daily Deposit), VI-R (Daily Retail). Landscape-oriented tables built against `MONTHLY_TARGETS`. Excel/PDF/Print. |
| Targets | admin only | Read-only table of the 22 MOs' hardcoded monthly retail (₹ Crore) and deposit (account count) targets from `MONTHLY_TARGETS` in `app.py`. |
| User Management | admin only | Table of all users **with plaintext passwords visible** — a deliberate feature (so admin can read out/reset a forgotten password), not an oversight. Reset-password action per user. |
| Account | all | Change own password (requires current password). |

## API endpoints (`app.py`) — unchanged contract for the rebuild

**Auth**
- `POST /api/login` — `{username, password}` → session cookie + `{ok, username, role, mo_name, cac}`
- `POST /api/logout`
- `GET /api/me` — current session user

**Dashboard / reports**
- `GET /api/state` — is a lead file loaded, filename, row count, report date
- `POST /api/upload` — admin only, multipart Excel file
- `GET /api/dashboard-data` — `mode, report_date, product, subproduct` → dashboard cards + sub-category options
- `GET /api/daily-performance` — `product, report_date` → 7-day trend rows
- `GET /api/report` — `mode, report_date, region, product, mo, branch` → product-group summary rows
- `GET /api/product-detail` — `product, mode, report_date` → single product drill-down
- `GET /api/category-report` — `category, subproduct, mode, report_date` → report page data
- `GET /api/reports-full` — `mode, report_date, region, product, mo, branch` → extended per-MO report (targets + achievement %)
- `GET /api/pending-leads` — `category, subproduct, mode, report_date` → open/under-process leads
- `GET /api/notifications` — `mode, report_date` → below-20%-achievement alerts
- `GET /api/targets` — hardcoded `MONTHLY_TARGETS`
- `GET /api/co-report` — `report_type(I|II|III|IV|V|VI-D|VI-R), mode, report_date, daily_date`

**MO activity**
- `GET /api/activity` — current MO's own tour_plans/tour_reports/co_reports
- `POST /api/activity/tour-plan` — `{date, category, plan}` (upsert per user+date+category)
- `POST /api/activity/tour-report` — daily numbers/amounts (upsert per user+date)
- `POST /api/activity/co-report` — `{date, lms, google_form}` (upsert per user+date)
- `GET /api/admin/mo-activity` — `date, mo, show, focus` → admin monitor view

**Users**
- `GET /api/users` — admin only, includes plaintext passwords
- `POST /api/reset-user-password` — admin only, `{user_id, new_password}`
- `POST /api/change-password` — `{old_password, new_password}`, any logged-in user

**Downloads** (all `GET`, return file blobs, auth same as their data endpoint)
- `/download/category-excel`, `/download/category-pdf`
- `/download/pending-excel`, `/download/pending-pdf`
- `/download/co-excel`, `/download/co-pdf`
- `/download/pdf` (bare monthly/cumulative PDF)
- `/download/admin-activity-excel`, `/download/admin-activity-pdf` (+ trailing-slash aliases) — `report_type(monitoring|tour_plan|tour_report|co)`

## Data model (Supabase, migrated from local JSON — see `db.py`)

- `users` — user_id, password (plaintext, by design), role, name, mo_name, cac
- `tour_plans` — user_id, mo_name, date, category, plan, created_at (unique per user+date+category)
- `tour_reports` — user_id, date, + 12 numeric fields (unique per user+date)
- `co_reports` — user_id, date, lms, google_form (unique per user+date)
- `current_upload` — single-row pointer (filename, storage_path, last_updated) to the active lead Excel file in Supabase Storage bucket `uploads`
- The parsed lead dataset itself is **not** relational — it's loaded into a pandas DataFrame in memory from the uploaded Excel file and queried with pandas throughout `app.py`. Not part of this rebuild's scope; stays as-is.

## Confirmed UI/UX problems (why a rebuild, not a patch)

1. **Mobile nav is functionally broken.** `toggleSidebar()` sets two classes
   at once (`sidebar.open` and `app-shell.sidebar-collapsed`) left over from
   two different CSS eras. The later, higher-specificity rule
   (`.app-shell.sidebar-collapsed .sidebar{transform:translateX(-100%)}`)
   always wins over the older `.sidebar.open{transform:translateX(0)}` rule —
   confirmed via computed styles on the live site. **There is currently no
   way to open the nav menu on a phone.**
2. Three overlapping CSS eras stacked in one `<style>` block, each redefining
   the same classes (`.dashboard-grid`, `.dashboard-filters`, `.sidebar`
   appear 2–3 times) instead of replacing prior rules.
3. Entire frontend is one file: ~70 lines of dense CSS + one ~150-line,
   effectively-minified `<script>` with no components/build step, plus a
   giant inline base64 icon dictionary (single line, 100k+ characters).
4. Report/CO-report tables run up to 15 columns wide with horizontal-scroll
   as the only mobile strategy — works, but clunky.
5. Login page pre-fills the default admin password as the input's HTML
   `value` — should not carry over.

## Suggested rebuild stack

React + TypeScript + Vite, Tailwind for styling, TanStack Query for data
fetching (maps directly onto the existing `api()` wrapper pattern), TanStack
Table for the report tables, Recharts for the bar/donut charts. Same FastAPI
backend and endpoints throughout — this is a frontend-only swap. FastAPI would
serve the built static assets (or Vercel serves them via the `public/`
convention) alongside the existing API routes.
