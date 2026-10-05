# CondoManager

Última atualização: 2026-10-05

Sistema de gestão de ocorrências do Residencial Aurora. A visão do produto está em [`docs/project-overview.md`](docs/project-overview.md), a arquitetura em [`docs/architecture.md`](docs/architecture.md), a especificação funcional em [`docs/prd/condominio-web.md`](docs/prd/condominio-web.md) e a identidade visual em [`docs/DESIGN.md`](docs/DESIGN.md).

## Requisitos

- Node.js 20.9 ou superior
- Docker Desktop em execução para Supabase local, migrations e testes pgTAP
- npm

No PowerShell, use `npm.cmd` e `npx.cmd` caso a política de execução bloqueie os wrappers `.ps1`.

## Desenvolvimento local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Inicie o Supabase local:

   ```bash
   npx supabase start
   ```

   O CLI mostra a URL local, a chave publishable e a secret key. A stack local inclui Auth, Postgres e Storage.

3. Crie `.env` na raiz, sem versioná-lo:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SECRET_KEY=
   ```

   Essas variáveis só conectam a aplicação ao projeto. O e-mail e a senha do funcionário não ficam no `.env`: a conta é criada em Authentication > Users, no painel do Supabase. Nunca use `SUPABASE_SECRET_KEY` em código client-side.

4. Aplique as migrations e o seed local:

   ```bash
   npx supabase db reset
   ```

   Todo arquivo SQL do banco fica em `supabase/`: migrations timestampadas em `supabase/migrations/`, dados locais em `supabase/seed.sql` e testes pgTAP em `supabase/tests/`. O seed não contém usuários nem credenciais.

5. Crie o funcionário em Authentication > Users, com e-mail confirmado e senha definida no painel. Depois vincule o perfil:

   ```bash
   npm run setup:employee
   ```

   O script não lê e-mail nem senha do `.env`. Ele consulta Authentication > Users e cria `public.profiles` com papel `employee` apenas para contas que ainda não têm perfil. Contas que já são moradores são ignoradas. Não adicione usuários nem senhas ao seed ou a uma migration.

6. Inicie a aplicação:

   ```bash
   npm run dev
   ```

   Acesse `http://localhost:3000/funcionario/login`. Para cadastrar morador, informe também uma senha inicial com pelo menos 12 caracteres e compartilhe-a por um canal seguro. O morador entra em `/morador/acesso` com e-mail e senha. Como a equipe define a senha e não há troca obrigatória no primeiro acesso, quem a conhece pode entrar como o morador.

   Moradores cadastrados antes desta alteração não têm senha definida. Para cada conta existente, defina uma senha no painel Supabase em Authentication > Users antes de usar o novo login.

## Banco e testes

As migrations são aplicadas em ordem pelo prefixo timestamp do Supabase CLI:

1. Tipos e schema privado
2. Tabelas e relações
3. Índices, triggers e funções transacionais
4. Grants e políticas RLS
5. Bucket privado e políticas do Storage

### Testes automatizados

Os testes da aplicação usam Jest. Para executar toda a suíte:

```bash
npm test
```

Para executar um arquivo específico ou deixar o Jest em modo de observação:

```bash
npx jest src/app/_actions/auth.test.ts
npx jest src/lib/auth/current-user.test.ts
npx jest src/lib/auth/session-config.test.ts
npm run test:watch
```

Os testes de banco usam pgTAP e precisam do Supabase local ativo. Eles verificam RLS, permissões e regras transacionais:

```bash
npx supabase start
npx supabase test db
```

Para fazer as verificações de produção após os testes:

```bash
npm run build
npx tsc --noEmit
```

No PowerShell, use `npm.cmd` e `npx.cmd` caso a política de execução bloqueie os wrappers `.ps1`.

RLS protege todas as tabelas expostas. A secret key só é usada no servidor para operações administrativas; as consultas normais passam pelo cliente SSR autenticado e pelas políticas do banco.

## Implantação

- Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY` no ambiente do servidor. Nunca coloque a secret key em uma variável `NEXT_PUBLIC_*`.
- O acesso do morador por e-mail e senha não depende de SMTP nem de template de e-mail. Senhas são gerenciadas pelo Supabase Auth e nunca ficam no banco da aplicação ou em logs.
- Desabilite cadastro público por e-mail e mantenha os usuários provisionados pela administração.
- Configure o timebox de sessão de 30 dias em Auth > Sessions. A configuração local usa `720h`; no Supabase hospedado, o timebox de sessão requer plano Pro ou superior. Revise essa condição para o projeto de produção.
- Linke o projeto e publique as migrations:

  ```bash
  npx supabase login
  npx supabase link --project-ref <project-ref>
  npx supabase db push
  ```

- Provisione o funcionário inicial com o mesmo fluxo seguro do script local, usando o projeto hospedado e segredos armazenados no ambiente de implantação.
- Configure o bucket `occurrence-photos` como privado e confirme as políticas RLS do Storage antes de aceitar uploads.
- Os uploads passam por `/api/ocorrencias/[id]/fotos`, que valida sessão, autoria, estado Pendente, limite e assinatura binária. Não habilite uploads diretos do browser com a chave publishable.

## Stack

- Next.js 16 App Router, React 19 e TypeScript
- Tailwind CSS 4 e shadcn/ui Base Nova
- Supabase Auth, Postgres, Row Level Security e Storage
- React Hook Form e Zod
