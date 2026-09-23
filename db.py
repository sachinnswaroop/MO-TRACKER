"""Supabase-backed persistence, replacing the old local-file JSON/uploads storage.

Auth/session logic in app.py is unchanged; this module only swaps out where the
data physically lives (Postgres tables + a Storage bucket instead of
users.json / mo_activity.json / uploads/*.xlsx on local disk), which is
required because Vercel's serverless filesystem is read-only at runtime.
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

_URL = os.environ["SUPABASE_URL"]
_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase: Client = create_client(_URL, _KEY)

UPLOAD_BUCKET = "uploads"
UPLOAD_STORAGE_PATH = "current.xlsx"


# ---------------------------------------------------------------- users ----

def fetch_users() -> dict:
    rows = supabase.table("users").select("*").execute().data
    return {r["user_id"]: r for r in rows}


def seed_missing_users(defaults: dict) -> dict:
    """Insert any default user_id not yet present in the table. Mirrors the
    old build_default_users()-seeding behaviour that ran against users.json."""
    current = fetch_users()
    missing = [{"user_id": uid, **info} for uid, info in defaults.items() if uid not in current]
    if missing:
        supabase.table("users").insert(missing).execute()
        current = fetch_users()
    return current


def update_user_password(user_id: str, new_password: str):
    supabase.table("users").update({"password": new_password}).eq("user_id", user_id).execute()


# ------------------------------------------------------------ activity -----

def fetch_activity_store() -> dict:
    tour_plans = supabase.table("tour_plans").select("*").execute().data
    tour_reports = supabase.table("tour_reports").select("*").execute().data
    co_reports = supabase.table("co_reports").select("*").execute().data
    return {"tour_plans": tour_plans, "tour_reports": tour_reports, "co_reports": co_reports}


def fetch_user_activity(user_id: str) -> dict:
    tour_plans = supabase.table("tour_plans").select("*").eq("user_id", user_id).execute().data
    tour_reports = supabase.table("tour_reports").select("*").eq("user_id", user_id).execute().data
    co_reports = supabase.table("co_reports").select("*").eq("user_id", user_id).execute().data
    return {"tour_plans": tour_plans, "tour_reports": tour_reports, "co_reports": co_reports}


def upsert_tour_plan(item: dict):
    supabase.table("tour_plans").upsert(item, on_conflict="user_id,date,category").execute()


def upsert_tour_report(item: dict):
    supabase.table("tour_reports").upsert(item, on_conflict="user_id,date").execute()


def upsert_co_report(item: dict):
    supabase.table("co_reports").upsert(item, on_conflict="user_id,date").execute()


# --------------------------------------------------------------- upload ----

def get_current_upload() -> dict | None:
    rows = supabase.table("current_upload").select("*").eq("id", 1).execute().data
    return rows[0] if rows else None


def download_current_upload_bytes(storage_path: str) -> bytes:
    return supabase.storage.from_(UPLOAD_BUCKET).download(storage_path)


def save_upload(filename: str, file_bytes: bytes) -> dict:
    supabase.storage.from_(UPLOAD_BUCKET).upload(
        UPLOAD_STORAGE_PATH,
        file_bytes,
        {"content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "upsert": "true"},
    )
    row = {"id": 1, "filename": filename, "storage_path": UPLOAD_STORAGE_PATH}
    result = supabase.table("current_upload").upsert(row, on_conflict="id").execute()
    return result.data[0]
