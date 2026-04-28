import { useEffect, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch, apiDownload } from "@/lib/api";
import { downloadCsv } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, Search, ChevronLeft, ChevronRight, X, Save, Loader2, Trash2, Download, FileText, CheckCircle2, AlertCircle
} from "lucide-react";
import { DeleteDialog } from "@/components/admin/DeleteDialog";

const STATUSES = ["New", "Reviewed", "Contacted", "Closed"];

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Reviewed: "bg-yellow-100 text-yellow-700",
    Contacted: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || value === "undefined" || value === "null") return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground col-span-1">{label}</span>
      <span className="text-sm text-foreground col-span-2 break-words">{value}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-6 pb-3 mb-4 border-b-2 border-primary">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function CvFileSection({ cvFileName }: { cvFileName: string | null | undefined }) {
  if (!cvFileName) {
    return (
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-slate-500" />
        <span className="text-sm text-slate-600">No CV/resume uploaded</span>
      </div>
    );
  }
  
  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-900">{cvFileName}</p>
          <p className="text-xs text-blue-700">Submitted with application</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => apiDownload(`/admin/cv/${cvFileName}`, cvFileName).catch((e) => console.error("CV download failed:", e))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Download
      </button>
    </div>
  );
}

function DetailView({ id }: { id: number }) {
  const [, navigate] = useLocation();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    apiFetch<Record<string, unknown>>(`/admin/consultations/${id}`)
      .then((row) => {
        setData(row);
        setStatus(row.status as string);
        setNotes((row.notes as string) || "");
      })
      .catch(() => navigate("/admin/consultations"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await apiFetch<Record<string, unknown>>(`/admin/consultations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      });
      setData(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await apiFetch(`/admin/consultations/${id}`, { method: "DELETE" });
      navigate("/admin/consultations");
    } catch (e) { console.error(e); }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const prevEd = data.previousEducation as Array<{ fieldOfStudy: string; levelOfStudy: string }> | null;
  const dests = data.preferredDestinations as string[] | null;

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <button onClick={() => navigate("/admin/consultations")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>

        <div className="bg-white rounded-xl border border-border">
          <div className="px-6 py-5 border-b border-border flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{data.fullName as string}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{data.email as string}</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          </div>

          <div className="px-6 py-4">
            {/* SECTION 1: Personal Details */}
            <SectionHeader title="Personal Details" />
            <FieldRow label="Full Name" value={data.fullName as string} />
            <FieldRow label="Mobile Number" value={data.mobile as string} />
            <FieldRow label="Email Address" value={data.email as string} />
            <FieldRow label="Date of Birth" value={data.dateOfBirth as string} />
            <FieldRow label="Nationality" value={data.nationality as string} />
            <FieldRow label="Marital Status" value={data.maritalStatus as string} />

            {/* SECTION 2: Education Background */}
            <SectionHeader title="Education Background" />
            {prevEd && prevEd.length > 0 && (
              <div className="py-2 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground block mb-2">Previous Education</span>
                <ul className="space-y-2 ml-3">
                  {prevEd.map((ed, i) => (
                    <li key={i} className="text-sm text-foreground border-l-2 border-primary pl-3">
                      <span className="font-medium">{ed.levelOfStudy}</span>
                      {ed.fieldOfStudy && <span className="text-muted-foreground"> — {ed.fieldOfStudy}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <FieldRow label="Intended Course Area" value={data.intendedCourseArea as string} />
            <FieldRow label="Intended Study Level" value={data.intendedStudyLevel as string} />

            {/* SECTION 3: Study Preferences */}
            <SectionHeader title="Study Preferences" />
            <FieldRow label="Preferred Study Destinations" value={dests?.length ? dests.join(", ") : null} />
            <FieldRow label="Tuition Budget" value={data.tuitionBudget as string} />

            {/* SECTION 4: English Language */}
            <SectionHeader title="English Language" />
            <FieldRow label="English Language Qualification?" value={data.hasEnglishQualification as string} />
            {data.hasEnglishQualification === "yes" && (
              <>
                <FieldRow label="Qualification Type" value={data.englishQualificationType as string} />
                <FieldRow label="Overall Score" value={data.englishOverallScore as string} />
              </>
            )}
            {data.hasEnglishQualification === "no" && (
              <FieldRow label="Current English Level" value={data.englishCurrentLevel as string} />
            )}

            {/* SECTION 5: Additional Information */}
            <SectionHeader title="Additional Information" />
            <div className="py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground block mb-2">CV / Resume File</span>
              <CvFileSection cvFileName={data.cvFileName as string | null | undefined} />
            </div>
            <FieldRow label="How did you hear about us?" value={data.howDidYouHear as string} />
            <FieldRow label="Preferred Contact Method" value={data.preferredContactMethod as string} />

            {/* Consent & Submission Info */}
            <SectionHeader title="Submission & Consent" />
            <FieldRow label="Submission Date & Time" value={formatDate(data.createdAt as string)} />
            <FieldRow
              label="Consent Status"
              value={
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${data.termsAccepted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {data.termsAccepted ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {data.termsAccepted ? "Terms Accepted" : "Terms Not Accepted"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${data.marketingOptOut ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"}`}>
                    {data.marketingOptOut ? "Opted Out of Marketing" : "✓ Marketing Emails Accepted"}
                  </span>
                </div>
              }
            />
          </div>

          <div className="px-6 py-5 border-t border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Internal Notes</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes..." rows={3} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-[#42147d] hover:bg-[#42147d]/90 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} title="Delete Consultation" description="Are you sure you want to delete this consultation? This action cannot be undone." />
    </AdminLayout>
  );
}

async function handleExportCsv(search: string, statusFilter: string) {
  const params = new URLSearchParams({ page: "1", limit: "10000" });
  if (search) params.set("search", search);
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
  const res = await apiFetch<{ data: Record<string, unknown>[] }>(`/admin/consultations?${params}`);
  downloadCsv(
    ["ID", "Full Name", "Email", "Mobile", "Nationality", "Status", "Notes", "Submitted"],
    res.data,
    (item) => [
      item.id, item.fullName, item.email, item.mobile, item.nationality || "", item.status, item.notes || "",
      new Date(item.createdAt as string).toISOString(),
    ],
    `consultations-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

function ListView() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      const res = await apiFetch<{ data: Record<string, unknown>[]; pagination: Pagination }>(
        `/admin/consultations?${params}`
      );
      setItems(res.data);
      setPagination(res.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/admin/consultations/${deleteTarget}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchData(pagination.page);
    } catch (e) { console.error(e); }
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consultations</h1>
            <p className="text-sm text-muted-foreground mt-1">{pagination.total} total submissions</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExportCsv(search, statusFilter)}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {statusFilter && (
              <button onClick={() => setStatusFilter("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No consultations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Nationality</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => {
                    const destinations = item.preferredDestinations as string[] | undefined;
                    const contactMethod = item.preferredContactMethod as string | undefined;
                    const courseArea = item.intendedCourseArea as string | undefined;
                    return (
                    <tr
                      key={item.id as number}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/consultations/${item.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <p className="font-semibold text-foreground">{item.fullName as string}</p>
                          <p className="text-xs text-muted-foreground">{item.email as string}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {courseArea && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                {courseArea}
                              </span>
                            )}
                            {contactMethod && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {contactMethod}
                              </span>
                            )}
                            {destinations && destinations.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {destinations.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{item.nationality as string}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status as string} /></td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(item.createdAt as string)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id as number); }} className="text-muted-foreground hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchData(pagination.page + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Consultation" description="Are you sure you want to delete this consultation? This action cannot be undone." />
    </AdminLayout>
  );
}

export default function ConsultationsPage() {
  const [match, params] = useRoute("/admin/consultations/:id");
  if (match && params?.id) {
    return <DetailView id={parseInt(params.id, 10)} />;
  }
  return <ListView />;
}
