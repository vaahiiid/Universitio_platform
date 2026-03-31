import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="overflow-hidden bg-background flex flex-col" style={{ height: "100dvh", width: "100dvw" }}>
      {/* Dashboard content - no website header/footer */}
      <main className="flex-1 overflow-hidden min-h-0">
        {children}
      </main>
    </div>
  );
}
