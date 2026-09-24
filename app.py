from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import JSONResponse, Response, FileResponse
from starlette.middleware.sessions import SessionMiddleware
import pandas as pd
import os, io
from datetime import datetime
from zoneinfo import ZoneInfo
import db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.environ.get("APP_SECRET", "local-marketing-report-secret"))

DEFAULT_USERS = {
    "admin": {"password": "admin@123", "role": "admin", "name": "Administrator"},
}

ADMINISTRATORS = [
    ("administrator1", "Administrator 1"),
    ("administrator2", "Administrator 2"),
    ("administrator3", "Administrator 3"),
]

def build_default_users():
    out = dict(DEFAULT_USERS)
    for i, (name, _cac) in enumerate(MARKETING_OFFICERS, 1):
        out[f"mo{i:02d}"] = {"password": f"MO{i:02d}@2026", "role": "mo", "name": name, "mo_name": name, "cac": _cac}
    for uid, display in ADMINISTRATORS:
        out[uid] = {"password": f"Admin@{uid[-1]}2026", "role": "administrator", "name": display}
    return out


MARKETING_OFFICERS = [
    ("Abhijeet Singh Bhadouriya", "Bhopal"), ("Amit Sahu", "Bhopal"),
    ("Atul Sanodiya", "Bhopal"), ("Chandresh Cholkar", "Bhopal"),
    ("Gaurav Ojha", "Bhopal"), ("Gopal Ji", "Bhopal"),
    ("Jitendra Singh", "Bhopal"), ("Paras Bandil", "Bhopal"),
    ("Sakshi Shrivastava", "Bhopal"), ("Satish Yadav", "Bhopal"),
    ("Saurabh Yadav", "Bhopal"), ("Shubham Singh", "Bhopal"),
    ("Shukla Saumitra", "Bhopal"), ("Tarun Khatri", "Bhopal"),
    ("Rohit Muley", "Chhindwara"), ("Vishakha Valkey", "Chhindwara"),
    ("Jajvalya Holkar", "Indore"), ("Sakshi Jain", "Indore"),
    ("Sudhanshu Soni", "Indore"), ("Ganesh Amkare", "Indore"),
    ("Akshay Chourasia", "Jabalpur"), ("Somesh Gautam", "Jabalpur"),
]

PRODUCT_GROUPS = {
    "Deposits": ["Cent Achiever", "Cent Prestige", "Current Account", "FCNR(B)", "FD", "Salary Account", "Saving Account", "TASC Accounts"],
    "Retail": ["Car Loan", "Education Loan", "Housing Loan", "Personal Loan", "Retail - Gold Loan", "Retail - Other"],
    "Government Scheme": ["PPF", "Senior Citizen Saving Scheme", "Sukanya Samriddhi Yojna", "Pension Accounts"],
    "MSME": ["Business Loan", "Cent Business", "Cent Hotel", "MSME - Other"],
    "Agriculture": ["Agriculture- Other /Agri Allied Activities", "Cent Cluster_food Processing", "Gold Loan", "Kisan Credit Card"],
    "Insurance": ["Life Insurance", "Term Insurance", "Shop Insurance"],
    "Mutual Fund": ["Mutual Fund", "Mutual Funds"],
    "Builder Tie-up": [], "Dealer Tie-up": [],
}
SUB_TO_GROUP = {s.upper(): g for g, subs in PRODUCT_GROUPS.items() for s in subs}
LOAN_GROUPS = {"Retail", "MSME", "Agriculture"}

MONTHLY_TARGETS = {
    "Abhijeet Singh Bhadouriya": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Amit Sahu": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Atul Sanodiya": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Chandresh Cholkar": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Gaurav Ojha": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Gopal Ji": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 40, "CD": 10, "Salary": 10}},
    "Jitendra Singh": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 40, "CD": 10, "Salary": 10}},
    "Paras Bandil": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 40, "CD": 10, "Salary": 10}},
    "Sakshi Shrivastava": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Satish Yadav": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Saurabh Yadav": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 40, "CD": 10, "Salary": 10}},
    "Shubham Singh": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Shukla Saumitra": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Tarun Khatri": {"retail": {"Home Loan": 5.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 1.00}, "deposits": {"SB": 50, "CD": 10, "Salary": 30}},
    "Rohit Muley": {"retail": {"Home Loan": 2.00, "Vehicle Loan": 0.75, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 100, "CD": 20, "Salary": 20}},
    "Vishakha Valkey": {"retail": {"Home Loan": 2.00, "Vehicle Loan": 0.75, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 100, "CD": 20, "Salary": 20}},
    "Jajvalya Holkar": {"retail": {"Home Loan": 3.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 75, "CD": 15, "Salary": 25}},
    "Sakshi Jain": {"retail": {"Home Loan": 3.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 75, "CD": 15, "Salary": 25}},
    "Sudhanshu Soni": {"retail": {"Home Loan": 3.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 75, "CD": 15, "Salary": 25}},
    "Ganesh Amkare": {"retail": {"Home Loan": 3.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 75, "CD": 15, "Salary": 25}},
    "Akshay Chourasia": {"retail": {"Home Loan": 3.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 75, "CD": 15, "Salary": 25}},
    "Somesh Gautam": {"retail": {"Home Loan": 3.00, "Vehicle Loan": 1.00, "Education Loan/Personal Loan": 0.50}, "deposits": {"SB": 75, "CD": 15, "Salary": 25}},
}

DATA = {"df": None, "filename": None, "last_updated": None}
def activity_store():
    return db.fetch_activity_store()

def role_is_mo(request):
    return request.session.get("role") == "mo"


def users():
    return db.seed_missing_users(build_default_users())


def clean_text(v):
    if pd.isna(v): return ""
    return " ".join(str(v).strip().split())


def normalize_name(v): return clean_text(v).upper()


def clean_amount(series):
    return pd.to_numeric(series.astype(str).str.replace(",", "", regex=False).str.replace("₹", "", regex=False).str.replace("Rs.", "", regex=False).str.replace("Rs", "", regex=False).str.strip(), errors="coerce").fillna(0)


def group_for(row):
    sub = normalize_name(row.get("SubProductName", "")); prod = normalize_name(row.get("ProductName", ""))
    if sub in SUB_TO_GROUP: return SUB_TO_GROUP[sub]
    if "BUILDER" in prod: return "Builder Tie-up"
    if "DEALER" in prod: return "Dealer Tie-up"
    for g in PRODUCT_GROUPS:
        if prod == g.upper(): return g
    return "Other"


def prepare_df(path):
    df = pd.read_excel(path)
    if "LeadRefNum" in df.columns: df = df.drop_duplicates(subset=["LeadRefNum"], keep="last").reset_index(drop=True)
    required = ["Amount", "LeadStatus", "CreatorName", "SubProductName", "AssignedDate"]
    missing = [c for c in required if c not in df.columns]
    if missing: raise ValueError("Missing columns: " + ", ".join(missing))
    amount_cols = ["Amount", "SanctionedAmount", "DisbursedAmount", "DepositAmount", "PolicyPremiumAmount", "MutualFundInvestedAmount", "DematInvestedAmount"]
    for c in amount_cols:
        df[c] = clean_amount(df[c]) if c in df.columns else 0.0
    df["AssignedDate"] = pd.to_datetime(df["AssignedDate"], errors="coerce", dayfirst=True)
    df = df[df["AssignedDate"].notna()].copy()
    df["MO_Clean"] = df["CreatorName"].map(normalize_name)
    df = df[~df["MO_Clean"].isin({"ASHLESHA A", "SHUBHAM GARG"})].copy()
    df["Status_Clean"] = df["LeadStatus"].map(normalize_name)
    df["Sub_Clean"] = df["SubProductName"].map(normalize_name)
    df["Group"] = df.apply(group_for, axis=1)
    return df


def load_latest_upload():
    row = db.get_current_upload()
    if not row: return
    try:
        file_bytes = db.download_current_upload_bytes(row["storage_path"])
        DATA["df"] = prepare_df(io.BytesIO(file_bytes))
        DATA["filename"] = row["filename"]
        DATA["last_updated"] = pd.Timestamp(row["last_updated"]).tz_convert(ZoneInfo("Asia/Kolkata")).strftime("%d %b %Y, %I:%M %p")
    except Exception: DATA["df"] = None; DATA["filename"] = None

load_latest_upload()
users()


def auth(request, role=None):
    u = request.session.get("username")
    return bool(u) and (not role or request.session.get("role") == role)


def money_lakh(v): return round(float(v) / 100000, 2)


def actual_progress(df):
    if df is None or df.empty: return 0, 0.0
    conv = df[df["Status_Clean"] == "CONVERTED"]
    number = 0; amount = 0.0
    for _, row in conv.iterrows():
        group = row["Group"]
        if group in LOAN_GROUPS:
            account = clean_text(row.get("LoanAccountNo", "")); amount += float(row.get("SanctionedAmount", 0))
        elif group in {"Deposits", "Government Scheme"}:
            account = clean_text(row.get("DepositAccountNo", "")); amount += float(row.get("DepositAmount", 0))
        elif group == "Insurance":
            account = clean_text(row.get("PolicyNumber", "")); amount += float(row.get("PolicyPremiumAmount", 0))
        elif group == "Mutual Fund":
            account = clean_text(row.get("MutualFundFolioNo", "")); amount += float(row.get("MutualFundInvestedAmount", 0))
        else: account = ""
        number += int(bool(account))
    return number, money_lakh(amount)


def target_config(name):
    return MONTHLY_TARGETS.get(name, {"retail": {}, "deposits": {}})


def achievement(actual, target): return round(float(actual) / float(target) * 100, 1) if float(target or 0) else 0.0


def period_bounds(mode, report_date):
    maxd = DATA["df"]["AssignedDate"].max(); rd = pd.Timestamp(report_date) if report_date else maxd
    rd = min(rd, maxd)
    if mode == "daily":
        start = rd.normalize()
        return start, start
    if mode == "cumulative":
        start = DATA["df"]["AssignedDate"].min().normalize()
        return start, rd
    start = rd.replace(day=1)
    end = maxd if (start.year == maxd.year and start.month == maxd.month) else start + pd.offsets.MonthEnd(0)
    return start, end

def effective_mo(request, requested="All Officers"):
    if request.session.get("role") != "mo":
        return requested
    uid = request.session.get("username", "")
    return users().get(uid, {}).get("mo_name", requested)


def filter_df(df, start, end, region="All Regions", product="All Products", mo="All Officers", branch="All Branches"):
    out = df[(df["AssignedDate"] >= start) & (df["AssignedDate"] < pd.Timestamp(end) + pd.Timedelta(days=1))].copy()
    if region != "All Regions": out = out[out["RegionName"].map(clean_text) == region]
    if product != "All Products": out = out[out["Group"] == product]
    if mo != "All Officers": out = out[out["MO_Clean"] == normalize_name(mo)]
    if branch != "All Branches": out = out[out["BranchName"].map(clean_text) == branch]
    return out


def summary(df):
    converted = df[df["Status_Clean"] == "CONVERTED"]; pending = df[df["Status_Clean"].isin(["OPEN", "UNDER PROCESS"])]
    actual_n, actual_amt = actual_progress(df)
    return {"total_leads": int(len(df)), "lead_amount_lakh": money_lakh(df["Amount"].sum()), "converted": int(len(converted)), "converted_actual_number": int(actual_n), "converted_actual_amount_lakh": actual_amt, "pending": int(len(pending)), "pending_amount_lakh": money_lakh(pending["Amount"].sum()), "rejected": int(df["Status_Clean"].isin(["NON CONVERTED","NOT INTERESTED","REJECTED","REJECT"]).sum()), "conversion_pct": round(len(converted)/len(df)*100,1) if len(df) else 0}


def product_row(df, group):
    m=df[df["Group"]==group]; conv=m[m["Status_Clean"]=="CONVERTED"]; pending=m[m["Status_Clean"].isin(["OPEN","UNDER PROCESS"])]
    an, aa=actual_progress(m)
    return {"group":group,"total_leads":int(len(m)),"lead_amount_lakh":money_lakh(m["Amount"].sum()),"converted":int(len(conv)),"converted_actual_number":an,"converted_actual_amount_lakh":aa,"pending":int(len(pending)),"pending_amount_lakh":money_lakh(pending["Amount"].sum()),"rejected":int(m["Status_Clean"].isin(["NON CONVERTED","NOT INTERESTED","REJECTED","REJECT"]).sum())}


def status_rows(df):
    labels={"CONVERTED":"Converted","OPEN":"Open","UNDER PROCESS":"Under Process","NON CONVERTED":"Non Converted","NOT INTERESTED":"Not Interested"}
    out=[]
    for st,label in labels.items():
        m=df[df["Status_Clean"]==st]; an,aa=actual_progress(m)
        out.append({"status":label,"number":int(len(m)),"amount_lakh":money_lakh(m["Amount"].sum()),"actual_number":an,"actual_amount_lakh":aa})
    return out


def subproduct_rows(df, group=None):
    m=df if not group else df[df["Group"]==group]; rows=[]
    for sub in sorted([x for x in m["Sub_Clean"].dropna().unique() if x]):
        sm=m[m["Sub_Clean"]==sub]; conv=sm[sm["Status_Clean"]=="CONVERTED"]; pending=sm[sm["Status_Clean"].isin(["OPEN","UNDER PROCESS"])]
        an,aa=actual_progress(sm); display=clean_text(sm["SubProductName"].iloc[0]) if len(sm) else sub.title()
        rows.append({"category":clean_text(sm["Group"].iloc[0]) if len(sm) else "","subproduct":display,"total_leads":int(len(sm)),"lead_amount_lakh":money_lakh(sm["Amount"].sum()),"converted":int(len(conv)),"converted_actual_number":an,"converted_actual_amount_lakh":aa,"pending":int(len(pending)),"pending_amount_lakh":money_lakh(pending["Amount"].sum()),"statuses":status_rows(sm)})
    return rows


def mo_rows(df):
    rows=[]
    for name,cac in MARKETING_OFFICERS:
        m=df[df["MO_Clean"]==name.upper()]; s=summary(m); cfg=target_config(name)
        retail_actual={"Home Loan":0,"Vehicle Loan":0,"Education Loan/Personal Loan":0}
        mapping={"Home Loan":["HOUSING LOAN"],"Vehicle Loan":["CAR LOAN"],"Education Loan/Personal Loan":["EDUCATION LOAN","PERSONAL LOAN"]}
        for label,subs in mapping.items():
            sm=m[m["Sub_Clean"].isin(subs)]; _,amt=actual_progress(sm); retail_actual[label]=round(amt/100,2)
        retail_actual["Total Retail"]=round(sum(retail_actual.values()),2)
        dep_actual={}
        for label,sub in [("SB","SAVING ACCOUNT"),("CD","CURRENT ACCOUNT"),("Salary","SALARY ACCOUNT")]:
            sm=m[m["Sub_Clean"]==sub]; an,_=actual_progress(sm); dep_actual[label]=an
        dep_actual["Total Deposits"]=sum(dep_actual.values())
        rows.append({"name":name,"cac":cac,"summary":s,"retail_target":cfg["retail"],"retail_actual":retail_actual,"deposit_target":cfg["deposits"],"deposit_actual":dep_actual})
    return rows


def cac_groups(rows):
    groups={}
    for r in rows: groups.setdefault(r["cac"],[]).append(r)
    return groups


def daily_deposit(df, date):
    day=pd.Timestamp(date).date(); m=df[df["AssignedDate"].dt.date==day]; rows=[]
    for name,cac in MARKETING_OFFICERS:
        x=m[m["MO_Clean"]==name.upper()]
        def cnt(sub,status=None):
            q=x[x["Sub_Clean"]==sub]
            return int((q["Status_Clean"]==status).sum()) if status else int(len(q))
        rows.append({"mo":name,"cac":cac,"sb_lead":cnt("SAVING ACCOUNT"),"sb_conv":cnt("SAVING ACCOUNT","CONVERTED"),"cd_lead":cnt("CURRENT ACCOUNT"),"cd_conv":cnt("CURRENT ACCOUNT","CONVERTED"),"salary_lead":cnt("SALARY ACCOUNT"),"salary_conv":cnt("SALARY ACCOUNT","CONVERTED")})
    return rows


def daily_retail(df, date):
    day=pd.Timestamp(date).date(); m=df[df["AssignedDate"].dt.date==day]; rows=[]
    categories={"Home Loan":["HOUSING LOAN"],"Vehicle Loan":["CAR LOAN"],"Edu/Personal Loan":["EDUCATION LOAN","PERSONAL LOAN"],"Retail Loan":["RETAIL - GOLD LOAN","RETAIL - OTHER"]}
    for name,cac in MARKETING_OFFICERS:
        x=m[m["MO_Clean"]==name.upper()]; row={"mo":name,"cac":cac}
        for label,subs in categories.items():
            q=x[x["Sub_Clean"].isin(subs)]; conv=q[q["Status_Clean"]=="CONVERTED"]
            row[label]={"lead_no":int(len(q)),"converted_no":int(len(conv)),"lead_amt_crore":round(float(q["Amount"].sum())/10000000,2),"converted_amt_crore":round(float(conv["SanctionedAmount"].sum())/10000000,2)}
        rows.append(row)
    return rows


def co_report_data(report_type, mode="monthly", report_date=None, daily_date=None):
    df=DATA["df"]
    maxd=df["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd; start,end=period_bounds(mode,rd); m=filter_df(df,start,end)
    if report_type=="I": return {"type":"I","start":start,"end":end,"rows":mo_rows(m),"groups":cac_groups(mo_rows(m))}
    if report_type=="II": return {"type":"II","start":start,"end":end,"rows":mo_rows(m),"groups":cac_groups(mo_rows(m))}
    if report_type in {"III","IV","V"}: return {"type":report_type,"start":start,"end":end,"rows":mo_rows(m),"groups":cac_groups(mo_rows(m))}
    if report_type=="VI-D":
        dd=pd.Timestamp(daily_date or maxd).date(); return {"type":"VI-D","date":dd,"rows":daily_deposit(df,dd)}
    dd=pd.Timestamp(daily_date or maxd).date(); return {"type":"VI-R","date":dd,"rows":daily_retail(df,dd)}


def report_extended_rows(df):
    rows=[]
    for name,cac in MARKETING_OFFICERS:
        m=df[df["MO_Clean"]==name.upper()]
        s=summary(m)
        cfg=target_config(name)
        retail_actual={"Home Loan":0.0,"Vehicle Loan":0.0,"Education Loan/Personal Loan":0.0}
        mapping={"Home Loan":["HOUSING LOAN"],"Vehicle Loan":["CAR LOAN"],"Education Loan/Personal Loan":["EDUCATION LOAN","PERSONAL LOAN"]}
        for label,subs in mapping.items():
            sm=m[m["Sub_Clean"].isin(subs)]
            _,amt=actual_progress(sm)
            retail_actual[label]=round(amt/100,2)
        retail_actual["Total Retail"]=round(sum(retail_actual.values()),2)
        dep_actual={}
        for label,sub in [("SB","SAVING ACCOUNT"),("CD","CURRENT ACCOUNT"),("Salary","SALARY ACCOUNT")]:
            sm=m[m["Sub_Clean"]==sub]
            an,_=actual_progress(sm)
            dep_actual[label]=an
        dep_actual["Total Deposits"]=sum(dep_actual.values())
        retail_target=cfg["retail"]
        dep_target=cfg["deposits"]
        retail_ach=achievement(retail_actual["Total Retail"],sum(retail_target.values()))
        dep_ach=achievement(dep_actual["Total Deposits"],sum(dep_target.values()))
        rows.append({"mo":name,"cac":cac,"leads":s["total_leads"],"lead_amount_lakh":s["lead_amount_lakh"],"converted":s["converted"],"converted_actual_amount_lakh":s["converted_actual_amount_lakh"],"pending":s["pending"],"pending_amount_lakh":s["pending_amount_lakh"],"retail_target_cr":sum(retail_target.values()),"retail_actual_cr":retail_actual["Total Retail"],"retail_ach_pct":retail_ach,"deposit_target_no":sum(dep_target.values()),"deposit_actual_no":dep_actual["Total Deposits"],"deposit_ach_pct":dep_ach,"retail_target":retail_target,"retail_actual":retail_actual,"deposit_target":dep_target,"deposit_actual":dep_actual})
    return rows

def extended_report(df):
    mos=report_extended_rows(df)
    pending=df[df["Status_Clean"].isin(["OPEN","UNDER PROCESS"])]
    # Nil: zero actual against the relevant monthly target, separately for Retail and Deposits.
    nil_retail=[r for r in mos if r["retail_actual_cr"]<=0 and r["retail_target_cr"]>0]
    nil_deposit=[r for r in mos if r["deposit_actual_no"]<=0 and r["deposit_target_no"]>0]
    # Low: below 20% achievement, separately for Retail amount and Deposit number.
    low_retail=[r for r in mos if 0 < r["retail_ach_pct"] < 20]
    low_deposit=[r for r in mos if 0 < r["deposit_ach_pct"] < 20]
    region_rows=[]
    for region,g in df.groupby(df["RegionName"].map(clean_text)):
        conv=g[g["Status_Clean"]=="CONVERTED"]; pend=g[g["Status_Clean"].isin(["OPEN","UNDER PROCESS"])]
        _,act=actual_progress(g)
        region_rows.append({"region":region or "Blank","leads":len(g),"lead_amount_lakh":money_lakh(g["Amount"].sum()),"converted":len(conv),"converted_actual_amount_lakh":act,"pending":len(pend),"pending_amount_lakh":money_lakh(pend["Amount"].sum())})
    branch_rows=[]
    for branch,g in df.groupby(df["BranchName"].map(clean_text)):
        conv=g[g["Status_Clean"]=="CONVERTED"]; pend=g[g["Status_Clean"].isin(["OPEN","UNDER PROCESS"])]
        _,act=actual_progress(g)
        branch_rows.append({"branch":branch or "Blank","region":clean_text(g["RegionName"].iloc[0]) if len(g) else "","leads":len(g),"lead_amount_lakh":money_lakh(g["Amount"].sum()),"converted":len(conv),"converted_actual_amount_lakh":act,"pending":len(pend),"pending_amount_lakh":money_lakh(pend["Amount"].sum())})
    cac={}
    for r in mos:
        q=cac.setdefault(r["cac"],{"cac":r["cac"],"leads":0,"lead_amount_lakh":0.0,"converted":0,"converted_actual_amount_lakh":0.0,"pending":0,"pending_amount_lakh":0.0})
        for k in ["leads","converted","pending"]: q[k]+=r[k]
        for k in ["lead_amount_lakh","converted_actual_amount_lakh","pending_amount_lakh"]: q[k]+=r[k]
    return {"officers":mos,"nil_retail":nil_retail,"nil_deposit":nil_deposit,"low_retail":low_retail,"low_deposit":low_deposit,"regions":sorted(region_rows,key=lambda x:x["pending_amount_lakh"],reverse=True),"branches":sorted(branch_rows,key=lambda x:x["pending_amount_lakh"],reverse=True),"cac":sorted(cac.values(),key=lambda x:x["pending_amount_lakh"],reverse=True)}


def fmt_dt(x): return pd.Timestamp(x).strftime("%d/%m/%Y")


def _report_rows(report_type, data):
    rows=[]
    groups=data["groups"]
    if report_type=="I":
        for cac, rs in groups.items():
            subtotal={"kind":"subtotal","cac":cac,"sb_t":0,"sb_a":0,"cd_t":0,"cd_a":0,"sal_t":0,"sal_a":0,"ret_t":0.0,"ret_a":0.0}
            for r in rs:
                rt=r["retail_target"]; ra=r["retail_actual"]; dt=r["deposit_target"]; da=r["deposit_actual"]; rtgt=sum(rt.values())
                rows.append({"kind":"data","cac":cac,"mo":r["name"],"sb_t":dt["SB"],"sb_a":da["SB"],"cd_t":dt["CD"],"cd_a":da["CD"],"sal_t":dt["Salary"],"sal_a":da["Salary"],"ret_t":rtgt,"ret_a":ra["Total Retail"]})
                subtotal["sb_t"]+=dt["SB"]; subtotal["sb_a"]+=da["SB"]; subtotal["cd_t"]+=dt["CD"]; subtotal["cd_a"]+=da["CD"]; subtotal["sal_t"]+=dt["Salary"]; subtotal["sal_a"]+=da["Salary"]; subtotal["ret_t"]+=rtgt; subtotal["ret_a"]+=ra["Total Retail"]
            rows.append(subtotal)
        totals={"kind":"grand","cac":"Grand Total","sb_t":0,"sb_a":0,"cd_t":0,"cd_a":0,"sal_t":0,"sal_a":0,"ret_t":0.0,"ret_a":0.0}
        for r in rows:
            if r["kind"] in ("data","subtotal"):
                for k in totals:
                    if k not in ("kind","cac"): totals[k]+=r.get(k,0) if r["kind"]=="subtotal" else 0
        # Sum only CAC subtotals to avoid double counting
        totals={"kind":"grand","cac":"Grand Total","sb_t":sum(r["sb_t"] for r in rows if r["kind"]=="subtotal"),"sb_a":sum(r["sb_a"] for r in rows if r["kind"]=="subtotal"),"cd_t":sum(r["cd_t"] for r in rows if r["kind"]=="subtotal"),"cd_a":sum(r["cd_a"] for r in rows if r["kind"]=="subtotal"),"sal_t":sum(r["sal_t"] for r in rows if r["kind"]=="subtotal"),"sal_a":sum(r["sal_a"] for r in rows if r["kind"]=="subtotal"),"ret_t":sum(r["ret_t"] for r in rows if r["kind"]=="subtotal"),"ret_a":sum(r["ret_a"] for r in rows if r["kind"]=="subtotal")}
        rows.append(totals)
        return rows
    for cac, rs in groups.items():
        if report_type=="II":
            st={"kind":"subtotal","cac":cac,"vals":{k:[0.0,0.0] for k in ["Home Loan","Vehicle Loan","Education Loan/Personal Loan"]}}
            for r in rs:
                rt=r["retail_target"]; ra=r["retail_actual"]
                rows.append({"kind":"data","cac":cac,"mo":r["name"],"rt":rt,"ra":ra})
                for k in st["vals"]: st["vals"][k][0]+=rt[k]; st["vals"][k][1]+=ra[k]
            rows.append(st)
        else:
            key={"III":"SB","IV":"CD","V":"Salary"}[report_type]
            st={"kind":"subtotal","cac":cac,"target":0,"achi":0,"amt":0.0}
            for r in rs:
                t=r["deposit_target"][key]; a=r["deposit_actual"][key]
                rows.append({"kind":"data","cac":cac,"mo":r["name"],"target":t,"achi":a,"amt":0.0})
                st["target"]+=t; st["achi"]+=a
            rows.append(st)
    if report_type=="II":
        gt={"kind":"grand","cac":"Grand Total","vals":{k:[0.0,0.0] for k in ["Home Loan","Vehicle Loan","Education Loan/Personal Loan"]}}
        for r in rows:
            if r["kind"]=="subtotal":
                for k,v in r["vals"].items(): gt["vals"][k][0]+=v[0]; gt["vals"][k][1]+=v[1]
        rows.append(gt)
    else:
        rows.append({"kind":"grand","cac":"Grand Total","target":sum(r["target"] for r in rows if r["kind"]=="subtotal"),"achi":sum(r["achi"] for r in rows if r["kind"]=="subtotal"),"amt":0.0})
    return rows


def report_excel(report_type, data):
    out=io.BytesIO()
    with pd.ExcelWriter(out,engine="openpyxl") as writer:
        rows=_report_rows(report_type,data)
        export=[]; no=1
        for r in rows:
            if report_type=="I":
                if r["kind"]=="data": export.append({"Sl No.":no,"CAC Name":r["cac"],"MO Name":r["mo"],"SB Target No":r["sb_t"],"SB Achi No":r["sb_a"],"SB Achi%":achievement(r["sb_a"],r["sb_t"]),"CD Target No":r["cd_t"],"CD Achi No":r["cd_a"],"CD Achi%":achievement(r["cd_a"],r["cd_t"]),"Salary Target No":r["sal_t"],"Salary Achi No":r["sal_a"],"Salary Achi%":achievement(r["sal_a"],r["sal_t"]),"Retail Target Amt Cr":r["ret_t"],"Retail Achi Amt Cr":r["ret_a"],"Retail Achi%":achievement(r["ret_a"],r["ret_t"])}); no+=1
                else: export.append({"Sl No.":"","CAC Name":r["cac"],"MO Name":"","SB Target No":r["sb_t"],"SB Achi No":r["sb_a"],"SB Achi%":achievement(r["sb_a"],r["sb_t"]),"CD Target No":r["cd_t"],"CD Achi No":r["cd_a"],"CD Achi%":achievement(r["cd_a"],r["cd_t"]),"Salary Target No":r["sal_t"],"Salary Achi No":r["sal_a"],"Salary Achi%":achievement(r["sal_a"],r["sal_t"]),"Retail Target Amt Cr":r["ret_t"],"Retail Achi Amt Cr":r["ret_a"],"Retail Achi%":achievement(r["ret_a"],r["ret_t"])})
                if r["kind"]=="grand": export[-1]["CAC Name"]="Grand Total"
            elif report_type=="II":
                if r["kind"]=="data":
                    d={"Sl No.":no,"CAC Name":r["cac"],"MO Name":r["mo"]}; no+=1
                    for k in ["Home Loan","Vehicle Loan","Education Loan/Personal Loan"]: d.update({f"{k} No.":"",f"{k} Amt.":r["rt"][k],f"{k} Achi":r["ra"][k],f"{k} Achi%":achievement(r["ra"][k],r["rt"][k])})
                    total_t=sum(r["rt"].values()); total_a=r["ra"]["Total Retail"]; d.update({"Total Retail No.":"","Total Retail Amt.":total_t,"Total Retail Achi":total_a,"Total Retail Achi%":achievement(total_a,total_t)}); export.append(d)
                else:
                    d={"Sl No.":"","CAC Name":r["cac"],"MO Name":""}
                    for k,v in r["vals"].items(): d.update({f"{k} No.":"",f"{k} Amt.":v[0],f"{k} Achi":v[1],f"{k} Achi%":achievement(v[1],v[0])})
                    tt=sum(v[0] for v in r["vals"].values()); aa=sum(v[1] for v in r["vals"].values()); d.update({"Total Retail No.":"","Total Retail Amt.":tt,"Total Retail Achi":aa,"Total Retail Achi%":achievement(aa,tt)}); export.append(d)
            else:
                if r["kind"]=="data":
                    d={"Sl No.":no,"CAC Name":r["cac"],"MO Name":r["mo"],"Target No":r["target"]}; no+=1
                    if report_type!="V": d["Target Amt"]=""
                    d["Achi No"]=r["achi"]; d["Achi Amt"]=r["amt"]; d["Achi%"]=achievement(r["achi"],r["target"]); export.append(d)
                else:
                    d={"Sl No.":"","CAC Name":r["cac"],"MO Name":"","Target No":r["target"]};
                    if report_type!="V": d["Target Amt"]=""
                    d["Achi No"]=r["achi"]; d["Achi Amt"]=r["amt"]; d["Achi%"]=achievement(r["achi"],r["target"]); export.append(d)
        pd.DataFrame(export).to_excel(writer,index=False,sheet_name={"I":"CO Format","II":"Retail","III":"Savings","IV":"Current Account","V":"Salary"}[report_type])
    out.seek(0); return out.getvalue()



def pending_period(mode, report_date):
    """Return the AssignedDate window for Pending Leads."""
    if DATA["df"] is None or DATA["df"].empty:
        raise ValueError("Upload an Excel file first.")
    maxd=DATA["df"]["AssignedDate"].max()
    rd=pd.Timestamp(report_date) if report_date else maxd
    rd=min(rd.normalize(), maxd.normalize())
    if mode == "daily":
        return rd, rd
    if mode == "cumulative":
        return DATA["df"]["AssignedDate"].min().normalize(), rd
    start=rd.replace(day=1)
    end=maxd.normalize() if start.year==maxd.year and start.month==maxd.month else start + pd.offsets.MonthEnd(0)
    return start, end


def clean_branch_name(value):
    """Turn CBS-style branch identifiers into a readable branch name."""
    text=clean_text(value)
    if not text:
        return "Blank"
    parts=text.split("_")
    if len(parts)>=4 and parts[0].upper()=="BRANCH" and parts[1].upper()=="TEAM":
        parts=parts[3:]
    elif parts and parts[0].upper().startswith("BRANCH"):
        parts=parts[1:]
    # Remove leading numeric/team codes when present.
    while parts and parts[0].isdigit():
        parts=parts[1:]
    return " ".join(parts).title() if parts else text.title()


def pending_base(request, category="All Products", subproduct="All Sub-products", mode="monthly", report_date=None):
    start,end=pending_period(mode, report_date)
    df=filter_df(DATA["df"],start,end,mo=effective_mo(request))
    # Pending is defined strictly by LeadStatus: Open or Under Process.
    df=df[df["Status_Clean"].isin(["OPEN","UNDER PROCESS"])].copy()
    if category and category!="All Products":
        df=category_filtered_df(df,category)
    if subproduct and subproduct!="All Sub-products":
        df=df[df["Sub_Clean"]==normalize_name(subproduct)]
    return start,end,df


def pending_subcategories(df):
    if df is None or df.empty:
        return []
    out=[]
    for key in sorted(df["Sub_Clean"].dropna().unique()):
        if not clean_text(key):
            continue
        vals=df[df["Sub_Clean"]==key]["SubProductName"].dropna().astype(str)
        out.append({"value":key,"label":clean_text(vals.iloc[0]) if len(vals) else key.title()})
    return out


def pending_rows(df):
    if df is None or df.empty:
        return []
    work=df.copy()
    product_col="SubProductName" if "SubProductName" in work.columns else "ProductName"
    if product_col not in work.columns:
        product_col="Group"
    work["_ProductDisplay"]=work[product_col].map(clean_text)
    work["_RegionDisplay"]=work["RegionName"].map(clean_text) if "RegionName" in work.columns else ""
    work["_BranchDisplay"]=work["BranchName"].map(clean_branch_name) if "BranchName" in work.columns else "Blank"
    work["_AssignedDisplay"]=work["AssignedDate"].map(lambda x: pd.Timestamp(x).strftime("%d/%m/%Y"))
    # One row represents the count and amount of pending leads for the same product,
    # region, branch and assigned date.
    grouped=work.groupby(["_ProductDisplay","_RegionDisplay","_BranchDisplay","_AssignedDisplay"],dropna=False,sort=False)
    rows=[]
    for (product,region,branch,assigned),g in grouped:
        rows.append({"product_name":product or "Blank","number":int(len(g)),"amount_lakh":money_lakh(g["Amount"].sum()),"region":region or "Blank","branch":branch or "Blank","assigned_date":assigned})
    rows.sort(key=lambda r: (pd.to_datetime(r["assigned_date"],dayfirst=True), r["product_name"], r["branch"]), reverse=True)
    return rows


def pending_excel(request,category,subproduct,mode,report_date):
    start,end,df=pending_base(request,category,subproduct,mode,report_date)
    rows=pending_rows(df)
    out=io.BytesIO()
    with pd.ExcelWriter(out,engine="openpyxl") as writer:
        export=pd.DataFrame(rows,columns=["product_name","number","amount_lakh","region","branch","assigned_date"])
        export.rename(columns={"product_name":"Product Name","number":"Number","amount_lakh":"Amount (Lakh)","region":"Region","branch":"Branch","assigned_date":"Assigned Date"},inplace=True)
        export.to_excel(writer,index=False,sheet_name="Pending Leads")
        pd.DataFrame([{"Category":category,"Sub Category":subproduct,"Mode":mode.title(),"Start":pd.Timestamp(start).date(),"End":pd.Timestamp(end).date(),"Pending Status":"Open + Under Process"}]).to_excel(writer,index=False,sheet_name="Criteria")
        cws=writer.book["Criteria"]; _format_excel_dates(cws,["Start","End"]); cws.auto_filter.ref=cws.dimensions
        ws=writer.book["Pending Leads"]
        for col in ws.columns:
            width=min(max(max(len(str(c.value or "")) for c in col)+2,12),28)
            ws.column_dimensions[col[0].column_letter].width=width
        _format_excel_dates(ws,["Assigned Date"])
        ws.freeze_panes="A2"
        ws.auto_filter.ref=ws.dimensions
    out.seek(0)
    return out.getvalue()


def _pdf_escape(text):
    text = str(text if text is not None else "")
    # Built-in Helvetica is intentionally used so no third-party PDF package is required.
    # Replace unsupported Unicode with a safe ASCII equivalent.
    text = text.replace("₹", "Rs. ").replace("–", "-").replace("—", "-").replace("•", "-").replace("→", "->")
    text = text.encode("latin-1", "replace").decode("latin-1")
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _simple_table_pdf(title, subtitle, columns, rows, widths):
    """Create a small, dependency-free landscape PDF for report downloads."""
    page_w, page_h = 842, 595  # A4 landscape points
    margin_x, top_y = 24, 565
    font_size = 8
    row_h = 18
    title_h = 28
    header_h = 22
    usable_h = 535
    rows_per_page = max(1, int((usable_h - title_h - header_h - 20) // row_h))

    def content_stream(page_rows, page_no, total_pages):
        cmds=[]
        y=top_y
        cmds += ["BT /F1 15 Tf 1 0 0 1 %d %d Tm (%s) Tj ET" % (margin_x, y, _pdf_escape(title))]
        y -= 20
        cmds += ["BT /F1 8.5 Tf 0.2 0.25 0.4 rg 1 0 0 1 %d %d Tm (%s) Tj ET" % (margin_x, y, _pdf_escape(subtitle))]
        y -= 18
        # Header background
        total_w=sum(widths)
        cmds += ["0.09 0.41 0.91 rg %d %d %d %d re f" % (margin_x, y-header_h+4, total_w, header_h)]
        x=margin_x
        for col,w in zip(columns,widths):
            cmds += ["BT /F2 7 Tf 1 1 1 rg 1 0 0 1 %d %d Tm (%s) Tj ET" % (x+4, y-9, _pdf_escape(col))]
            x += w
        y -= header_h
        for ridx,row in enumerate(page_rows):
            if ridx % 2 == 1:
                cmds += ["0.96 0.97 0.99 rg %d %d %d %d re f" % (margin_x, y-row_h+3, total_w, row_h)]
            x=margin_x
            for j,(value,w) in enumerate(zip(row,widths)):
                txt=_pdf_escape(value)
                # Amount column is right-aligned in the PDF too.
                if j==2:
                    tw=max(0,len(txt)*4.0)
                    tx=x+w-4-tw
                else:
                    tx=x+4
                cmds += ["BT /F1 %g Tf 0.08 0.12 0.22 rg 1 0 0 1 %g %g Tm (%s) Tj ET" % (font_size, tx, y-11, txt)]
                x += w
            cmds += ["0.88 0.89 0.92 RG 0.35 w %d %d m %d %d l S" % (margin_x, y-row_h+3, margin_x+total_w, y-row_h+3)]
            y -= row_h
        cmds += ["BT /F1 7 Tf 0.4 0.45 0.52 rg 1 0 0 1 %d 16 Tm (Page %d of %d) Tj ET" % (margin_x, page_no, total_pages)]
        return "\n".join(cmds).encode("latin-1")

    if not rows:
        rows=[["No pending leads found.","","","","",""]]
    pages=[rows[i:i+rows_per_page] for i in range(0,len(rows),rows_per_page)]
    objects=[]
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    page_kids=[]
    font1_num=3; font2_num=4
    for i,page_rows in enumerate(pages, start=1):
        page_num=5 + (i-1)*2
        stream=content_stream(page_rows,i,len(pages))
        page_kids.append(f"{page_num} 0 R")
        objects.append(None)  # placeholder for Pages kids, fixed below
        objects.append(None)  # placeholder page object
    # Rebuild with stable numbering: catalog, pages, fonts, then page/contents pairs.
    objs=[None,None,b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"]
    for i,page_rows in enumerate(pages, start=1):
        stream=content_stream(page_rows,i,len(pages))
        page_obj_num=len(objs)+1
        content_obj_num=page_obj_num+1
        page_obj=(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page_w} {page_h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_obj_num} 0 R >>").encode()
        content_obj=(f"<< /Length {len(stream)} >>\nstream\n".encode()+stream+b"\nendstream")
        objs += [page_obj,content_obj]
    kids=[]
    for i in range(len(pages)):
        kids.append(f"{5+i*2} 0 R")
    objs[0]=b"<< /Type /Catalog /Pages 2 0 R >>"
    objs[1]=(f"<< /Type /Pages /Kids [{ ' '.join(kids) }] /Count {len(kids)} >>").encode()
    pdf=bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets=[0]
    for n,obj in enumerate(objs, start=1):
        offsets.append(len(pdf)); pdf += f"{n} 0 obj\n".encode(); pdf += obj; pdf += b"\nendobj\n"
    xref=len(pdf); pdf += f"xref\n0 {len(objs)+1}\n".encode(); pdf += b"0000000000 65535 f \n"
    for off in offsets[1:]: pdf += f"{off:010d} 00000 n \n".encode()
    pdf += f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode()
    return bytes(pdf)


def pending_pdf(request,category,subproduct,mode,report_date):
    start,end,df=pending_base(request,category,subproduct,mode,report_date)
    rows=pending_rows(df)
    data=[[r["product_name"],str(r["number"]),f'Rs. {r["amount_lakh"]:.2f}',r["region"],r["branch"],r["assigned_date"]] for r in rows]
    subtitle=f"{category} - {subproduct} - {mode.title()} - {fmt_dt(start)} to {fmt_dt(end)} - Pending: Open + Under Process"
    return _simple_table_pdf("Pending Leads",subtitle,["Product Name","Number","Amount (Lakh)","Region","Branch","Assigned Date"],data,[125,48,78,82,195,82])

def category_export_rows(request, category, subproduct, mode, report_date):
    if DATA["df"] is None: raise ValueError("Upload an Excel file first.")
    maxd=DATA["df"]["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd; start,end=period_bounds(mode,rd); df=filter_df(DATA["df"],start,end,mo=effective_mo(request))
    if category and category!="All Products": df=category_filtered_df(df,category)
    if subproduct and subproduct!="All Sub-products": df=df[df["Sub_Clean"]==normalize_name(subproduct)]
    subs=subproduct_rows(df); statuses=status_rows(df)
    return start,end,subs,statuses

def category_excel(request, category, subproduct, mode, report_date):
    start,end,subs,statuses=category_export_rows(request,category,subproduct,mode,report_date); out=io.BytesIO()
    with pd.ExcelWriter(out,engine="openpyxl") as writer:
        export_subs=[{k:v for k,v in r.items() if k!="statuses"} for r in subs]
        pd.DataFrame(export_subs).to_excel(writer,index=False,sheet_name="Sub-product")
        pd.DataFrame(statuses).to_excel(writer,index=False,sheet_name="Status")
        pd.DataFrame([{"Product Category":category,"Sub Product":subproduct,"Mode":mode,"Start":pd.Timestamp(start).date(),"End":pd.Timestamp(end).date()}]).to_excel(writer,index=False,sheet_name="Period")
        ws=writer.book["Period"]; _format_excel_dates(ws,["Start","End"])
        ws.auto_filter.ref=ws.dimensions
    out.seek(0); return out.getvalue()

def category_pdf(request, category, subproduct, mode, report_date):
    start,end,subs,statuses=category_export_rows(request,category,subproduct,mode,report_date)
    rows=[]
    for r in subs:
        rows.append([r["subproduct"],r["total_leads"],f'Rs. {r["lead_amount_lakh"]:.2f}',r["converted"],f'Rs. {r["converted_actual_amount_lakh"]:.2f}',r["pending"],f'Rs. {r["pending_amount_lakh"]:.2f}'])
    subtitle=f"Product: {category} - Sub-product: {subproduct} - {mode.title()} - {fmt_dt(start)} to {fmt_dt(end)}"
    # Keep the report lightweight and dependency-free. A second status section is appended as a compact table.
    if statuses:
        rows.append(["STATUS SUMMARY","","","","","",""])
        for r in statuses:
            rows.append([r["status"],r["number"],f'Rs. {r["amount_lakh"]:.2f}',r["actual_number"],f'Rs. {r["actual_amount_lakh"]:.2f}',"",""])
    return _simple_table_pdf("Marketing Tracker Report",subtitle,["Sub-product / Status","Leads / No.","Lead Amount","Converted / Actual No.","Converted / Actual Amount","Pending","Pending Amount"],rows,[170,70,105,105,125,75,95])

def pdf_table_report(report_type,data):
    """Dependency-free PDF for the Report menu. Uses the same row data as Excel."""
    titles={"I":"Report-I CO Format","II":"Report-II Retail","III":"Report-III Savings Account","IV":"Report-IV Current Account","V":"Report-V Salary Account","VI-D":"Report-VI Daily Report Deposit","VI-R":"Report-VI Daily Report Retail"}
    subtitle=(f"Date: {data['date'].strftime('%d/%m/%Y')}" if report_type.startswith('VI') else f"Period: {fmt_dt(data['start'])} to {fmt_dt(data['end'])}")
    rows=[]
    if report_type=="VI-D":
        columns=["MO Name","CAC Name","SB Lead No.","SB Converted No.","CD Lead No.","CD Converted No.","Salary Lead No.","Salary Converted No."]
        rows=[[r["mo"],r["cac"],r["sb_lead"],r["sb_conv"],r["cd_lead"],r["cd_conv"],r["salary_lead"],r["salary_conv"]] for r in data["rows"]]
        widths=[145,100,70,80,70,80,70,85]
    elif report_type=="VI-R":
        columns=["MO Name","CAC Name","Home Lead","Home Conv.","Home Lead Cr","Home Conv. Cr","Vehicle Lead","Vehicle Conv.","Vehicle Lead Cr","Vehicle Conv. Cr","Edu/Personal Lead","Edu/Personal Conv.","Edu/Personal Lead Cr","Edu/Personal Conv. Cr","Retail Lead","Retail Conv.","Retail Lead Cr","Retail Conv. Cr"]
        for r in data["rows"]:
            v=[r["mo"],r["cac"]]
            for k in ["Home Loan","Vehicle Loan","Edu/Personal Loan","Retail Loan"]:
                q=r[k]; v += [q["lead_no"],q["converted_no"],f'{q["lead_amt_crore"]:.2f}',f'{q["converted_amt_crore"]:.2f}']
            rows.append(v)
        widths=[105,65]+[40,40,48,48]*4
    elif report_type=="I":
        columns=["Sl No.","CAC Name","MO Name","SB Target","SB Ach.","SB Ach.%","CD Target","CD Ach.","CD Ach.%","Salary Target","Salary Ach.","Salary Ach.%","Retail Target","Retail Ach.","Retail Ach.%"]
        n=1
        for r in _report_rows("I",data):
            rows.append([n,r["cac"],r["mo"],r["sb_t"],r["sb_a"],f'{achievement(r["sb_a"],r["sb_t"]):.1f}%',r["cd_t"],r["cd_a"],f'{achievement(r["cd_a"],r["cd_t"]):.1f}%',r["sal_t"],r["sal_a"],f'{achievement(r["sal_a"],r["sal_t"]):.1f}%',f'{r["ret_t"]:.2f}',f'{r["ret_a"]:.2f}',f'{achievement(r["ret_a"],r["ret_t"]):.1f}%'] if r["kind"]=="data" else ["",r["cac"],"Sub Total" if r["kind"]=="subtotal" else "Grand Total",r["sb_t"],r["sb_a"],f'{achievement(r["sb_a"],r["sb_t"]):.1f}%',r["cd_t"],r["cd_a"],f'{achievement(r["cd_a"],r["cd_t"]):.1f}%',r["sal_t"],r["sal_a"],f'{achievement(r["sal_a"],r["sal_t"]):.1f}%',f'{r["ret_t"]:.2f}',f'{r["ret_a"]:.2f}',f'{achievement(r["ret_a"],r["ret_t"]):.1f}%'])
            if r["kind"]=="data": n+=1
        widths=[35,60,105,45,45,45,45,45,45,50,50,50,55,55,50]
    elif report_type=="II":
        columns=["Sl No.","CAC Name","Home Tgt","Home Act.","Home Ach.%","Vehicle Tgt","Vehicle Act.","Vehicle Ach.%","Edu/Personal Tgt","Edu/Personal Act.","Edu/Personal Ach.%","Retail Tgt","Retail Act.","Retail Ach.%"]
        n=1
        for r in _report_rows("II",data):
            if r["kind"]=="data":
                rt=r["rt"]; ra=r["ra"]
                rows.append([n,r["cac"],rt["Home Loan"],ra["Home Loan"],f'{achievement(ra["Home Loan"],rt["Home Loan"]):.1f}%',rt["Vehicle Loan"],ra["Vehicle Loan"],f'{achievement(ra["Vehicle Loan"],rt["Vehicle Loan"]):.1f}%',rt["Education Loan/Personal Loan"],ra["Education Loan/Personal Loan"],f'{achievement(ra["Education Loan/Personal Loan"],rt["Education Loan/Personal Loan"]):.1f}%',sum(rt.values()),ra["Total Retail"],f'{achievement(ra["Total Retail"],sum(rt.values())):.1f}%']); n+=1
            else:
                v=r["vals"]; tt=sum(x[0] for x in v.values()); aa=sum(x[1] for x in v.values())
                rows.append(["",r["cac"],v["Home Loan"][0],v["Home Loan"][1],f'{achievement(v["Home Loan"][1],v["Home Loan"][0]):.1f}%',v["Vehicle Loan"][0],v["Vehicle Loan"][1],f'{achievement(v["Vehicle Loan"][1],v["Vehicle Loan"][0]):.1f}%',v["Education Loan/Personal Loan"][0],v["Education Loan/Personal Loan"][1],f'{achievement(v["Education Loan/Personal Loan"][1],v["Education Loan/Personal Loan"][0]):.1f}%',tt,aa,f'{achievement(aa,tt):.1f}%'])
        widths=[35,70,60,60,50,60,60,50,65,65,55,60,60,50]
    else:
        key={"III":"SB","IV":"CD","V":"Salary"}[report_type]
        if report_type!="V":
            columns=["Sl No.","CAC Name","Target No.","Actual No.","Actual Amount"]
        else:
            columns=["Sl No.","CAC Name","Target No.","Actual No.","Achievement %"]
        n=1
        for r in _report_rows(report_type,data):
            if report_type!="V":
                rows.append([n,r["cac"],r["target"],r["achi"],f'{r["amt"]:.2f}'] if r["kind"]=="data" else ["",r["cac"],r["target"],r["achi"],f'{r["amt"]:.2f}'])
            else:
                rows.append([n,r["cac"],r["target"],r["achi"],f'{achievement(r["achi"],r["target"]):.1f}%'] if r["kind"]=="data" else ["",r["cac"],r["target"],r["achi"],f'{achievement(r["achi"],r["target"]):.1f}%'])
            if r["kind"]=="data": n+=1
        widths=[40,100,80,80,80]
    return _simple_table_pdf(titles.get(report_type,"Marketing Tracker Report"),subtitle,columns,rows,widths)



@app.post("/api/login")
async def login(request: Request):
    d=await request.json(); u=str(d.get("username","")).strip(); p=str(d.get("password","")); us=users()
    if u not in us or us[u]["password"]!=p: return JSONResponse({"detail":"Invalid User ID or password."},status_code=401)
    request.session["username"]=u; request.session["role"]=us[u]["role"]; info=us[u]; return {"ok":True,"username":u,"role":us[u]["role"],"mo_name":info.get("mo_name",info.get("name",u)),"cac":info.get("cac","")}

@app.post("/api/logout")
async def logout(request: Request): request.session.clear(); return {"ok":True}

@app.get("/api/me")
async def me(request: Request):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    uid=request.session["username"]; role=request.session["role"]; info=users().get(uid,{})
    return {"username":uid,"role":role,"mo_name":info.get("mo_name",info.get("name",uid)),"cac":info.get("cac","")}

@app.get("/api/state")
async def state(request: Request):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return {"loaded":False,"filename":None,"rows":0,"date_from":None,"report_date":None}
    return {"loaded":True,"filename":DATA["filename"],"rows":len(DATA["df"]),"date_from":DATA["df"]["AssignedDate"].min().strftime("%Y-%m-%d"),"report_date":DATA["df"]["AssignedDate"].max().strftime("%Y-%m-%d"),"last_updated":DATA.get("last_updated")}

@app.post("/api/upload")
async def upload(request: Request,file:UploadFile=File(...)):
    if not auth(request,"admin"): return JSONResponse({"detail":"Admin access required."},status_code=403)
    file_bytes=await file.read()
    try: df=prepare_df(io.BytesIO(file_bytes))
    except Exception as e: return JSONResponse({"detail":str(e)},status_code=400)
    db.save_upload(file.filename, file_bytes)
    DATA["df"]=df; DATA["filename"]=file.filename; DATA["last_updated"] = datetime.now(ZoneInfo("Asia/Kolkata")).strftime("%d %b %Y, %I:%M %p")
    return {"ok":True,"filename":file.filename,"rows":len(df),"columns":len(df.columns),"report_date":df["AssignedDate"].max().strftime("%Y-%m-%d"),"last_updated":DATA["last_updated"]}

@app.post("/api/upload/clear")
async def clear_upload(request: Request):
    if not auth(request,"admin"): return JSONResponse({"detail":"Admin access required."},status_code=403)
    db.clear_upload()
    DATA["df"]=None; DATA["filename"]=None; DATA["last_updated"]=None
    return {"ok":True}

@app.get("/api/report")
async def report(request:Request,mode:str="monthly",report_date:str|None=None,region:str="All Regions",product:str="All Products",mo:str="All Officers",branch:str="All Branches"):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    maxd=DATA["df"]["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd; start,end=period_bounds(mode,rd); mo=effective_mo(request,mo); df=filter_df(DATA["df"],start,end,region,product,mo,branch)
    products=[product_row(df,g) for g in PRODUCT_GROUPS]
    pending=df[df["Status_Clean"].isin(["OPEN","UNDER PROCESS"])]
    return {"mode":mode,"start":start.strftime("%Y-%m-%d"),"end":end.strftime("%Y-%m-%d"),"as_on":maxd.strftime("%Y-%m-%d"),"selected_report_date":pd.Timestamp(rd).strftime("%Y-%m-%d"),"products":products,"subproducts":subproduct_rows(df),"statuses":status_rows(df),"months":sorted({pd.Timestamp(x).strftime("%Y-%m") for x in DATA["df"]["AssignedDate"]}),"max_date":maxd.strftime("%Y-%m-%d"),"regions":sorted(set(DATA["df"]["RegionName"].map(clean_text))),"branches":sorted(set(DATA["df"]["BranchName"].map(clean_text))),"last_updated":DATA.get("last_updated")}

def category_filtered_df(df, category):
    mapping={
        "Savings":"SAVING ACCOUNT", "Current":"CURRENT ACCOUNT", "Salary":"SALARY ACCOUNT",
        "TASC":"TASC ACCOUNTS", "Other Deposits":"__OTHER_DEPOSITS__",
        "Deposits":"__DEPOSITS__", "Home Loan":"HOUSING LOAN", "Vehicle Loan":"CAR LOAN",
        "Education/Personal Loan":"__EDU_PERSONAL__", "Retails":"__RETAILS__",
        "Other Loans":"__OTHER_LOANS__", "3rd Party":"__3RD_PARTY__",
        "Insurance":"INSURANCE", "MSME":"MSME", "Agriculture":"AGRICULTURE",
        "Mutual Fund":"MUTUAL FUND", "Government Scheme":"GOVERNMENT SCHEME",
        "Builder Tie-up":"BUILDER TIE-UP", "Dealer Tie-up":"DEALER TIE-UP",
    }
    key=mapping.get(category,category).upper()
    if category in {"MSME","Agriculture","Insurance","Mutual Fund","Government Scheme","Builder Tie-up","Dealer Tie-up","Retail"}:
        return df[df["Group"]==category]
    if key=="__OTHER_DEPOSITS__": return df[(df["Group"]=="Deposits") & (~df["Sub_Clean"].isin(["SAVING ACCOUNT","CURRENT ACCOUNT","SALARY ACCOUNT","TASC ACCOUNTS"]))]
    if key=="__DEPOSITS__": return df[df["Group"]=="Deposits"]
    if key=="__EDU_PERSONAL__": return df[df["Sub_Clean"].isin(["EDUCATION LOAN","PERSONAL LOAN"])]
    if key=="__RETAILS__": return df[df["Group"]=="Retail"]
    if key=="__OTHER_LOANS__": return df[df["Group"].isin(["MSME","Agriculture"])]
    if key=="__3RD_PARTY__": return df[df["Group"].isin(["Insurance","Mutual Fund"])]
    return df[df["Sub_Clean"]==key]


@app.get("/api/product-detail")
async def product_detail(request:Request,product:str,mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    rd=pd.Timestamp(report_date) if report_date else DATA["df"]["AssignedDate"].max(); start,end=period_bounds(mode,rd); df=filter_df(DATA["df"],start,end,product=product,mo=effective_mo(request))
    return {"product":product,"start":start.strftime("%Y-%m-%d"),"end":end.strftime("%Y-%m-%d"),"summary":summary(df),"statuses":status_rows(df),"subproducts":subproduct_rows(df,product)}

@app.get("/api/category-report")
async def category_report(request:Request,category:str="All Products",subproduct:str="All Sub-products",mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    maxd=DATA["df"]["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd; start,end=period_bounds(mode,rd)
    df=filter_df(DATA["df"],start,end,mo=effective_mo(request))
    option_base=category_filtered_df(df,category) if category!="All Products" else df
    suboptions=[]
    for key in sorted([x for x in option_base["Sub_Clean"].dropna().unique() if x]):
        vals=option_base[option_base["Sub_Clean"]==key]["SubProductName"].dropna().astype(str)
        suboptions.append({"value":key,"label":clean_text(vals.iloc[0]) if len(vals) else key.title()})
    if category!="All Products": df=option_base
    if subproduct!="All Sub-products": df=df[df["Sub_Clean"]==normalize_name(subproduct)]
    return {"category":category,"subproduct":subproduct,"mode":mode,"start":start.strftime("%Y-%m-%d"),"end":end.strftime("%Y-%m-%d"),"summary":summary(df),"statuses":status_rows(df),"subproducts":subproduct_rows(df),"subcategories":sorted(suboptions,key=lambda x:x["label"].lower()),"months":sorted({pd.Timestamp(x).strftime("%Y-%m") for x in DATA["df"]["AssignedDate"]})}

@app.get("/api/dashboard-data")
async def dashboard_data(request:Request,mode:str="monthly",report_date:str|None=None,product:str="All Products",subproduct:str="All Sub-products"):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    maxd=DATA["df"]["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd; start,end=period_bounds(mode,rd)
    base=filter_df(DATA["df"],start,end,mo=effective_mo(request))
    category_base=category_filtered_df(base,product) if product!="All Products" else base
    suboptions=[]
    for key,grp in category_base.groupby("Sub_Clean",dropna=True):
        if not clean_text(key): continue
        vals=category_base[category_base["Sub_Clean"]==key]["SubProductName"].dropna().astype(str)
        suboptions.append({"value":key,"label":clean_text(vals.iloc[0]) if len(vals) else key.title()})
    suboptions=sorted(suboptions,key=lambda x:x["label"].lower())
    if subproduct!="All Sub-products": category_base=category_base[category_base["Sub_Clean"]==normalize_name(subproduct)]
    categories=["Savings","Current","Salary","Home Loan","Vehicle Loan","Education/Personal Loan","Retails","MSME","Agriculture","Insurance"]
    rows=[]
    for category in categories:
        sm=category_filtered_df(category_base,category)
        rows.append({"category":category,"summary":summary(sm)})
    return {"mode":mode,"start":start.strftime("%Y-%m-%d"),"end":end.strftime("%Y-%m-%d"),"max_date":maxd.strftime("%Y-%m-%d"),"last_updated":DATA.get("last_updated"),"months":sorted({pd.Timestamp(x).strftime("%Y-%m") for x in DATA["df"]["AssignedDate"]}),"cards":rows,"subcategories":suboptions}

@app.get("/api/daily-performance")
async def daily_performance(request:Request,product:str="All Products",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    maxd=DATA["df"]["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd; rd=min(rd,maxd).normalize()
    start=rd-pd.Timedelta(days=6)
    base=DATA["df"]
    if request.session.get("role")=="mo": base=base[base["MO_Clean"]==normalize_name(effective_mo(request))]
    if product!="All Products": base=category_filtered_df(base,product)
    rows=[]
    for day in pd.date_range(start,rd,freq="D"):
        q=base[base["AssignedDate"].dt.normalize()==day.normalize()]
        rows.append({"date":day.strftime("%Y-%m-%d"),"label":day.strftime("%d %b"),"leads":int(len(q)),"converted":int((q["Status_Clean"]=="CONVERTED").sum()),"pending":int(q["Status_Clean"].isin(["OPEN","UNDER PROCESS"]).sum()),"rejection":int(q["Status_Clean"].isin(["NON CONVERTED","NOT INTERESTED","REJECTED","REJECT"]).sum())})
    return {"product":product,"start":start.strftime("%Y-%m-%d"),"end":rd.strftime("%Y-%m-%d"),"rows":rows}

@app.get("/api/notifications")
async def notifications(request:Request,mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return {"items":[]}
    maxd=DATA["df"]["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd; start,end=period_bounds(mode,rd)
    # MOs must only see their own notifications. Admin/Administrator continue to see all MOs.
    session_role=request.session.get("role")
    session_uid=request.session.get("username")
    mo_filter=None
    if session_role=="mo":
        mo_filter=users().get(session_uid,{}).get("mo_name",session_uid)
    if mo_filter:
        target_name=normalize_name(mo_filter)
        df=DATA["df"][(DATA["df"]["AssignedDate"] >= start) & (DATA["df"]["AssignedDate"] < pd.Timestamp(end) + pd.Timedelta(days=1))].copy()
        df=df[df["MO_Clean"]==target_name]
    else:
        df=filter_df(DATA["df"],start,end,mo="All Officers")
    rows=report_extended_rows(df); items=[]
    for r in rows:
        if mo_filter and normalize_name(r.get("mo",""))!=normalize_name(mo_filter): continue
        if r["retail_target_cr"]>0 and r["retail_ach_pct"]<20: items.append({"type":"Retail","mo":r["mo"],"cac":r["cac"],"achievement":r["retail_ach_pct"],"target":r["retail_target_cr"],"actual":r["retail_actual_cr"]})
        if r["deposit_target_no"]>0 and r["deposit_ach_pct"]<20: items.append({"type":"Deposits","mo":r["mo"],"cac":r["cac"],"achievement":r["deposit_ach_pct"],"target":r["deposit_target_no"],"actual":r["deposit_actual_no"]})
    return {"mode":mode,"start":start.strftime("%Y-%m-%d"),"end":end.strftime("%Y-%m-%d"),"items":items}

@app.get("/api/activity")
async def activity(request:Request):
    if not role_is_mo(request): return JSONResponse({"detail":"MO access required."},status_code=403)
    store=activity_store(); uid=request.session["username"]
    return {"tour_plans":[x for x in store["tour_plans"] if x.get("user_id")==uid],"tour_reports":[x for x in store["tour_reports"] if x.get("user_id")==uid],"co_reports":[x for x in store["co_reports"] if x.get("user_id")==uid]}


def _admin_activity_snapshot(request:Request, date:str="", mo:str="All Officers"):
    store=activity_store(); us=users()
    def user_info(uid):
        info=us.get(uid,{})
        return {"user_id":uid,"mo_name":info.get("mo_name",info.get("name",uid)),"cac":info.get("cac","")}
    def match_record(x):
        if date and x.get("date") != date: return False
        if mo and mo != "All Officers" and x.get("user_id") != mo: return False
        return True
    plans=[x for x in store.get("tour_plans",[]) if match_record(x)]
    reports=[x for x in store.get("tour_reports",[]) if match_record(x)]
    co=[x for x in store.get("co_reports",[]) if match_record(x)]
    officers=[]
    for uid,info in us.items():
        if info.get("role") != "mo": continue
        if mo and mo != "All Officers" and uid != mo: continue
        officers.append({"user_id":uid,"mo_name":info.get("mo_name",info.get("name",uid)),"cac":info.get("cac","")})
    officers.sort(key=lambda x:x["mo_name"].lower())
    def co_status_for(uid,day):
        c=[x for x in co if x.get("user_id")==uid and (not day or x.get("date")==day)]
        if not c: return "Not Reported"
        latest=c[-1]; lms=str(latest.get("lms","No")).lower()=="yes"; gf=str(latest.get("google_form","No")).lower()=="yes"
        return "Reported" if lms and gf else "Partial" if (lms or gf) else "Not Reported"
    status=[]
    if date:
        for o in officers:
            uid=o["user_id"]; p=[x for x in plans if x.get("user_id")==uid]; r=[x for x in reports if x.get("user_id")==uid]
            status.append({"date":date,"user_id":uid,"mo_name":o["mo_name"],"cac":o["cac"],"tour_plan":"Planned" if p else "Not Planned","tour_report":"Reported" if r else "Not Reported","co_report":co_status_for(uid,date)})
    else:
        keys=set((x.get("user_id"),x.get("date")) for x in plans+reports+co if x.get("user_id") and x.get("date"))
        for uid,day in sorted(keys,key=lambda z:(z[1],z[0])):
            o=next((x for x in officers if x["user_id"]==uid),user_info(uid)); p=[x for x in plans if x.get("user_id")==uid and x.get("date")==day]; r=[x for x in reports if x.get("user_id")==uid and x.get("date")==day]
            status.append({"date":day,"user_id":uid,"mo_name":o["mo_name"],"cac":o.get("cac",""),"tour_plan":"Planned" if p else "Not Planned","tour_report":"Reported" if r else "Not Reported","co_report":co_status_for(uid,day)})
    def enrich(rows):
        out=[]
        for x in rows:
            y=dict(x); info=user_info(x.get("user_id","")); y["mo_name"]=info["mo_name"]; y["cac"]=info["cac"]; out.append(y)
        return out
    return officers,status,enrich(plans),enrich(reports),enrich(co)


def _filter_admin_activity(status, plans, reports, co, show="all", focus="all"):
    show=(show or "all").lower(); focus=(focus or "all").lower()
    if show != "no": return status,plans,reports,co
    def missing(s):
        if focus in {"all","tour_plan"}: return s.get("tour_plan") == "Not Planned"
        if focus in {"tour_report","tour_reports"}: return s.get("tour_report") == "Not Reported"
        if focus in {"co","co_report","co_reports"}: return s.get("co_report") != "Reported"
        return False
    filtered=[s for s in status if missing(s)]
    ids={(s.get("user_id"),s.get("date")) for s in filtered}
    def keep(r): return (r.get("user_id"),r.get("date")) in ids
    return filtered, [r for r in plans if keep(r)], [r for r in reports if keep(r)], [r for r in co if keep(r)]


def _format_excel_dates(ws, date_columns):
    for col in date_columns:
        try:
            idx=[c.value for c in ws[1]].index(col)+1
        except ValueError:
            continue
        for cell in ws.iter_rows(min_row=2,min_col=idx,max_col=idx):
            c=cell[0]
            if c.value:
                try: c.value=pd.to_datetime(c.value,dayfirst=True).date()
                except Exception: pass
                c.number_format="dd/mm/yyyy"

def _activity_excel(title, columns, rows, criteria=None, sheet="Report"):
    out=io.BytesIO()
    with pd.ExcelWriter(out,engine="openpyxl") as writer:
        pd.DataFrame(rows,columns=columns).to_excel(writer,index=False,sheet_name=sheet)
        if criteria:
            pd.DataFrame([criteria]).to_excel(writer,index=False,sheet_name="Criteria")
        ws=writer.book[sheet]
        for col in ws.columns:
            width=min(max(max(len(str(c.value or "")) for c in col)+2,12),42)
            ws.column_dimensions[col[0].column_letter].width=width
        _format_excel_dates(ws,["Date","Assigned Date"])
        ws.freeze_panes="A2"; ws.auto_filter.ref=ws.dimensions
    out.seek(0); return out.getvalue()


def _activity_pdf(title, subtitle, columns, rows, right_indices=None):
    right_indices=set(right_indices or [])
    page_w,page_h=842,595; margin_x,top_y=22,565; font_size=7.4; row_h=17; header_h=21
    # Scale columns to landscape A4 width.
    base=[max(48,min(150, 10+max([len(str(c))]+[len(str(r[i])) for r in rows[:80]]))) for i,c in enumerate(columns)]
    total=sum(base); max_w=798
    if total>max_w: base=[w*max_w/total for w in base]
    def esc(v): return _pdf_escape(v)
    rows2=rows or [["No records found."]+['']*(len(columns)-1)]
    per=max(1,int((535-42-header_h)//row_h)); pages=[rows2[i:i+per] for i in range(0,len(rows2),per)]
    objs=[None,None,b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"]
    def stream(page_rows,pno,ptotal):
        cmds=[f"BT /F2 14 Tf 0.08 0.12 0.22 rg 1 0 0 1 {margin_x} {top_y} Tm ({esc(title)}) Tj ET",f"BT /F1 8 Tf 0.25 0.30 0.38 rg 1 0 0 1 {margin_x} {top_y-18} Tm ({esc(subtitle)}) Tj ET"]
        y=top_y-38; x=margin_x; total_w=sum(base)
        cmds.append(f"0.09 0.41 0.91 rg {margin_x} {y-header_h+4} {total_w:.1f} {header_h} re f")
        for c,w in zip(columns,base):
            cmds.append(f"BT /F2 6.6 Tf 1 1 1 rg 1 0 0 1 {x+3:.1f} {y-8} Tm ({esc(c)}) Tj ET"); x+=w
        y-=header_h
        for ri,row in enumerate(page_rows):
            if ri%2: cmds.append(f"0.96 0.97 0.99 rg {margin_x} {y-row_h+3} {total_w:.1f} {row_h} re f")
            x=margin_x
            for j,(v,w) in enumerate(zip(row,base)):
                txt=esc(v); tw=len(txt)*3.65
                tx=x+w-3-tw if j in right_indices else x+3
                cmds.append(f"BT /F1 {font_size} Tf 0.08 0.12 0.22 rg 1 0 0 1 {tx:.1f} {y-10} Tm ({txt}) Tj ET"); x+=w
            cmds.append(f"0.88 0.89 0.92 RG 0.3 w {margin_x} {y-row_h+3} m {margin_x+total_w:.1f} {y-row_h+3} l S"); y-=row_h
        cmds.append(f"BT /F1 6.5 Tf 0.4 0.45 0.52 rg 1 0 0 1 {margin_x} 14 Tm (Page {pno} of {ptotal}) Tj ET")
        return "\n".join(cmds).encode("latin-1")
    for pr in pages:
        st=stream(pr,len(objs)//2,len(pages)); po=len(objs)+1; co=po+1
        objs += [(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page_w} {page_h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {co} 0 R >>").encode(),(f"<< /Length {len(st)} >>\nstream\n").encode()+st+b"\nendstream"]
    kids=[f"{5+i*2} 0 R" for i in range(len(pages))]; objs[0]=b"<< /Type /Catalog /Pages 2 0 R >>"; objs[1]=(f"<< /Type /Pages /Kids [{' '.join(kids)}] /Count {len(kids)} >>").encode()
    pdf=bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"); offsets=[0]
    for n,obj in enumerate(objs,1): offsets.append(len(pdf)); pdf+=f"{n} 0 obj\n".encode()+obj+b"\nendobj\n"
    xref=len(pdf); pdf+=f"xref\n0 {len(objs)+1}\n".encode()+b"0000000000 65535 f \n"+b''.join(f"{o:010d} 00000 n \n".encode() for o in offsets[1:])+f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode()
    return bytes(pdf)

@app.get("/api/admin/mo-activity")
async def admin_mo_activity(request:Request, date:str="", mo:str="All Officers", show:str="all", focus:str="all"):
    if request.session.get("role") not in {"admin", "administrator"}:
        return JSONResponse({"detail":"Admin access required."},status_code=403)
    officers,status,plans,reports,co=_admin_activity_snapshot(request,date,mo)
    status,plans,reports,co=_filter_admin_activity(status,plans,reports,co,show,focus)
    return {"officers":officers,"status":status,"tour_plans":plans,"tour_reports":reports,"co_reports":co,"show":show,"focus":focus}

@app.get("/download/admin-activity-excel")
async def download_admin_activity_excel(request:Request, report_type:str="monitoring", date:str="", mo:str="All Officers", show:str="all", focus:str="all"):
    if request.session.get("role") not in {"admin","administrator"}:
        return JSONResponse({"detail":"Admin access required."},status_code=403)
    officers,status,plans,reports,co=_admin_activity_snapshot(request,date,mo)
    status,plans,reports,co=_filter_admin_activity(status,plans,reports,co,show,focus)
    if report_type=="monitoring":
        cols=["Date","MO Name","CAC","Tour Plan","Daily Tour Report","CO Reporting Status"]
        rows=[[x["date"],x["mo_name"],x["cac"],x["tour_plan"],x["tour_report"],x["co_report"]] for x in status]
        filename="Daily_Monitoring_Status.xlsx"
    elif report_type=="tour_plan":
        cols=["Date","MO Name","CAC","Category","Plan / Visit Details"]
        # For No-filter, include officers without plans as explicit Not Planned rows.
        if show.lower()=="no" and date:
            rows=[]
            for x in status:
                if x["tour_plan"]=="Not Planned": rows.append([x["date"],x["mo_name"],x["cac"],"","Not Planned"])
        else: rows=[[x.get("date",""),x.get("mo_name",""),x.get("cac",""),x.get("category",""),x.get("plan","")] for x in plans]
        filename="Tour_Plans.xlsx"
    elif report_type=="tour_report":
        cols=["Date","MO Name","CAC","Home Loan No.","Home Loan Amt.","Vehicle Loan No.","Vehicle Loan Amt.","Other Retail No.","Other Retail Amt.","Builder Tie-up","Dealer Tie-up","Deposits No.","Deposits Amt.","3rd Party No.","3rd Party Amt."]
        if show.lower()=="no" and date:
            rows=[]
            for x in status:
                if x["tour_report"]=="Not Reported": rows.append([x["date"],x["mo_name"],x["cac"],0,0,0,0,0,0,0,0,0,0,0,0])
        else: rows=[[x.get("date",""),x.get("mo_name",""),x.get("cac",""),x.get("home_loan_no",0),x.get("home_loan_amt",0),x.get("vehicle_loan_no",0),x.get("vehicle_loan_amt",0),x.get("other_retail_no",0),x.get("other_retail_amt",0),x.get("builder_tieup",0),x.get("dealer_tieup",0),x.get("deposits_no",0),x.get("deposits_amt",0),x.get("third_party_no",0),x.get("third_party_amt",0)] for x in reports]
        filename="Daily_Tour_Reports.xlsx"
    else:
        cols=["Date","MO Name","CAC","LMS Updation","Google Form","CO Reporting Status"]
        if show.lower()=="no" and date:
            rows=[]
            for x in status:
                if x["co_report"]!="Reported":
                    # Recover Yes/No where a partial report exists.
                    c=next((z for z in co if z.get("user_id")==x["user_id"] and z.get("date")==x["date"]),{})
                    rows.append([x["date"],x["mo_name"],x["cac"],c.get("lms","No"),c.get("google_form","No"),x["co_report"]])
        else: rows=[[x.get("date",""),x.get("mo_name",""),x.get("cac",""),x.get("lms","No"),x.get("google_form","No"),("Reported" if str(x.get("lms","No")).lower()=="yes" and str(x.get("google_form","No")).lower()=="yes" else "Partial" if str(x.get("lms","No")).lower()=="yes" or str(x.get("google_form","No")).lower()=="yes" else "Not Reported")] for x in co]
        filename="CO_Reports.xlsx"
    b=_activity_excel(filename.replace(".xlsx",""),cols,rows,{"Date":date or "All Dates","MO":mo,"Show":show,"Focus":focus})
    return Response(content=b,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",headers={"Content-Disposition":f'attachment; filename="{filename}"'})

@app.get("/download/admin-activity-pdf")
async def download_admin_activity_pdf(request:Request, report_type:str="monitoring", date:str="", mo:str="All Officers", show:str="all", focus:str="all"):
    if request.session.get("role") not in {"admin","administrator"}:
        return JSONResponse({"detail":"Admin access required."},status_code=403)
    officers,status,plans,reports,co=_admin_activity_snapshot(request,date,mo)
    status,plans,reports,co=_filter_admin_activity(status,plans,reports,co,show,focus)
    if report_type=="monitoring":
        cols=["Date","MO Name","CAC","Tour Plan","Daily Tour Report","CO Reporting"]
        rows=[[x["date"],x["mo_name"],x["cac"],x["tour_plan"],x["tour_report"],x["co_report"]] for x in status]; title="Daily Monitoring Status"; fn="Daily_Monitoring_Status.pdf"
    elif report_type=="tour_plan":
        cols=["Date","MO Name","CAC","Category","Plan / Visit Details"]; title="Tour Plans"; fn="Tour_Plans.pdf"
        if show.lower()=="no" and date: rows=[[x["date"],x["mo_name"],x["cac"],"","Not Planned"] for x in status if x["tour_plan"]=="Not Planned"]
        else: rows=[[x.get("date",""),x.get("mo_name",""),x.get("cac",""),x.get("category",""),x.get("plan","")] for x in plans]
    elif report_type=="tour_report":
        cols=["Date","MO Name","CAC","Home No.","Home Amt.","Vehicle No.","Vehicle Amt.","Other Retail No.","Other Retail Amt.","Builder","Dealer","Deposits No.","Deposits Amt.","3rd Party No.","3rd Party Amt."]; title="Daily Tour Reports"; fn="Daily_Tour_Reports.pdf"
        if show.lower()=="no" and date: rows=[[x["date"],x["mo_name"],x["cac"],0,0,0,0,0,0,0,0,0,0,0,0] for x in status if x["tour_report"]=="Not Reported"]
        else: rows=[[x.get("date",""),x.get("mo_name",""),x.get("cac",""),x.get("home_loan_no",0),x.get("home_loan_amt",0),x.get("vehicle_loan_no",0),x.get("vehicle_loan_amt",0),x.get("other_retail_no",0),x.get("other_retail_amt",0),x.get("builder_tieup",0),x.get("dealer_tieup",0),x.get("deposits_no",0),x.get("deposits_amt",0),x.get("third_party_no",0),x.get("third_party_amt",0)] for x in reports]
    else:
        cols=["Date","MO Name","CAC","LMS","Google Form","CO Status"]; title="CO Reports"; fn="CO_Reports.pdf"
        if show.lower()=="no" and date:
            rows=[]
            for x in status:
                if x["co_report"]!="Reported":
                    c=next((z for z in co if z.get("user_id")==x["user_id"] and z.get("date")==x["date"]),{})
                    rows.append([x["date"],x["mo_name"],x["cac"],c.get("lms","No"),c.get("google_form","No"),x["co_report"]])
        else: rows=[[x.get("date",""),x.get("mo_name",""),x.get("cac",""),x.get("lms","No"),x.get("google_form","No"),("Reported" if str(x.get("lms","No")).lower()=="yes" and str(x.get("google_form","No")).lower()=="yes" else "Partial" if str(x.get("lms","No")).lower()=="yes" or str(x.get("google_form","No")).lower()=="yes" else "Not Reported")] for x in co]
    subtitle=f"Date: {date or 'All Dates'} | MO: {mo} | Filter: {'No / Not Done' if show.lower()=='no' else 'All'}"
    b=_activity_pdf(title,subtitle,cols,rows,right_indices={3,4,5,6,7,8,9,10,11,12,13,14})
    return Response(content=b,media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="{fn}"'})

# Compatibility aliases for Admin MO Activity downloads.
# These accept the same parameters as the canonical download routes.
@app.get("/download/admin-activity-excel/")
async def download_admin_activity_excel_slash(request:Request, report_type:str="monitoring", date:str="", mo:str="All Officers", show:str="all", focus:str="all"):
    return await download_admin_activity_excel(request, report_type, date, mo, show, focus)

@app.get("/download/admin-activity-pdf/")
async def download_admin_activity_pdf_slash(request:Request, report_type:str="monitoring", date:str="", mo:str="All Officers", show:str="all", focus:str="all"):
    return await download_admin_activity_pdf(request, report_type, date, mo, show, focus)

@app.get("/api/app-version")
async def app_version():
    return {"version":"MO Tracker V6","admin_activity_downloads":True}

@app.post("/api/activity/tour-plan")
async def save_tour_plan(request:Request):
    if not role_is_mo(request): return JSONResponse({"detail":"MO access required."},status_code=403)
    d=await request.json(); date=str(d.get("date",""));
    try: day=pd.Timestamp(date).date()
    except: return JSONResponse({"detail":"Invalid date."},status_code=400)
    today=datetime.now(ZoneInfo("Asia/Kolkata")).date()
    if day not in {today, today+pd.Timedelta(days=1)}: return JSONResponse({"detail":"Tour Plan can be made only for today or tomorrow."},status_code=400)
    category=str(d.get("category","")); text=str(d.get("plan",""))[:2000]
    if category=="GVB": category="Govt. Business"
    if category not in {"Liability","Loans","Govt. Business","3rd Party"}: return JSONResponse({"detail":"Invalid tour category."},status_code=400)
    uid=request.session["username"]
    db.upsert_tour_plan({"user_id":uid,"mo_name":users()[uid].get("mo_name",uid),"date":date,"category":category,"plan":text}); return {"ok":True}

@app.post("/api/activity/tour-report")
async def save_tour_report(request:Request):
    if not role_is_mo(request): return JSONResponse({"detail":"MO access required."},status_code=403)
    d=await request.json(); date=str(d.get("date",""));
    try: pd.Timestamp(date)
    except: return JSONResponse({"detail":"Invalid date."},status_code=400)
    pairs=[("Home Loan",d.get("home_loan_no",0),d.get("home_loan_amt",0)),("Vehicle Loan",d.get("vehicle_loan_no",0),d.get("vehicle_loan_amt",0)),("Other Retail Loan",d.get("other_retail_no",0),d.get("other_retail_amt",0)),("Deposits",d.get("deposits_no",0),d.get("deposits_amt",0)),("3rd Party",d.get("third_party_no",0),d.get("third_party_amt",0))]
    for label,no,amt in pairs:
        try: n=float(no or 0); a=float(amt or 0)
        except: return JSONResponse({"detail":f"Invalid value for {label}."},status_code=400)
        if (n>0 and a<=0) or (a>0 and n<=0):
            return JSONResponse({"detail":f"{label}: Lead Number and Lead Amount must both be greater than 0, or both be 0."},status_code=400)
    item={"user_id":request.session["username"],"date":date,"home_loan_no":int(float(d.get("home_loan_no",0) or 0)),"home_loan_amt":float(d.get("home_loan_amt",0) or 0),"vehicle_loan_no":int(float(d.get("vehicle_loan_no",0) or 0)),"vehicle_loan_amt":float(d.get("vehicle_loan_amt",0) or 0),"other_retail_no":int(float(d.get("other_retail_no",0) or 0)),"other_retail_amt":float(d.get("other_retail_amt",0) or 0),"builder_tieup":int(float(d.get("builder_tieup",0) or 0)),"dealer_tieup":int(float(d.get("dealer_tieup",0) or 0)),"deposits_no":int(float(d.get("deposits_no",0) or 0)),"deposits_amt":float(d.get("deposits_amt",0) or 0),"third_party_no":int(float(d.get("third_party_no",0) or 0)),"third_party_amt":float(d.get("third_party_amt",0) or 0)}
    db.upsert_tour_report(item); return {"ok":True}

@app.post("/api/activity/co-report")
async def save_co_activity(request:Request):
    if not role_is_mo(request): return JSONResponse({"detail":"MO access required."},status_code=403)
    d=await request.json(); date=str(d.get("date",""));
    item={"user_id":request.session["username"],"date":date,"lms":str(d.get("lms","No")),"google_form":str(d.get("google_form","No"))}
    db.upsert_co_report(item); return {"ok":True}

@app.get("/api/targets")
async def targets(request:Request):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    return {"targets":MONTHLY_TARGETS}

@app.get("/api/reports-full")
async def reports_full(request:Request,mode:str="monthly",report_date:str|None=None,region:str="All Regions",product:str="All Products",mo:str="All Officers",branch:str="All Branches"):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    maxd=DATA["df"]["AssignedDate"].max(); rd=pd.Timestamp(report_date) if report_date else maxd
    start,end=period_bounds(mode,rd); mo=effective_mo(request,mo); df=filter_df(DATA["df"],start,end,region,product,mo,branch)
    result=extended_report(df)
    result.update({"mode":mode,"start":start.strftime("%Y-%m-%d"),"end":end.strftime("%Y-%m-%d"),"as_on":maxd.strftime("%Y-%m-%d")})
    return result

@app.get("/api/co-report")
async def co_report(request:Request,report_type:str="I",mode:str="monthly",report_date:str|None=None,daily_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    d=co_report_data(report_type,mode,report_date,daily_date)
    def conv(x):
        if isinstance(x,pd.Timestamp): return x.strftime("%Y-%m-%d")
        if isinstance(x,dict): return {k:conv(v) for k,v in x.items()}
        if isinstance(x,list): return [conv(v) for v in x]
        return x
    return conv(d)

@app.get("/api/pending-leads")
async def pending_leads(request:Request,category:str="All Products",subproduct:str="All Sub-products",mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    try:
        start,end,df=pending_base(request,category,subproduct,mode,report_date)
        return {"category":category,"subproduct":subproduct,"mode":mode,"start":start.strftime("%Y-%m-%d"),"end":end.strftime("%Y-%m-%d"),"rows":pending_rows(df),"subcategories":pending_subcategories(df),"months":sorted({pd.Timestamp(x).strftime("%Y-%m") for x in DATA["df"]["AssignedDate"]}),"max_date":DATA["df"]["AssignedDate"].max().strftime("%Y-%m-%d")}
    except Exception as e:
        return JSONResponse({"detail":str(e)},status_code=400)

@app.get("/download/pending-excel")
async def download_pending_excel(request:Request,category:str="All Products",subproduct:str="All Sub-products",mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    try: b=pending_excel(request,category,subproduct,mode,report_date)
    except Exception as e: return JSONResponse({"detail":str(e)},status_code=400)
    return Response(content=b,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",headers={"Content-Disposition":f'attachment; filename="Pending_Leads_{mode}.xlsx"'})

@app.get("/download/pending-pdf")
async def download_pending_pdf(request:Request,category:str="All Products",subproduct:str="All Sub-products",mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    try: b=pending_pdf(request,category,subproduct,mode,report_date)
    except Exception as e: return JSONResponse({"detail":str(e)},status_code=400)
    return Response(content=b,media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="Pending_Leads_{mode}.pdf"'})

@app.get("/download/category-excel")
async def download_category_excel(request:Request,category:str="All Products",subproduct:str="All Sub-products",mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    try: b=category_excel(request,category,subproduct,mode,report_date)
    except Exception as e: return JSONResponse({"detail":str(e)},status_code=400)
    return Response(content=b,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",headers={"Content-Disposition":f'attachment; filename="Marketing_Report_{mode}.xlsx"'})

@app.get("/download/category-pdf")
async def download_category_pdf(request:Request,category:str="All Products",subproduct:str="All Sub-products",mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    try: b=category_pdf(request,category,subproduct,mode,report_date)
    except Exception as e: return JSONResponse({"detail":str(e)},status_code=400)
    return Response(content=b,media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="Marketing_Report_{mode}.pdf"'})

@app.get("/download/co-excel")
async def download_co_excel(request:Request,report_type:str="I",mode:str="monthly",report_date:str|None=None,daily_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    d=co_report_data(report_type,mode,report_date,daily_date); b=report_excel(report_type,d)
    return Response(content=b,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",headers={"Content-Disposition":f'attachment; filename="CO_Report_{report_type}.xlsx"'})

@app.get("/download/co-pdf")
async def download_co_pdf(request:Request,report_type:str="I",mode:str="monthly",report_date:str|None=None,daily_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    d=co_report_data(report_type,mode,report_date,daily_date); b=pdf_table_report(report_type,d)
    return Response(content=b,media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="CO_Report_{report_type}.pdf"'})

@app.get("/download/pdf")
async def download_pdf(request:Request,mode:str="monthly",report_date:str|None=None):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    if DATA["df"] is None: return JSONResponse({"detail":"Upload an Excel file first."},status_code=400)
    d=co_report_data("I",mode,report_date); b=pdf_table_report("I",d)
    return Response(content=b,media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="Marketing_Report_{mode}.pdf"'})

@app.post("/api/change-password")
async def change_password(request:Request):
    if not auth(request): return JSONResponse({"detail":"Login required."},status_code=401)
    d=await request.json(); us=users(); u=request.session["username"]
    if us[u]["password"]!=str(d.get("old_password","")): return JSONResponse({"detail":"Current password is incorrect."},status_code=400)
    new=str(d.get("new_password",""));
    if len(new)<4: return JSONResponse({"detail":"Password must contain at least 4 characters."},status_code=400)
    db.update_user_password(u,new); return {"ok":True}

@app.get("/api/users")
async def list_users(request:Request):
    if not auth(request,"admin"): return JSONResponse({"detail":"Admin access required."},status_code=403)
    us=users(); return {"users":[{"user_id":uid,"password":info.get("password",""),"role":info.get("role"),"name":info.get("name",info.get("mo_name",uid)),"cac":info.get("cac","")} for uid,info in us.items()]}

@app.post("/api/reset-user-password")
async def reset_user_password(request:Request):
    if not auth(request,"admin"): return JSONResponse({"detail":"Admin access required."},status_code=403)
    d=await request.json(); uid=str(d.get("user_id","")); new=str(d.get("new_password","")); us=users()
    if uid not in us: return JSONResponse({"detail":"User not found."},status_code=404)
    if len(new)<4: return JSONResponse({"detail":"Password must contain at least 4 characters."},status_code=400)
    db.update_user_password(uid,new); return {"ok":True}


# Serves the built React SPA (frontend/dist). Registered last so it never
# shadows the /api and /download routes above: a real file under dist/ is
# served as-is (JS/CSS chunks, the logo, favicon); any other path falls back
# to index.html so React Router can handle client-side routes on refresh/deep-link.
@app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
async def spa(full_path: str):
    candidate = os.path.realpath(os.path.join(FRONTEND_DIST, full_path))
    if full_path and candidate.startswith(FRONTEND_DIST + os.sep) and os.path.isfile(candidate):
        if full_path.startswith("assets/"):
            # Vite content-hashes these filenames, so they can be cached forever.
            return FileResponse(candidate, headers={"Cache-Control": "public, max-age=31536000, immutable"})
        # sw.js / manifest / icons: always revalidate so app updates roll out.
        return FileResponse(candidate, headers={"Cache-Control": "no-cache"})
    return FileResponse(os.path.join(FRONTEND_DIST, "index.html"), headers={"Cache-Control": "no-cache"})
