import { useEffect, useState, useCallback, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { downloadCsv } from "@/lib/utils";
import { Search, Download, Users, RefreshCw, Upload, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  source: string;
  createdAt: string;
  isDeletable: boolean;
}

interface MembersResponse {
  total: number;
  members: Member[];
}

const SOURCE_COLORS: Record<string, string> = {
  "Consultation": "bg-blue-100 text-blue-700",
  "Assessment": "bg-purple-100 text-purple-700",
  "Partner": "bg-emerald-100 text-emerald-700",
  "Referral": "bg-orange-100 text-orange-700",
  "Contact": "bg-pink-100 text-pink-700",
  "Service Request": "bg-indigo-100 text-indigo-700",
  "imported": "bg-amber-100 text-amber-700",
};

function sourceColor(source: string) {
  if (SOURCE_COLORS[source]) return SOURCE_COLORS[source];
  if (source === "imported" || source.toLowerCase().includes("import")) return SOURCE_COLORS["imported"];
  return "bg-gray-100 text-gray-600";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function parseCsvText(text: string): Array<{ fullName: string; email: string; phone: string; source: string; createdAt: string }> {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const emailIdx = header.findIndex(h => h === "email");
  const nameIdx = header.findIndex(h => h === "name");
  const surnameIdx = header.findIndex(h => h === "surname");
  const subscribedIdx = header.findIndex(h => h.includes("subscribed at") || h === "subscribed_at");
  if (emailIdx === -1) return [];

  return lines.slice(1)
    .map(line => {
      const cols = line.match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? [];
      const name = cols[nameIdx] || "";
      const surname = surnameIdx >= 0 ? cols[surnameIdx] || "" : "";
      const fullName = surname ? `${name} ${surname}`.trim() : name;
      return {
        fullName: fullName || cols[emailIdx]?.split("@")[0] || "Unknown",
        email: cols[emailIdx] || "",
        phone: "",
        source: "imported",
        createdAt: (subscribedIdx >= 0 ? cols[subscribedIdx] : "") || new Date().toISOString().slice(0, 10),
      };
    })
    .filter(r => r.email && r.fullName);
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchMembers = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : "";
      const data = await apiFetch<MembersResponse>(`/admin/members${params}`);
      setMembers(data.members);
      setTotal(data.total);
    } catch {
      setError("Failed to load members. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchMembers(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchMembers]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this imported member?")) return;
    setDeleting(id);
    try {
      await apiFetch(`/admin/members/${id}`, { method: "DELETE" });
      toast({ title: "Deleted", description: "Member removed." });
      fetchMembers(search);
    } catch {
      toast({ title: "Error", description: "Could not delete member.", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  function handleExportCsv() {
    downloadCsv(
      ["Name", "Email", "Phone", "Source", "Date"],
      members as unknown as Record<string, unknown>[],
      (m) => {
        const member = m as unknown as Member;
        return [member.fullName, member.email, member.phone || "", member.source, formatDate(member.createdAt)];
      },
      `universitio-members-${Date.now()}.csv`,
    );
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsvText(text);
      if (rows.length === 0) {
        toast({ title: "No valid rows", description: "The file had no importable rows. Ensure it has Email and Name columns.", variant: "destructive" });
        return;
      }
      const result = await apiFetch<{ inserted: number; skipped: number }>("/admin/members/import", {
        method: "POST",
        body: JSON.stringify(rows),
      });
      toast({ title: "Import complete", description: `${result.inserted} added, ${result.skipped} already existed.` });
      fetchMembers(search);
    } catch {
      toast({ title: "Import failed", description: "Could not import the file.", variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const sourceCounts = Object.keys(SOURCE_COLORS).reduce<Record<string, number>>((acc, s) => {
    acc[s] = members.filter(m => m.source === s || (s === "imported" && !SOURCE_COLORS[m.source])).length;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All contacts from every source —{" "}
              <span className="font-semibold text-primary">{total.toLocaleString()}</span> total
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => fetchMembers(search)} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {importing ? "Importing…" : "Import CSV"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileImport}
            />
            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={members.length === 0}
              className="gap-2 bg-primary hover:bg-primary/90 text-white"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full sm:w-80 border border-border rounded-lg pl-9 pr-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Source counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-border p-3 text-center col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="text-2xl font-bold text-primary">{total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">All Members</div>
          </div>
          {Object.entries(SOURCE_COLORS).map(([source, cls]) => (
            <div key={source} className="bg-white rounded-xl border border-border p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{sourceCounts[source] ?? 0}</div>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${cls}`}>{source}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading members…
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No members found{search ? " matching your search" : ""}.</p>
            {!search && (
              <p className="text-sm text-muted-foreground mt-1">
                Members are added automatically when someone submits a form, or you can import a CSV file.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Source</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {members.map((m, i) => (
                    <tr key={`${m.source}-${m.id}-${i}`} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{m.fullName}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{m.email}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sourceColor(m.source)}`}>
                          {m.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{formatDate(m.createdAt)}</td>
                      <td className="px-4 py-3">
                        {m.isDeletable && (
                          <button
                            onClick={() => handleDelete(m.id)}
                            disabled={deleting === m.id}
                            aria-label="Delete member"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
