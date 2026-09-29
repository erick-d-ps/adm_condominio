import type { ReactNode } from "react";
import Link from "next/link";
import { ClipboardList, LogOut } from "lucide-react";
import { signOutResident } from "@/app/_actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireResident } from "@/lib/auth/current-user";

type ResidentLayoutProps = {
  children: ReactNode;
};

export default async function ResidentLayout({ children }: ResidentLayoutProps) {
  const resident = await requireResident();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link className="flex min-w-0 items-center gap-3" href="/morador/ocorrencias">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="min-w-0">
              <span className="block truncate font-heading text-sm font-semibold">CondoManager</span>
              <span className="block truncate text-xs text-muted-foreground">Residencial Aurora</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {resident.displayName} · {resident.tower} {resident.apartment}
            </span>
            <form action={signOutResident}>
              <Button variant="ghost" size="icon-sm" type="submit" aria-label="Sair">
                <LogOut data-icon="inline-start" />
              </Button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-2 sm:px-6">
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/morador/ocorrencias">
            <ClipboardList data-icon="inline-start" />
            Ocorrências
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}