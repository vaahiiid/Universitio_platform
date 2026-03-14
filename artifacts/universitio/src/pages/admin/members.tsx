import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { downloadCsv } from "@/lib/utils";
import { Search, Download, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Member {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  source: string;
  service: string;
  createdAt: string;
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
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  function handleExportCsv() {
    downloadCsv(
      ["Name", "Email", "Phone", "Nationality", "Source", "Service", "Date"],
      members as unknown as Record<string, unknown>[],
      (m) => {
        const member = m as unknown as Member;
        return [member.fullName, member.email, member.phone || "", member.nationality || "", member.source, member.service, formatDate(member.createdAt)];
      },
      `universitio-members-${Date.now()}.csv`,
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All contacts from every form submission — {total.toLocaleString()} total
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMembers(search)}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
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

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(SOURCE_COLORS).map(([source, cls]) => {
            const count = members.filter(m => m.source === source).length;
            return (
              <div key={source} className="bg-white rounded-xl border border-border p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{source}</span>
              </div>
            );
          })}
        </div>

        {/* Table */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading members…
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No members found{search ? " matching your search" : ""}.</p>
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
                    <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Country</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Source</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Service</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {members.map((m, i) => (
                    <tr key={`${m.source}-${m.id}-${i}`} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{m.fullName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.phone || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{m.nationality || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[m.source] || "bg-gray-100 text-gray-600"}`}>
                          {m.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{m.service}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{formatDate(m.createdAt)}</td>
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
