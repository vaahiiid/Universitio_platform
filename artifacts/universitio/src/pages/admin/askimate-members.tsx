import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Search, Download, Upload, Filter, RefreshCw, ChevronLeft, ChevronRight,
  Edit2, Check, X, ChevronUp, ChevronDown, ChevronsUpDown, Users, Crown,
  ShieldCheck, ShieldOff, AlertCircle, Loader2, FileUp, Eye, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ── types ─────────────────────────────────────────────────────────────────────
interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  plan: "free" | "premium";
  planKey: string | null;
  status: "active" | "expired" | "free";
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  daysRemaining: number | null;
  weeklyUsage: number;
  adminNotes: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ImportRow {
  row: number;
  email: string;
  firstName: string;
  lastName: string;
  plan: "free" | "premium";
  planStartDate: string;
  planEndDate: string;
  adminNotes: string;
  isDuplicate: boolean;
  errors: string[];
  valid: boolean;
}

interface ImportPreview {
  total: number;
  valid: number;
  duplicates: number;
  invalid: number;
  rows: ImportRow[];
}

type SortKey = "createdAt" | "trialEndsAt" | "usage";
type SortDir = "asc" | "desc";

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function PlanBadge({ plan, status }: { plan: string; status: string }) {
  if (plan === "premium" && status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        <Crown className="w-3 h-3" /> Premium
      </span>
    );
  }
  if (plan === "premium" && status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
        <Crown className="w-3 h-3" /> Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
      Free
    </span>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
      <ShieldCheck className="w-3 h-3" /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-medium">
      <ShieldOff className="w-3 h-3" /> No
    </span>
  );
}

function DaysRemainingCell({ days }: { days: number | null }) {
  if (days === null) return <span className="text-slate-300">—</span>;
  if (days < 0) return <span className="text-red-500 font-semibold text-xs">Expired</span>;
  if (days <= 7) return <span className="text-orange-500 font-semibold text-xs">{days}d</span>;
  return <span className="text-emerald-600 text-xs font-medium">{days}d</span>;
}

function SortIcon({ col, sortBy, sortDir }: { col: SortKey; sortBy: SortKey; sortDir: SortDir }) {
  if (sortBy !== col) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" />;
  return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
}

// ── Edit Plan Modal ───────────────────────────────────────────────────────────
function EditPlanModal({
  member,
  onClose,
  onSaved,
}: {
  member: Member;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [plan, setPlan] = useState(member.plan);
  const [planKey, setPlanKey] = useState(member.planKey ?? "");
  const [startDate, setStartDate] = useState(member.trialStartedAt ? member.trialStartedAt.slice(0, 10) : "");
  const [endDate, setEndDate] = useState(member.trialEndsAt ? member.trialEndsAt.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function save() {
    setSaving(true);
    try {
      await apiFetch(`/admin/askimate-members/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          plan,
          planKey: planKey || null,
          trialStartedAt: startDate || null,
          trialEndsAt: endDate || null,
        }),
      });
      toast({ title: "Plan updated" });
      onSaved();
    } catch {
      toast({ title: "Failed to update plan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1a0a2e]">Edit Plan — {member.firstName} {member.lastName}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Plan Type</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as "free" | "premium")}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          {plan === "premium" && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Plan Key</label>
                <select
                  value={planKey}
                  onChange={(e) => setPlanKey(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— none —</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-annual</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Plan Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Plan End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="flex-1 bg-[#42147d] hover:bg-[#330f60]">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Inline Notes Cell ─────────────────────────────────────────────────────────
function NotesCell({ memberId, initial, onSaved }: { memberId: number; initial: string | null; onSaved: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  async function save() {
    setSaving(true);
    try {
      await apiFetch(`/admin/askimate-members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ adminNotes: value || null }),
      });
      onSaved(value);
      setEditing(false);
    } catch {
      toast({ title: "Failed to save note", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function cancel() { setValue(initial ?? ""); setEditing(false); }

  if (editing) {
    return (
      <div className="flex flex-col gap-1 min-w-[160px]">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className="text-xs border border-slate-200 rounded px-2 py-1 resize-none w-full"
          placeholder="Add a note…"
        />
        <div className="flex gap-1">
          <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-800">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button onClick={cancel} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-start gap-1 text-left group max-w-[180px]"
    >
      <span className="text-xs text-slate-500 truncate max-w-[155px] group-hover:text-slate-700 transition-colors">
        {value || <span className="text-slate-300 italic">add note…</span>}
      </span>
      <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5 transition-colors" />
    </button>
  );
}

// ── Import Wizard ─────────────────────────────────────────────────────────────
function ImportWizard({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiFetch<ImportPreview>("/admin/askimate-members/import/preview", {
        method: "POST",
        body: formData,
        headers: {},
      });
      setPreview(data);
      setStep("preview");
    } catch {
      toast({ title: "Failed to parse CSV", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setLoading(true);
    try {
      const validRows = preview.rows.filter((r) => r.valid && !r.isDuplicate);
      const data = await apiFetch<{ inserted: number; skipped: number }>("/admin/askimate-members/import/confirm", {
        method: "POST",
        body: JSON.stringify({ rows: validRows }),
      });
      setResult(data);
      setStep("done");
      onDone();
    } catch {
      toast({ title: "Import failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileUp className="w-4 h-4 text-[#42147d]" />
            <h3 className="font-semibold text-[#1a0a2e]">Import Members via CSV</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV with the following columns:
                <code className="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">email</code> (required),
                <code className="mx-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">first_name</code>,
                <code className="mx-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">last_name</code>,
                <code className="mx-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">plan</code>,
                <code className="mx-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">plan_start_date</code>,
                <code className="mx-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">plan_end_date</code>,
                <code className="mx-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">admin_notes</code>.
              </p>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center cursor-pointer hover:border-[#42147d] hover:bg-purple-50/30 transition-colors"
              >
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                {file ? (
                  <p className="text-sm font-medium text-[#42147d]">{file.name}</p>
                ) : (
                  <p className="text-sm text-slate-400">Click to choose a CSV file</p>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total rows", val: preview.total, color: "text-slate-700" },
                  { label: "Will import", val: preview.valid, color: "text-emerald-600" },
                  { label: "Duplicates", val: preview.duplicates, color: "text-amber-600" },
                  { label: "Invalid", val: preview.invalid, color: "text-red-500" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Row", "Email", "Name", "Plan", "Status"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {preview.rows.slice(0, 50).map((r) => (
                      <tr key={r.row} className={r.isDuplicate ? "bg-amber-50" : r.valid ? "" : "bg-red-50"}>
                        <td className="px-3 py-1.5 text-slate-400">{r.row}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-700">{r.email}</td>
                        <td className="px-3 py-1.5 text-slate-600">{r.firstName} {r.lastName}</td>
                        <td className="px-3 py-1.5 capitalize text-slate-600">{r.plan}</td>
                        <td className="px-3 py-1.5">
                          {r.isDuplicate ? (
                            <span className="text-amber-600 font-medium">duplicate</span>
                          ) : r.valid ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ok</span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{r.errors[0]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 50 && (
                  <p className="text-xs text-slate-400 text-center py-2">Showing first 50 of {preview.rows.length} rows</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === "done" && result && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-[#1a0a2e]">Import complete</p>
              <p className="text-sm text-slate-500 mt-1">{result.inserted} members imported, {result.skipped} skipped.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100">
          {step === "upload" && (
            <>
              <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
              <Button size="sm" onClick={handlePreview} disabled={!file || loading} className="flex-1 bg-[#42147d] hover:bg-[#330f60]">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                Preview
              </Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep("upload")} className="flex-1">Back</Button>
              <Button size="sm" onClick={handleConfirm} disabled={loading || (preview?.valid ?? 0) === 0} className="flex-1 bg-[#42147d] hover:bg-[#330f60]">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                Import {preview?.valid ?? 0} rows
              </Button>
            </>
          )}
          {step === "done" && (
            <Button size="sm" onClick={onClose} className="w-full bg-[#42147d] hover:bg-[#330f60]">Done</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main page
// ═════════════════════════════════════════════════════════════════════════════
export default function AskiMateMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch]       = useState("");
  const [planFilter, setPlanFilter]       = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [sortBy, setSortBy]       = useState<SortKey>("createdAt");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [page, setPage]           = useState(1);

  const [editingPlan, setEditingPlan] = useState<Member | null>(null);
  const [showImport, setShowImport]   = useState(false);
  const [exporting, setExporting]     = useState(false);

  const { toast } = useToast();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMembers = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: "20",
        sortBy,
        sortDir,
        ...(search   && { search }),
        ...(planFilter     && { plan:     planFilter }),
        ...(statusFilter   && { status:   statusFilter }),
        ...(verifiedFilter && { verified: verifiedFilter }),
      });
      const data = await apiFetch<{ data: Member[]; pagination: Pagination }>(
        `/admin/askimate-members?${params}`
      );
      setMembers(data.data);
      setPagination(data.pagination);
    } catch {
      toast({ title: "Failed to load members", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter, statusFilter, verifiedFilter, sortBy, sortDir, toast]);

  // Re-fetch when filters / sort change
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchMembers(1); }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search, planFilter, statusFilter, verifiedFilter, sortBy, sortDir]);

  useEffect(() => { fetchMembers(page); }, [page]);

  function toggleSort(col: SortKey) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
      const token = localStorage.getItem("admin_token") ?? "";
      const resp = await fetch(`${base}/api/admin/askimate-members/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `askimate-members-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  function updateNoteInState(id: number, note: string) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, adminNotes: note || null } : m)));
  }

  const TH = ({ col, label }: { col?: SortKey; label: string }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${col ? "cursor-pointer hover:text-slate-600 select-none" : ""}`}
      onClick={col ? () => toggleSort(col) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {col && <SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />}
      </span>
    </th>
  );

  return (
    <AdminLayout>
      <Helmet><title>AskiMate Members — Admin</title></Helmet>

      {/* Page header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Users className="w-5 h-5 text-[#42147d]" />
          <div>
            <h1 className="text-lg font-bold text-[#1a0a2e]">AskiMate Members</h1>
            <p className="text-xs text-slate-400 mt-0.5">{pagination.total} total members</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline" size="sm"
            onClick={() => setShowImport(true)}
            className="text-xs gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="text-xs gap-1.5 bg-[#42147d] hover:bg-[#330f60]"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / email…"
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#42147d]/20 focus:border-[#42147d]"
          />
        </div>

        <Filter className="w-3.5 h-3.5 text-slate-300" />

        {/* Plan filter */}
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#42147d]/20"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#42147d]/20"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired / Free</option>
        </select>

        {/* Verified filter */}
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#42147d]/20"
        >
          <option value="">All verification</option>
          <option value="yes">Email verified</option>
          <option value="no">Unverified</option>
        </select>

        <button
          onClick={() => { setSearch(""); setPlanFilter(""); setStatusFilter(""); setVerifiedFilter(""); }}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-1"
        >
          Clear filters
        </button>

        <div className="ml-auto">
          <button
            onClick={() => fetchMembers(page)}
            className="text-slate-400 hover:text-[#42147d] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <TH label="Name" />
              <TH label="Email" />
              <TH col="createdAt" label="Signup" />
              <TH label="Verified" />
              <TH label="Plan" />
              <TH col="trialEndsAt" label="Expires" />
              <TH label="Days Left" />
              <TH col="usage" label="Usage" />
              <TH label="Notes" />
              <TH label="" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading members…</p>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No members found</p>
                </td>
              </tr>
            ) : members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 font-medium text-[#1a0a2e] whitespace-nowrap">
                  {m.firstName} {m.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{m.email}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{fmtDate(m.createdAt)}</td>
                <td className="px-4 py-3"><VerifiedBadge verified={m.emailVerified} /></td>
                <td className="px-4 py-3"><PlanBadge plan={m.plan} status={m.status} /></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{fmtDate(m.trialEndsAt)}</td>
                <td className="px-4 py-3"><DaysRemainingCell days={m.daysRemaining} /></td>
                <td className="px-4 py-3 text-xs text-slate-500">{m.weeklyUsage} / wk</td>
                <td className="px-4 py-3">
                  <NotesCell
                    memberId={m.id}
                    initial={m.adminNotes}
                    onSaved={(v) => updateNoteInState(m.id, v)}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingPlan(m)}
                    className="text-xs text-[#42147d] hover:underline font-medium whitespace-nowrap"
                  >
                    Edit plan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const start = Math.max(1, pagination.page - 2);
              const p = start + i;
              if (p > pagination.totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${p === pagination.page ? "bg-[#42147d] text-white" : "hover:bg-slate-100 text-slate-600"}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingPlan && (
        <EditPlanModal
          member={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={() => { setEditingPlan(null); fetchMembers(page); }}
        />
      )}
      {showImport && (
        <ImportWizard
          onClose={() => setShowImport(false)}
          onDone={() => { setShowImport(false); fetchMembers(1); setPage(1); }}
        />
      )}
    </AdminLayout>
  );
}
