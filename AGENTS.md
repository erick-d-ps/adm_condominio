<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Contexto do projeto

- Visão do produto : `docs/project-overview.md`
- Arquitetura tecnica: `docs/project-overview.md`
  Considere esses documentos como fontes de verdade. se o códigodivergir deles, sinalize a inconsistência antes de ampliar a divergência.

# Diretrizes assenciais

- Preserve a separação entre as áreas de morador e Funcionário
- Nunca exponha `SUPABASE_SECRET_KEY` ou o admin client ao navegador
- Valida entradas externas com Zod
- Prefira Server Components; use Client Components somente quando necessário.
- Siga padrão de página definido em `.github/instructions/page-rule.instructions.md`.
