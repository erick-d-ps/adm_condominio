import { AccessShell } from "@/components/access-shell";
import { LoginForm } from "./_components/login-form";

export default function EmployeeLoginPage() {
  return (
    <AccessShell eyebrow="Área administrativa" title="Acompanhe o que precisa de atenção.">
      <div className="mb-7">
        <h2 className="font-heading text-2xl font-semibold">Entrar</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Acesse a gestão de ocorrências do condomínio.
        </p>
      </div>
      <LoginForm />
    </AccessShell>
  );
}