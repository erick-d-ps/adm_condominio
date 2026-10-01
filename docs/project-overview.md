# CondoManager

Última atualização: 2026-10-01

Sistema web de um único condomínio, o Residencial Aurora. Funcionários da administração e moradores cadastrados registram e acompanham ocorrências no mesmo lugar.

A especificação completa está em [prd/condominio-web.md](prd/condominio-web.md). A arquitetura está em [architecture.md](architecture.md). O onboarding está no [README](../README.md).

## Quem usa

- **Funcionário:** entra com e-mail e senha em `/funcionario/login`. A interface não cadastra funcionários; a conta inicial é provisionada fora da aplicação.
- **Morador:** entra em `/morador/acesso` com o e-mail cadastrado e a senha inicial definida pelo funcionário (mínimo de 12 caracteres). Não há troca obrigatória no primeiro acesso nem recuperação de senha.

E-mail é único. Só pode haver um morador ativo por torre e apartamento. Morador inativo deixa de passar em `getCurrentAppUser` e em `private.is_app_user()`; as ocorrências que ele já criou continuam na listagem. Inativar libera a unidade para outro morador ativo.

## O que o produto faz

Usuários autenticados e ativos veem todas as ocorrências do condomínio, com busca e filtro por status e categoria.

| Ação               | Funcionário                    | Morador                        |
| ------------------ | ------------------------------ | ------------------------------ |
| Criar ocorrência   | Sim                            | Sim                            |
| Editar ou excluir  | Só a própria, e só se Pendente | Só a própria, e só se Pendente |
| Avançar status     | Qualquer ocorrência            | Não                            |
| Comentar           | Qualquer ocorrência            | Qualquer ocorrência            |
| Excluir comentário | Só o próprio                   | Só o próprio                   |

Uma ocorrência tem identificador visível `OC-` seguido de 8 caracteres, título, descrição, categoria, local em texto livre, autor e data. Categorias fixas: Manutenção, Ruído, Limpeza e Outros. Status só avança: Pendente → Em análise → Resolvido. A exclusão grava `deleted_at` e a ocorrência some da listagem.

Fotos são opcionais, no máximo 5 por ocorrência, até 5 MB, nos tipos jpeg, png, webp ou gif. Comentários são só texto e visíveis para quem vê a ocorrência. O detalhe identifica a ocorrência como "Morador: {nome}" ou "Administração: {nome}", sem unidade. O comentário de morador mostra só o nome; o de funcionário mostra "Administração: {nome}". O autor pode excluir o próprio comentário, com confirmação, em qualquer status. Comentário não é editado.

## Rotas

- `/` redireciona para `/funcionario/login`.
- Funcionário: `/funcionario/ocorrencias`, `/funcionario/ocorrencias/nova`, `/funcionario/ocorrencias/[publicId]`, `/funcionario/moradores`.
- Morador: `/morador/ocorrencias`, `/morador/ocorrencias/nova`, `/morador/ocorrencias/[publicId]`.
