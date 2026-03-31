import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dashboard content - no website header/footer */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
