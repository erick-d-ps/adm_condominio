# Arquitetura

Última atualização: 2026-10-01

Visão técnica do CondoManager. O que o produto faz está em [project-overview.md](project-overview.md). Como subir o ambiente está no [README](../README.md).

## Stack

Versões declaradas em `package.json`:

- Next.js 16.3 App Router, React 19.2 e TypeScript 5. `next.config.ts` liga o React Compiler.
- Tailwind CSS 4 e componentes shadcn/ui em `src/components/ui`.
- Supabase: `@supabase/ssr` e `@supabase/supabase-js` para Auth, Postgres e Storage.
- Validação de formulários com React Hook Form e Zod 4.
- Testes de interface com Jest 30. Testes de banco com pgTAP em `supabase/tests`.

## Layout

```text
src/app/                  rotas, layouts e Server Actions
src/app/_actions/         auth, ocorrências e moradores
src/app/api/ocorrencias/  upload de fotos
src/components/           telas e shadcn/ui
src/lib/auth/             sessão e papel atual
src/lib/data/             leitura de ocorrências e moradores
src/lib/supabase/         clientes server e admin
proxy.ts                  renovação de cookies de sessão
supabase/migrations/      schema, RLS e Storage
scripts/provision-employee.mjs
```

Não há camada de API genérica. Mutações de domínio passam por Server Actions. A exceção é o upload, que precisa ler o corpo binário.

## Pedido e acesso

`proxy.ts` cria um cliente SSR com a publishable key e chama `getClaims()` para renovar cookies. O matcher ignora assets estáticos. Se as variáveis públicas faltarem, o proxy segue sem cliente.

Layouts protegidos chamam `requireEmployee()` ou `requireResident()` em `src/lib/auth/current-user.ts`. Essas funções leem o `sub` do claim, conferem `profiles.is_active` e, no morador, `residents.is_active`. Papel errado ou perfil inativo redireciona para `/funcionario/login` ou `/morador/acesso`.

Dois clientes, ambos só no servidor:

- `createSupabaseServerClient` usa a publishable key e os cookies da sessão. Consultas normais passam por ele e pelas políticas RLS.
- `createSupabaseAdminClient` usa `SUPABASE_SECRET_KEY`, sem persistir sessão. Serve para criar usuário de morador, alterar senha ou e-mail no Auth e gravar `profiles`/`residents`. Não é importado por componentes client.

O timebox local de sessão está em `supabase/config.toml` (`[auth.sessions] timebox = "720h"`, 30 dias). `jwt_expiry` local é 3600 segundos; a duração da sessão autenticada é o timebox, não o JWT.

## Modelo

Tipos em `20260928221735_foundation_types.sql`: `app_role` (`employee`, `resident`), `occurrence_category` (`maintenance`, `noise`, `cleaning`, `other`) e `occurrence_status` (`pending`, `in_review`, `resolved`).

| Tabela                | Papel                                                                              |
| --------------------- | ---------------------------------------------------------------------------------- |
| `profiles`            | Um registro por `auth.users`. Papel, nome, e-mail normalizado e `is_active`.       |
| `residents`           | Torre, apartamento e telefone do morador. `profile_id` é a chave.                  |
| `occurrences`         | `public_id` único no formato `OC-[A-Z0-9]{8}`. `deleted_at` marca exclusão lógica. |
| `occurrence_photos`   | Caminho no Storage, MIME e tamanho. Máximo de 5 MB por linha.                      |
| `occurrence_comments` | Texto do autor. Sem update/delete exposto.                                         |

Índices únicos: e-mail em `profiles`; torre + apartamento entre moradores ativos. Listagens e detalhe filtram `deleted_at is null`.

Funções usadas pela aplicação:

- `public.advance_occurrence_status` só avança Pendente → Em análise ou Em análise → Resolvido, e só para funcionário ativo.
- `public.soft_delete_occurrence` só marca `deleted_at` se o autor for o usuário atual, o status for Pendente e o perfil estiver ativo.
- `private.enforce_occurrence_photo_limit` impede a sexta foto.

O schema `private` guarda helpers (`current_app_role`, `is_app_user`, `is_employee`, `can_edit_occurrence`). `anon` não recebe grants nas tabelas de domínio.

## Autorização

RLS está ligada em todas as tabelas expostas. Seleção de ocorrências, fotos e comentários exige `private.is_app_user()`. Insert de ocorrência exige o papel correspondente e `author_profile_id = auth.uid()`. Update de título, descrição, categoria e local só passa se `can_edit_occurrence` for verdadeiro (autor, Pendente, não excluída). Morador e funcionário ativos inserem comentário em qualquer ocorrência não excluída, sempre com `author_profile_id = auth.uid()`. Só o autor exclui o próprio comentário, e a ocorrência precisa continuar visível. Não há policy de update para comentário.

Cadastro de morador não passa por policy de insert em `profiles`/`residents`: a action de funcionário usa o cliente admin depois de confirmar o papel.

## Fotos

`POST /api/ocorrencias/[id]/fotos` exige origem igual ao host, sessão ativa, autoria, status Pendente e limite de 5. O tipo é conferido pela assinatura do arquivo (`file-type`), não só pelo cabeçalho declarado. O objeto vai para o bucket privado `occurrence-photos`. Políticas de Storage permitem leitura a usuário ativo quando a ocorrência não está excluída. O browser não envia arquivo direto ao Storage com a publishable key.

## Banco local

Migrations, em ordem de timestamp: tipos, tabelas, índices e funções, RLS, bucket e políticas de Storage. `supabase/seed.sql` não cria usuários nem senhas. O funcionário inicial entra por Authentication > Users e `npm run setup:employee`.

## Testes

- `npx supabase test db` executa `supabase/tests`.
- `npm test` executa Jest (há teste de listagem e de actions de auth).
- `npm run build` e `npx tsc --noEmit` cobrem o typecheck de produção e o compilador.
