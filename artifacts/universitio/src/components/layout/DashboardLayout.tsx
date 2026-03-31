import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      {/* Dashboard content - no website header/footer */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
