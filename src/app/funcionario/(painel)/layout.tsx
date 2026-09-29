import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import { requireEmployee } from "@/lib/auth/current-user";

type EmployeeLayoutProps = {
  children: ReactNode;
};

export default async function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const employee = await requireEmployee();

  return (
    <SidebarProvider>
      <EmployeeSidebar displayName={employee.displayName} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 sm:px-6">
          <SidebarTrigger aria-label="Abrir ou recolher navegação" />
          <span className="text-sm text-muted-foreground">Administração</span>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}