import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  LayoutDashboard, FileText, ClipboardCheck, Handshake, Users,
  Upload, LogOut, Menu, X, ChevronRight, MessageSquare, ClipboardList,
  UserRound, BookOpen
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface UnreadCounts {
  consultations: number;
  assessments: number;
  partners: number;
  referrals: number;
  messages: number;
  serviceRequests: number;
  total: number;
}

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, unreadKey: null, section: null },
  { label: "Members", path: "/admin/members", icon: UserRound, unreadKey: null, section: null },
  { label: "Blog", path: "/admin/blog", icon: BookOpen, unreadKey: null, section: null },
  { label: "Service Requests", path: "/admin/service-requests", icon: ClipboardList, unreadKey: "serviceRequests" as const, section: "Requests" },
  { label: "Consultations", path: "/admin/consultations", icon: FileText, unreadKey: "consultations" as const, section: "Requests" },
  { label: "Assessments", path: "/admin/assessments", icon: ClipboardCheck, unreadKey: "assessments" as const, section: "Requests" },
  { label: "Partners", path: "/admin/partners", icon: Handshake, unreadKey: "partners" as const, section: "Requests" },
  { label: "Referrals", path: "/admin/referrals", icon: Users, unreadKey: "referrals" as const, section: "Requests" },
  { label: "Contact Messages", path: "/admin/messages", icon: MessageSquare, unreadKey: "messages" as const, section: "Requests" },
  { label: "Blog Import", path: "/admin/blog-import", icon: Upload, unreadKey: null, section: null },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email, logout } = useAdminAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState<UnreadCounts | null>(null);

  const fetchUnread = useCallback(() => {
    apiFetch<UnreadCounts>("/admin/stats/unread")
      .then(setUnread)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  function handleLogout() {
    logout();
    window.location.href = import.meta.env.BASE_URL.replace(/\/$/, "") + "/admin/login";
  }

  const isActive = (path: string) => {
    if (path === "/admin") return location === "/admin";
    return location.startsWith(path);
  };

  const sidebar = (
    <div className="flex flex-col h-full bg-[#1a0a2e] text-white">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight">Universitio</h1>
        <p className="text-xs text-white/50 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          const active = isActive(item.path);
          const badge = item.unreadKey && unread ? (unread[item.unreadKey] ?? 0) : 0;
          const prevSection = idx > 0 ? NAV_ITEMS[idx - 1].section : null;
          const showSectionHeader = item.section && item.section !== prevSection;
          return (
            <div key={item.path}>
              {showSectionHeader && (
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mt-4 mb-1">
                  {item.section}
                </p>
              )}
              <Link
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {badge}
                  </span>
                )}
                {active && !badge && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <p className="text-xs text-white/40 px-3 mb-3 truncate">{email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white/90 transition-all w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <aside className="hidden lg:block w-60 fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 h-full">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-20 bg-white border-b border-border px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          {unread && unread.total > 0 && (
            <span className="text-xs text-muted-foreground">
              {unread.total} new
            </span>
          )}
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
