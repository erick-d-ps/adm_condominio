import Link from "next/link";
import { AccessShell } from "@/components/access-shell";
import { buttonVariants } from "@/components/ui/button";
import { ResidentAccessForm } from "./_components/resident-access-form";

export default function ResidentAccessPage() {
  return (
    <AccessShell eyebrow="Área do morador" title="Acompanhe o cuidado com o seu condomínio.">
      <div className="mb-7">
        <h2 className="font-heading text-2xl font-semibold">Acessar ocorrências</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Entre com o e-mail cadastrado e a senha definida pela administração.
        </p>
      </div>
      <ResidentAccessForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Funcionário?{" "}
        <Link className={buttonVariants({ variant: "link", size: "sm" })} href="/funcionario/login">
          Entrar na administração
        </Link>
      </p>
    </AccessShell>
  );
}