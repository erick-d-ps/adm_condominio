"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LogOut, Plus, UsersRound } from "lucide-react";
import { signOutEmployee } from "@/app/_actions/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { href: "/funcionario/ocorrencias", label: "Ocorrências", icon: ClipboardList },
  { href: "/funcionario/moradores", label: "Cadastro de Moradores", icon: UsersRound },
];

type EmployeeSidebarProps = {
  displayName: string;
};

export function EmployeeSidebar({ displayName }: EmployeeSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/funcionario/ocorrencias" />}>
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                C
              </span>
              <span className="flex min-w-0 flex-col items-start">
                <span className="truncate font-heading font-semibold">CondoManager</span>
                <span className="truncate text-xs text-muted-foreground">Residencial Aurora</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/funcionario/ocorrencias/nova" />}
                  tooltip="Nova ocorrência"
                >
                  <Plus aria-hidden="true" />
                  <span>Nova ocorrência</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 px-2 pb-2 text-sm">
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
          <span className="truncate text-muted-foreground">{displayName}</span>
        </div>
        <form action={signOutEmployee}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="submit" tooltip="Sair">
                <LogOut aria-hidden="true" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}