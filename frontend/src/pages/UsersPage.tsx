import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, Trash2, UserPlus } from "lucide-react";
import { apiDelete, apiGet, apiPost, ApiError } from "../lib/api";
import type { UserRow, UsersData } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { BottomSheet } from "../components/ui/BottomSheet";
import { Loading, Alert } from "../components/ui/Feedback";

function PasswordCell({ value }: { value: string }) {
  const [shown, setShown] = useState(false);
  return (
    <button
      onClick={() => setShown((v) => !v)}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs text-ink-600 hover:bg-ink-100"
    >
      {shown ? value : "••••••••"}
      {shown ? <EyeOff size={13} /> : <Eye size={13} />}
    </button>
  );
}

const ROLE_LABEL: Record<string, string> = { admin: "Admin", administrator: "Administrator", mo: "Marketing Officer" };

export function UsersPage() {
  const qc = useQueryClient();
  const { data, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<UsersData>("/api/users"),
  });

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [cac, setCac] = useState("Bhopal");
  const [pw, setPw] = useState("");
  const [reset, setReset] = useState<UserRow | null>(null);
  const [newPw, setNewPw] = useState("");
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [formErr, setFormErr] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["users"] });
    qc.invalidateQueries({ queryKey: ["targets"] });
  };

  const add = useMutation({
    mutationFn: () => apiPost<{ user_id: string; password: string }>("/api/users/mo", { name, cac, password: pw || undefined }),
    onSuccess: (r) => {
      setAddOpen(false);
      setNote({ ok: true, text: `${name} added. User ID: ${r.user_id}, password: ${r.password}` });
      setName("");
      setPw("");
      refresh();
    },
    onError: (e) => setFormErr(e instanceof ApiError ? e.message : "Could not add the officer."),
  });

  const resetPw = useMutation({
    mutationFn: () => apiPost("/api/reset-user-password", { user_id: reset?.user_id, new_password: newPw }),
    onSuccess: () => {
      setNote({ ok: true, text: `Password of ${reset?.name} was reset.` });
      setReset(null);
      setNewPw("");
      refresh();
    },
    onError: (e) => setFormErr(e instanceof ApiError ? e.message : "Could not reset the password."),
  });

  const del = useMutation({
    mutationFn: (u: UserRow) => apiDelete(`/api/users/${encodeURIComponent(u.user_id)}`),
    onSuccess: (_r, u) => {
      setNote({ ok: true, text: `${u.name} was deleted.` });
      refresh();
    },
    onError: (e) => setNote({ ok: false, text: e instanceof ApiError ? e.message : "Could not delete." }),
  });

  const staff = (data?.users ?? []).filter((u) => u.role !== "mo");
  const officers = (data?.users ?? []).filter((u) => u.role === "mo");
  const cacs = [...new Set(officers.map((o) => o.cac).filter(Boolean))] as string[];

  function row(u: UserRow) {
    return (
      <li key={u.user_id} className="rounded-2xl border border-ink-200/70 bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold text-ink-900">{u.name}</div>
            <div className="text-[11.5px] text-ink-500">
              ID <b className="text-ink-700">{u.user_id}</b> · {ROLE_LABEL[u.role] ?? u.role}
              {u.cac ? ` · ${u.cac}` : ""}
            </div>
          </div>
          <PasswordCell value={u.password} />
        </div>
        <div className="mt-2.5 flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setReset(u);
              setNewPw("");
              setFormErr("");
            }}
          >
            <KeyRound size={13} /> Reset password
          </Button>
          {u.role === "mo" && (
            <Button
              size="sm"
              variant="danger"
              disabled={del.isPending}
              onClick={() => window.confirm(`Delete ${u.name} (${u.user_id})? Their tour plans and reports will be removed too.`) && del.mutate(u)}
            >
              <Trash2 size={13} /> Delete
            </Button>
          )}
        </div>
      </li>
    );
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${officers.length} Marketing Officers, ${staff.length} admin accounts`}
        tools={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setAddOpen(true);
              setFormErr("");
            }}
          >
            <UserPlus size={14} /> Add MO
          </Button>
        }
      />
      {note && (
        <div className="mb-3">
          <Alert variant={note.ok ? "success" : "error"}>{note.text}</Alert>
        </div>
      )}
      {error && <Alert>{(error as Error).message}</Alert>}
      {!data && !error && <Loading />}
      {data && (
        <div className="space-y-5">
          <section>
            <h2 className="font-display mb-2 px-1 text-[15px] font-extrabold text-ink-900">Marketing Officers</h2>
            <ul className="space-y-2.5">{officers.map(row)}</ul>
          </section>
          <section>
            <h2 className="font-display mb-2 px-1 text-[15px] font-extrabold text-ink-900">Admin accounts</h2>
            <ul className="space-y-2.5">{staff.map(row)}</ul>
          </section>
        </div>
      )}

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Marketing Officer">
        <div className="space-y-3">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nimisha Gupta" />
          </Field>
          <Field label="CAC">
            <Input list="cac-list" value={cac} onChange={(e) => setCac(e.target.value)} />
            <datalist id="cac-list">
              {cacs.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Password (optional, auto-generated if empty)">
            <Input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Leave empty for MOnn@2026" />
          </Field>
          <p className="text-[12px] text-ink-500">The officer gets a login and starts with default targets. Change them later under Targets.</p>
          {formErr && <Alert>{formErr}</Alert>}
          <Button variant="primary" className="w-full !h-12" onClick={() => add.mutate()} disabled={add.isPending || name.trim().length < 3}>
            Create login
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={reset !== null} onClose={() => setReset(null)} title="Reset password">
        <div className="space-y-3">
          <p className="text-[13px] text-ink-600">
            New password for <b>{reset?.name}</b> ({reset?.user_id})
          </p>
          <Field label="New password (min 4 characters)">
            <Input value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </Field>
          {formErr && <Alert>{formErr}</Alert>}
          <Button variant="primary" className="w-full !h-12" onClick={() => resetPw.mutate()} disabled={resetPw.isPending || newPw.length < 4}>
            Reset password
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
