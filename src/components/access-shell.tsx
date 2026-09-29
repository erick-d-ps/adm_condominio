import type { ReactNode } from "react";
import { Building2 } from "lucide-react";

type AccessShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
};

export function AccessShell({ children, eyebrow, title }: AccessShellProps) {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(300px,0.88fr)_1.12fr]">
      <section className="relative flex min-h-55 flex-col justify-between overflow-hidden bg-primary px-6 py-7 text-primary-foreground sm:px-10 sm:py-9 lg:min-h-dvh lg:px-12 lg:py-11">
        <div className="absolute -right-20 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-24 size-80 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold leading-5">CondoManager</p>
            <p className="mt-1 text-xs text-white/75">Residencial Aurora</p>
          </div>
        </div>
        <div className="relative mt-10 max-w-sm lg:mb-8">
          <p className="text-sm font-medium text-white/75">{eyebrow}</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h1>
          <div className="mt-6 h-1 w-14 rounded-full bg-[#8ebdf9]" />
        </div>
        <p className="relative hidden text-xs text-white/65 lg:block">
          Gestão de ocorrências do condomínio
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}