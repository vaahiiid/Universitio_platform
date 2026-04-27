import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  FileText, ClipboardCheck, Handshake, Users, MessageSquare,
  TrendingUp, Clock, ArrowRight
} from "lucide-react";

interface Stats {
  consultations: { total: number; new: number };
  assessments: { total: number; new: number };
  partnerRequests: { total: number; new: number };
  studentReferrals: { total: number; new: number };
  contactMessages: { total: number; new: number };
  totalNew: number;
}

interface RecentItem {
  id: number;
  type: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; path: string }> = {
  consultation: { label: "Consultation", color: "bg-blue-100 text-blue-700", path: "/admin/consultations" },
  assessment: { label: "Assessment", color: "bg-purple-100 text-purple-700", path: "/admin/assessments" },
  partner: { label: "Partner", color: "bg-emerald-100 text-emerald-700", path: "/admin/partners" },
  referral: { label: "Referral", color: "bg-orange-100 text-orange-700", path: "/admin/referrals" },
  message: { label: "Message", color: "bg-pink-100 text-pink-700", path: "/admin/messages" },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Reviewed: "bg-yellow-100 text-yellow-700",
    Contacted: "bg-green-100 text-green-700",
    "In Progress": "bg-purple-100 text-purple-700",
    Closed: "bg-gray-100 text-gray-600",
    Archived: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Stats>("/admin/stats"),
      apiFetch<RecentItem[]>("/admin/recent"),
    ])
      .then(([s, r]) => { setStats(s); setRecent(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Consultations", total: stats.consultations.total, newCount: stats.consultations.new, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", path: "/admin/consultations" },
        { label: "Assessments", total: stats.assessments.total, newCount: stats.assessments.new, icon: ClipboardCheck, color: "text-purple-600", bg: "bg-purple-50", path: "/admin/assessments" },
        { label: "Partners", total: stats.partnerRequests.total, newCount: stats.partnerRequests.new, icon: Handshake, color: "text-emerald-600", bg: "bg-emerald-50", path: "/admin/partners" },
        { label: "Referrals", total: stats.studentReferrals.total, newCount: stats.studentReferrals.new, icon: Users, color: "text-orange-600", bg: "bg-orange-50", path: "/admin/referrals" },
        { label: "Messages", total: stats.contactMessages.total, newCount: stats.contactMessages.new, icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50", path: "/admin/messages" },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of all lead submissions.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <>
            {stats && stats.totalNew > 0 && (
              <div className="bg-gradient-to-r from-[#42147d] to-[#6b3fa0] text-white rounded-xl px-5 py-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                <p className="text-sm font-medium">
                  You have <span className="font-bold">{stats.totalNew}</span> new submission{stats.totalNew !== 1 ? "s" : ""} awaiting review.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {cards.map((card) => (
                <Link key={card.label} href={card.path}>
                  <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      {card.newCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {card.newCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground">{card.total}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Recent Submissions
                </h2>
              </div>
              {recent.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No submissions yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recent.map((item) => {
                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.consultation;
                    return (
                      <Link key={`${item.type}-${item.id}`} href={`${cfg.path}/${item.id}`}>
                        <div className="px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              <StatusBadge status={item.status} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.email}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt)}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
