import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { downloadCsv } from "@/lib/utils";
import { Search, Download, ClipboardList, RefreshCw, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceRequest {
  id: number;
  serviceType: string;
  fullName: string;
  email: string;
  phone: string | null;
  phoneCountryCode: string | null;
  preferredContact: string | null;
  howDidYouHear: string | null;
  previousSubjectArea: string | null;
  previousStudyLevel: string | null;
  intendedSubjectArea: string | null;
  intendedStudyLevel: string | null;
  maritalStatus: string | null;
  nationality: string | null;
  destinationCountries: string[] | null;
  studyLevel: string | null;
  currentEducation: string | null;
  fieldOfStudy: string | null;
  targetScore: string | null;
  interviewType: string | null;
  universityName: string | null;
  universities: string | null;
  programme: string | null;
  serviceNeeded: string | null;
  city: string | null;
  intakeTerm: string | null;
  year: string | null;
  budget: string | null;
  arrivalAirport: string | null;
  destinationCity: string | null;
  passengers: string | null;
  notes: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = ["New", "Reviewed", "Contacted", "Closed"];

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Reviewed: "bg-yellow-100 text-yellow-700",
  Contacted: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

const SERVICE_COLORS: Record<string, string> = {
  "Study Admissions": "bg-violet-100 text-violet-700",
  "IELTS Preparation": "bg-sky-100 text-sky-700",
  "Interview Preparation": "bg-orange-100 text-orange-700",
  "SOP & CV Guidance": "bg-teal-100 text-teal-700",
  "Student Accommodation": "bg-pink-100 text-pink-700",
  "Airport Transfer": "bg-indigo-100 text-indigo-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function ExpandedRow({ req, onStatusChange, onDelete }: {
  req: ServiceRequest;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}) {
  const [adminNotes, setAdminNotes] = useState(req.adminNotes || "");
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    try {
      await apiFetch(`/admin/service-requests/${req.id}`, {
        method: "PATCH",
        body: JSON.stringify({ adminNotes }),
      });
    } finally {
      setSaving(false);
    }
  }

  const isStudyAdmissions = req.serviceType === "Study Admissions";

  const renderStudyAdmissionsDetails = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Personal Details</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Detail label="Phone" value={req.phone && req.phoneCountryCode ? `${req.phoneCountryCode} ${req.phone}` : req.phone} />
          <Detail label="Nationality" value={req.nationality} />
          <Detail label="Marital Status" value={req.maritalStatus} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Previous Education</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Detail label="Subject Area" value={req.previousSubjectArea} />
          <Detail label="Study Level" value={req.previousStudyLevel} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Intended Future Study</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Detail label="Subject Area" value={req.intendedSubjectArea} />
          <Detail label="Study Level" value={req.intendedStudyLevel} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Destination Country</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Detail label="Countries" value={req.destinationCountries?.join(", ")} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Additional Information</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Detail label="Preferred Contact" value={req.preferredContact} />
          <Detail label="How Did You Hear" value={req.howDidYouHear} />
          <Detail label="Notes" value={req.notes} />
        </div>
      </div>
    </div>
  );

  const renderGenericDetails = () => {
    const details = [
      { label: "Phone", value: req.phone },
      { label: "Study Level", value: req.studyLevel },
      { label: "Current Education", value: req.currentEducation },
      { label: "Field of Study", value: req.fieldOfStudy },
      { label: "Target IELTS Score", value: req.targetScore },
      { label: "Interview Type", value: req.interviewType },
      { label: "University", value: req.universityName || req.universities },
      { label: "Programme", value: req.programme },
      { label: "Service Needed", value: req.serviceNeeded },
      { label: "City", value: req.city },
      { label: "Intake Term", value: req.intakeTerm },
      { label: "Year", value: req.year },
      { label: "Weekly Budget", value: req.budget },
      { label: "Arrival Airport", value: req.arrivalAirport },
      { label: "Destination City", value: req.destinationCity },
      { label: "Passengers", value: req.passengers },
      { label: "Preferred Contact", value: req.preferredContact },
      { label: "How Did You Hear", value: req.howDidYouHear },
      { label: "Notes", value: req.notes },
      { label: "Marketing Consent", value: req.marketingOptOut ? "Opted out" : "Opted in" },
      { label: "Terms Accepted", value: req.termsAccepted ? "Yes" : "No" },
    ].filter(d => d.value && d.value !== "No");

    return details.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {details.map(d => (
          <Detail key={d.label} label={d.label} value={d.value} />
        ))}
      </div>
    ) : null;
  };

  return (
    <div className="px-4 md:px-6 py-5 bg-muted/20 border-t border-border/60 space-y-5">
      {isStudyAdmissions ? renderStudyAdmissionsDetails() : renderGenericDetails()}

      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            value={req.status}
            onChange={e => onStatusChange(req.id, e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px] flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Admin Notes</label>
          <div className="flex gap-2">
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              rows={2}
              className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <Button onClick={saveNotes} disabled={saving} size="sm" variant="outline" className="self-end">
              {saving ? "…" : "Save"}
            </Button>
          </div>
        </div>

        <Button
          onClick={() => onDelete(req.id)}
          size="sm"
          variant="outline"
          className="self-end text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchRequests = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : "";
      const data = await apiFetch<ServiceRequest[]>(`/admin/service-requests${params}`);
      setRequests(data);
    } catch {
      setError("Failed to load service requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchRequests(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchRequests]);

  async function handleStatusChange(id: number, status: string) {
    try {
      await apiFetch(`/admin/service-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this service request? This cannot be undone.")) return;
    try {
      await apiFetch(`/admin/service-requests/${id}`, { method: "DELETE" });
      setRequests(prev => prev.filter(r => r.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      alert("Failed to delete.");
    }
  }

  function handleExportCsv() {
    downloadCsv(
      ["ID", "Service", "Name", "Email", "Phone", "Status", "Date"],
      requests as unknown as Record<string, unknown>[],
      (r) => {
        const req = r as unknown as ServiceRequest;
        return [String(req.id), req.serviceType, req.fullName, req.email, req.phone || "", req.status, formatDate(req.createdAt)];
      },
      `service-requests-${Date.now()}.csv`,
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {requests.length} request{requests.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchRequests(search)} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={requests.length === 0}
              className="gap-2 bg-primary hover:bg-primary/90 text-white"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or service…"
            className="w-full sm:w-80 border border-border rounded-lg pl-9 pr-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading…
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No service requests found{search ? " matching your search" : ""}.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {requests.map((req) => (
              <div key={req.id} className="border-b border-border/60 last:border-b-0">
                <button
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                  className="w-full flex items-center gap-3 px-4 md:px-6 py-4 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-2 items-center">
                    <div className="font-medium text-foreground truncate">{req.fullName}</div>
                    <div className="text-sm text-muted-foreground truncate hidden sm:block">{req.email}</div>
                    <div className="text-sm text-muted-foreground truncate hidden md:block">{req.phone || "—"}</div>
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SERVICE_COLORS[req.serviceType] || "bg-gray-100 text-gray-600"}`}>
                        {req.serviceType}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground hidden lg:block">{formatDate(req.createdAt)}</div>
                  </div>
                  {expanded === req.id
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                </button>

                {expanded === req.id && (
                  <ExpandedRow
                    req={req}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
