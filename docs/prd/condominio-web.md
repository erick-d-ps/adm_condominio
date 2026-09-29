# PRD — CondoManager (Gestão de Ocorrências)

> Tipo: PRD inicial · Data: 2026-09-28
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

O CondoManager é um sistema web para **um único condomínio**. Ele organiza o registro e o acompanhamento de ocorrências (manutenção, ruído, limpeza e outros) entre **funcionários da administração** e **moradores**.

Há duas áreas:

- **Área do funcionário:** entra com e-mail e senha. Cadastra moradores, vê todas as ocorrências, cria as suas, avança status e comenta.
- **Área do morador:** entra com o e-mail cadastrado e a senha inicial definida pelo funcionário. O Supabase Auth mantém uma sessão por 30 dias. Vê todas as ocorrências do condomínio, cria as suas, edita/exclui a própria enquanto estiver pendente e comenta na própria.

O visual do recorte segue o mock de referência (painel claro, sidebar, listagem em tabela, filtros, status coloridos) e o design system já definido no projeto (azul institucional, hierarquia simples, área do morador mais direta e mobile-first).

## 2. Problema que resolve

Hoje as solicitações do condomínio se perdem em WhatsApp, caderno ou conversa informal. Falta um lugar único para:

- o morador registrar o problema (com local, categoria e fotos);
- a administração acompanhar o que está pendente, em análise ou resolvido;
- todos verem o histórico do que já foi relatado no condomínio.

## 3. Público-alvo

- **Funcionário da administração do condomínio** (síndico, zelador, equipe do condomínio).
- **Morador cadastrado** daquela unidade (uma pessoa por apartamento, neste recorte).

Não é um produto para o público geral nem para vários condomínios.

## 4. Objetivo do recorte atual

Entregar um fluxo completo e utilizável: cadastrar moradores com senha inicial, permitir acesso por e-mail e senha, abrir/listar/filtrar/detalhar ocorrências, avançar status, comentar, e permitir que o autor altere ou apague a própria ocorrência **somente enquanto estiver Pendente**.

Não inclui home de indicadores nem configurações.

## 5. Funcionalidades

**Essenciais:**

- Login do funcionário com e-mail e senha
- Cadastro, edição e inativação de moradores
- Acesso do morador por e-mail e senha definida pelo funcionário no cadastro
- Acesso bloqueado para morador inativo; sessão do morador dura 30 dias e é revogada quando ele é inativado
- Criar ocorrência (morador e funcionário): título, descrição, categoria, local, até 5 fotos opcionais
- Listar ocorrências (todos veem todas)
- Buscar e filtrar por status e categoria
- Ver detalhes da ocorrência (incluindo fotos e comentários)
- Autor edita e exclui a **própria** ocorrência só se o status for Pendente
- Funcionário avança status: Pendente → Em análise → Resolvido
- Comentários em texto: morador só na própria; funcionário em qualquer uma; visíveis para quem vê a ocorrência

**Desejáveis:**

- Nenhuma neste recorte. O que não entra está em “Fora do escopo”.

## 6. Fora do escopo

- Vários condomínios / multi-tenant
- Home do Dashboard (cards de totais, pendentes, resolvidas no mês)
- Tela de Configurações
- Cadastro de funcionários pela interface (há um funcionário inicial na implantação)
- Recuperação de senha do funcionário
- Troca obrigatória de senha no primeiro acesso, recuperação de senha do morador e cadastro self-service
- Categorias criadas/editadas pelo usuário (a lista é fixa)
- Editar ou excluir ocorrência de outra pessoa
- Voltar status (ex.: Resolvido → Em análise)
- Editar ou excluir comentário
- Foto dentro do comentário
- Chat, pagamento, reservas, assembleia, documentos, avisos
- Notificações extras (e-mail de mudança de status, push, WhatsApp)
- App nativo
- Relatórios e exportação
- Canal de “Suporte” do mock

## 7. Regras de negócio

- Regra 1: O sistema atende **um único condomínio**.
- Regra 2: Existem dois papéis: **funcionário** e **morador**. Não há papéis intermediários neste recorte.
- Regra 3: O morador **vê todas** as ocorrências do condomínio (incluindo as de outros moradores e as da administração).
- Regra 4: Comentários seguem a mesma visibilidade da ocorrência: quem vê a ocorrência vê os comentários.
- Regra 5: Categorias fixas: **Manutenção**, **Ruído**, **Limpeza**, **Outros**.
- Regra 6: Status só **avança**: Pendente → Em análise → Resolvido. Não volta. Qualquer funcionário pode avançar o status de qualquer ocorrência.
- Regra 7: Morador **não** muda status.
- Regra 8: O autor (morador ou funcionário) pode **editar e excluir somente a própria** ocorrência, e **somente enquanto o status for Pendente**.
- Regra 9: Funcionário **não** edita nem exclui ocorrência de morador (nem de outro funcionário). Só a própria, se Pendente.
- Regra 10: Morador comenta **somente na ocorrência que ele criou**. Funcionário comenta em **qualquer** ocorrência.
- Regra 11: E-mail do morador é **único**. Combinação torre + apartamento é **única entre moradores ativos** (só 1 morador ativo por apto).
- Regra 12: Nome completo, e-mail, torre/apartamento e telefone são **obrigatórios** no cadastro do morador.
- Regra 13: Morador ativo entra com o e-mail cadastrado e a senha inicial definida pelo funcionário no cadastro. A senha é gerenciada pelo Supabase Auth e não é armazenada em `profiles`. O funcionário compartilha a senha por um canal seguro. Se o e-mail for alterado, o novo endereço passa a ser usado imediatamente com a mesma senha.
- Regra 14: Morador **inativo** não autentica nem acessa o sistema. Inativar bloqueia imediatamente novas operações protegidas, mesmo que a sessão ainda exista. As ocorrências que ele já criou **permanecem** visíveis na listagem.
- Regra 15: Inativar um morador **libera** o apartamento para cadastrar outro morador ativo na mesma unidade.
- Regra 16: Fotos: no máximo **5** por ocorrência, opcionais. *(Suposição: arquivos de imagem comuns, recusados se o formato não for imagem.)*
- Regra 17: Local da ocorrência é **texto livre**.
- Regra 18: Comentário é **somente texto**. *(Suposição: permitido em qualquer status, inclusive Resolvido, para não travar o diálogo.)*
- Regra 19: Comentário **não** pode ser editado nem excluído neste recorte.
- Regra 20: Ocorrência excluída some da listagem e não pode ser reaberta pela interface.
- Regra 21: Toda ocorrência tem um identificador visível (ex.: `#OC-1042`), autor, data de criação, categoria, título, local e status.
- Regra 22: Funcionário autentica com e-mail e senha. Morador autentica com e-mail cadastrado e senha definida pela administração. A sessão do morador dura 30 dias. Não há troca obrigatória da senha no primeiro acesso neste recorte.
- Regra 23: *(Suposição de implantação)* existe pelo menos um funcionário já definido para o primeiro acesso; a tela não cadastra novos funcionários.

## 8. Fluxos principais

### Fluxo 1 — Funcionário entra e cadastra morador

1. O funcionário acessa a área administrativa e informa e-mail e senha.
2. Se as credenciais forem válidas, entra na listagem de ocorrências.
3. Vai em Cadastro de Moradores, preenche nome, e-mail, senha inicial, torre/apartamento e telefone.
4. O sistema grava a conta autenticada e o perfil de morador como ativos; não envia a senha por e-mail.
5. O funcionário vê a confirmação e compartilha a senha inicial com o morador por um canal seguro.

### Fluxo 2 — Morador acessa com e-mail e senha e abre ocorrência

1. O morador informa o e-mail cadastrado na tela de acesso.
2. O morador informa a senha inicial recebida da administração.
3. O Supabase Auth valida as credenciais; o sistema confirma que o perfil e o cadastro de morador estão ativos e inicia uma sessão por 30 dias.
4. Vê a lista de ocorrências do condomínio, com busca e filtros.
5. Clica em nova ocorrência, preenche título, descrição, categoria, local e, se quiser, até 5 fotos.
6. Salva. A ocorrência nasce **Pendente**, com ele como autor, e aparece para todos.

### Fluxo 3 — Acompanhar, comentar e avançar status

1. Qualquer usuário autorizado abre o detalhe de uma ocorrência (ícone de visualizar na lista).
2. Vê dados, fotos e comentários.
3. Se for o autor e o status for Pendente, pode editar ou excluir.
4. Se for o autor morador, ou um funcionário, pode escrever um comentário (morador só na própria).
5. O funcionário, quando couber, avança o status (Pendente → Em análise → Resolvido).

### Fluxo 4 — Inativar morador

1. O funcionário edita o cadastro e inativa o morador.
2. O morador deixa de autenticar e as operações protegidas bloqueiam qualquer sessão ativa.
3. O apartamento fica livre para um novo morador ativo.
4. Ocorrências antigas daquele autor continuam na lista.

## 9. Critérios de aceite

- O funcionário consegue entrar com e-mail e senha e sair (logout).
- O funcionário consegue cadastrar, editar e inativar morador.
- O funcionário cadastra o morador e define uma senha inicial de pelo menos 12 caracteres, sem enviá-la por e-mail.
- O morador ativo entra com e-mail e senha corretos; a sessão dura 30 dias.
- E-mail ou senha inválidos não liberam acesso e mostram uma mensagem genérica.
- Morador inativo não autentica e suas operações protegidas são bloqueadas imediatamente.
- Ao inativar o morador, a sessão ativa deixa de autorizar operações imediatamente.
- Morador e funcionário conseguem criar ocorrência com os campos obrigatórios.
- A listagem mostra todas as ocorrências do condomínio para os dois papéis.
- O usuário consegue buscar e filtrar por status e categoria.
- O usuário consegue abrir o detalhe, ver fotos e comentários.
- O autor consegue editar e excluir a própria ocorrência apenas se estiver Pendente.
- O sistema impede editar/excluir ocorrência de outra pessoa e impede editar/excluir a própria se não estiver Pendente.
- O funcionário consegue avançar status na ordem definida; o morador não.
- O sistema não permite voltar status.
- O morador só comenta na própria ocorrência; o funcionário comenta em qualquer uma.
- O sistema impede segundo morador ativo no mesmo e-mail ou no mesmo apartamento.
- Não existem, neste recorte, home de dashboard nem configurações.

## 10. Stack

- Next.js + TypeScript + Tailwind CSS (já no projeto)
- Supabase: autenticação por e-mail e senha do funcionário e do morador, dados e armazenamento das fotos

## 11. Justificativa da stack

O projeto já nasceu em Next.js + TypeScript + Tailwind. Para este recorte (login de funcionário e morador por e-mail e senha, cadastro e fotos), o Supabase cobre autenticação, banco e arquivos. O acesso do morador não depende de envio de e-mail; o funcionário define e compartilha a senha inicial por um canal seguro.

## 12. Fases de construção

### Fase 1 — Áreas e acesso do funcionário

Objetivo: existir o “casco” do produto e o funcionário conseguir entrar.

Specs:

- Spec 01 — Áreas, navegação e visual de referência
- Spec 02 — Login e sessão do funcionário

### Fase 2 — Moradores e acesso por senha

Objetivo: a administração cadastra o morador e define a senha inicial para o acesso.

Specs:

- Spec 03 — Cadastrar morador
- Spec 04 — Editar e inativar morador
- Spec 05 — Acesso do morador por e-mail e senha

### Fase 3 — Ocorrências

Objetivo: registrar, listar, ver, alterar a própria (se Pendente) e avançar status.

Specs:

- Spec 06 — Criar ocorrência
- Spec 07 — Listar, buscar e filtrar ocorrências
- Spec 08 — Detalhe da ocorrência
- Spec 09 — Editar e excluir a própria ocorrência (Pendente)
- Spec 10 — Avançar status

### Fase 4 — Comentários

Objetivo: registrar conversa na ocorrência, com as regras de quem pode comentar.

Specs:

- Spec 11 — Comentários na ocorrência

## 13. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Áreas, navegação e visual de referência

- **Fase:** Fase 1 — Áreas e acesso do funcionário
- **Objetivo (o quê):** Definir as duas áreas do produto (funcionário e morador), a navegação de cada uma e o visual alinhado ao mock (painel administrativo com sidebar; área do morador mais simples e mobile-first).
- **Intenção (por quê):** Sem essa base, as specs seguintes ficam soltas em telas sem identidade nem recorte de menu. Evita construir Dashboard e Configurações que estão fora do escopo.
- **Contexto:** Projeto ainda na tela inicial padrão. Há um design system no projeto (azul institucional, superfícies claras, status coloridos) e um mock de “Gestão de Ocorrências” / CondoManager / Residencial Aurora.
- **Atores:** Funcionário e morador (a navegação muda conforme o papel).
- **Descrição do comportamento:** O sistema apresenta duas experiências. Na área do funcionário, após autenticado: layout com topo (nome do produto, busca global pode existir só como elemento visual inativo se não estiver especificada — **não implementar busca global do topo neste recorte**), identificação do condomínio na sidebar (nome do condomínio + “Administração”), botão de nova ocorrência, itens de menu **Ocorrências** e **Cadastro de Moradores**, e ação **Sair**. Não há itens Dashboard, Configurações nem Suporte. A área de conteúdo usa fundo claro, cartões/tabelas com cantos suaves, status em pílulas (Pendente em destaque quente/vermelho-suave, Em análise em azul/âmbar, Resolvido em verde). Na área do morador: experiência mais direta, sem menu de cadastro de moradores, com lista de ocorrências, filtros, nova ocorrência e detalhe. O nome do condomínio aparece para reforçar contexto. Visitante sem sessão de funcionário ou de morador não vê essas áreas.
- **Entradas e saídas:** Entrada: papel da pessoa autenticada/identificada. Saída: casco de navegação correto para aquele papel, com destino inicial na listagem de ocorrências.
- **Dados/entidades envolvidos (conceitual):** Papel (funcionário | morador); identificação visível do condomínio (nome fixo neste recorte).
- **Estados e transições:** Não autenticado → não vê área interna. Funcionário autenticado → área administrativa. Morador ativo com credenciais válidas e sessão → área do morador.
- **Regras de negócio:** Área do funcionário só para funcionário. Área do morador só para morador ativo com sessão autenticada por e-mail e senha. Menus fora do escopo não aparecem.
- **Validações:** Não se aplica a formulário; aplica-se a não exibir navegação indevida.
- **Fluxo do usuário (passo a passo):**
  1. A pessoa chega autenticada/identificada.
  2. O sistema mostra a área correspondente.
  3. O funcionário navega entre Ocorrências e Cadastro de Moradores, ou sai.
  4. O morador permanece no fluxo de ocorrências (lista, nova, detalhe).
- **Casos de borda e erros:** Papel indefinido: não entra em área interna. Tentativa de abrir rota da outra área: recusa e leva ao acesso adequado (login do funcionário ou login do morador).
- **Impacto no existente:** Substitui a página inicial padrão do scaffold por um produto com duas áreas.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário autenticado, Quando ele entra no sistema, Então vê sidebar com condomínio, Ocorrências, Cadastro de Moradores, Nova ocorrência e Sair, e **não** vê Dashboard nem Configurações.
  - Dado um morador ativo com credenciais válidas, Quando entra com a sessão, Então vê a área de ocorrências e **não** vê cadastro de moradores.
  - Dado um visitante sem acesso, Quando tenta uma área interna, Então não vê dados de ocorrências nem de moradores.
- **Definição de pronto:** As duas áreas existem visualmente no padrão do mock/design system, com navegação só do recorte, sem as telas de fora do escopo.
- **Dependências:** Nenhuma
- **Fora do escopo desta spec:** Login em si (Specs 02 e 05), listagem real de dados (Spec 07), busca do topo, suporte, home com indicadores.

### Spec 02 — Login e sessão do funcionário

- **Fase:** Fase 1 — Áreas e acesso do funcionário
- **Objetivo (o quê):** O funcionário entra com e-mail e senha e mantém sessão até sair.
- **Intenção (por quê):** A administração precisa de um acesso controlado, diferente do morador (que não usa senha).
- **Contexto:** Depende da Spec 01 para saber para onde ir depois do login. Não há cadastro de funcionário na interface.
- **Atores:** Funcionário
- **Descrição do comportamento:** Tela de acesso do funcionário pede e-mail e senha. Credenciais válidas abrem a área administrativa na listagem de ocorrências. Credenciais inválidas não entram e mostram erro claro, sem revelar se o e-mail existe. Há ação Sair que encerra a sessão e volta à tela de login. Quem já está autenticado como funcionário não precisa logar de novo enquanto a sessão valer. Morador não usa esta tela para entrar.
- **Entradas e saídas:** Entrada: e-mail e senha. Saída: sessão de funcionário ou mensagem de erro.
- **Dados/entidades envolvidos (conceitual):** Funcionário: e-mail, senha, nome de exibição (se houver).
- **Estados e transições:** Sem sessão → com sessão de funcionário → sem sessão (Sair).
- **Regras de negócio:** Só funcionário entra por esta tela. Morador usa a tela própria com e-mail e senha. Não há “esqueci a senha” do funcionário neste recorte.
- **Validações:** E-mail em formato válido; senha obrigatória; recusa campos vazios.
- **Fluxo do usuário (passo a passo):**
  1. O funcionário abre o acesso administrativo.
  2. Informa e-mail e senha e confirma.
  3. Em sucesso, vê a área do funcionário.
  4. Clica em Sair e volta a precisar autenticar.
- **Casos de borda e erros:** Senha errada / e-mail inexistente: erro genérico de acesso. Sessão expirada: pede login de novo. Acesso autenticado tentando a tela de login: segue para a área interna.
- **Impacto no existente:** Cria a porta de entrada da administração.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário válido, Quando informa e-mail e senha corretos, Então entra na área administrativa.
  - Dado e-mail ou senha incorretos, Quando tenta entrar, Então permanece deslogado e vê erro.
  - Dado um funcionário autenticado, Quando clica em Sair, Então a sessão termina e áreas internas exigem novo login.
- **Definição de pronto:** Login, persistência de sessão e logout funcionam; morador não entra por essa tela.
- **Dependências:** Spec 01 — destino após o login e ação Sair.
- **Fora do escopo desta spec:** Cadastro de funcionário, recuperação de senha, acesso do morador.

### Spec 03 — Cadastrar morador

- **Fase:** Fase 2 — Moradores e acesso por senha
- **Objetivo (o quê):** O funcionário cadastra um morador ativo (nome completo, e-mail, senha inicial, torre/apartamento, telefone).
- **Intenção (por quê):** A administração provisiona a conta autenticada e entrega ao morador as credenciais por um canal seguro.
- **Contexto:** Área do funcionário, menu Cadastro de Moradores. Um condomínio apenas. Um morador ativo por apartamento.
- **Atores:** Funcionário (executa). Morador (recebe o e-mail).
- **Descrição do comportamento:** O funcionário abre o cadastro, preenche nome completo, e-mail, senha inicial de pelo menos 12 caracteres, torre, apartamento e telefone e salva. O sistema valida os campos e as unicidades, cria a conta no Supabase Auth e o morador **ativo**, e o inclui na listagem. A senha não é enviada por e-mail nem armazenada fora do Auth. O funcionário a compartilha com o morador por um canal seguro.
- **Entradas e saídas:** Entrada: nome completo, e-mail, senha inicial, torre, apartamento e telefone. Saída: morador ativo cadastrado e confirmação para o funcionário.
- **Dados/entidades envolvidos (conceitual):** Morador: nome completo, e-mail, senha gerenciada pelo Supabase Auth, torre, apartamento, telefone e situação (ativo/inativo).
- **Estados e transições:** Não existe → morador ativo.
- **Regras de negócio:** E-mail único. Um morador ativo por torre+apartamento. Campos obrigatórios. O morador usa e-mail e senha definidos pela administração; não há cadastro self-service nem troca obrigatória no primeiro acesso.
- **Validações:** Campos obrigatórios; e-mail em formato válido; senha com pelo menos 12 caracteres; telefone preenchido; recusa e-mail já usado; recusa apartamento já ocupado por morador ativo.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre Cadastro de Moradores e inicia novo cadastro.
  2. Preenche os dados e salva.
  3. O sistema valida e grava o morador ativo.
  4. O funcionário vê o morador na lista e compartilha a senha inicial por um canal seguro.
- **Casos de borda e erros:** E-mail duplicado: não grava, explica o conflito. Apto ocupado: não grava, explica o conflito. Campos vazios ou senha curta: não grava. Falha ao criar perfil ou cadastro da unidade: remove a conta Auth parcial.
- **Impacto no existente:** Cria a base de pessoas que usarão a Spec 05.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado dados válidos, senha adequada e apto livre, Quando o funcionário salva, Então o morador fica ativo e aparece na listagem com conta Auth.
  - Dado um e-mail já cadastrado, Quando tenta cadastrar de novo, Então o sistema recusa.
  - Dado um apartamento com morador ativo, Quando tenta cadastrar outro no mesmo apto, Então o sistema recusa.
- **Definição de pronto:** Cadastro válido gera conta Auth e morador ativo; conflitos de e-mail/apto são impedidos e o morador pode autenticar com as credenciais recebidas.
- **Dependências:** Spec 01 e Spec 02 (área e sessão do funcionário).
- **Fora do escopo desta spec:** Editar/inativar (Spec 04), login do morador (Spec 05), ocorrências.

### Spec 04 — Editar e inativar morador

- **Fase:** Fase 2 — Moradores e acesso por senha
- **Objetivo (o quê):** O funcionário altera dados do morador e pode inativá-lo, liberando o apartamento e bloqueando autenticação e operações protegidas.
- **Intenção (por quê):** Mudança de e-mail, telefone ou saída do imóvel precisa ser tratada sem apagar o histórico de ocorrências.
- **Contexto:** Lista/cadastro de moradores da Spec 03. Ocorrências do autor inativo continuam existindo (Specs 06–08).
- **Atores:** Funcionário
- **Descrição do comportamento:** O funcionário abre um morador e altera nome, e-mail, torre/apartamento ou telefone, respeitando unicidade. Se o e-mail mudar, o novo endereço passa a ser usado com a mesma senha, sem confirmação por código. O funcionário pode inativar ou reativar. Inativo: não autentica e operações protegidas recusam a sessão; o apartamento fica livre para outro ativo. O e-mail continua único globalmente, inclusive entre inativos. Reativar é permitido se o apartamento estiver livre; as credenciais existentes voltam a funcionar. Há listagem com situação visível (ativo/inativo).
- **Entradas e saídas:** Entrada: dados atualizados ou comando de inativar/reativar. Saída: morador atualizado; alteração de e-mail tem efeito imediato; inativação bloqueia autenticação/autorizações e libera o apartamento.
- **Dados/entidades envolvidos (conceitual):** Morador (mesmos campos + situação ativo/inativo).
- **Estados e transições:** Ativo → Ativo (edição). Ativo → Inativo. Inativo não volta a ativo neste recorte? **Suposição:** funcionário pode reativar, desde que o apto não esteja ocupado por outro ativo; se não puder reativar, teria que cadastrar outro. Para não perder o histórico do mesmo morador, **reativar é permitido** se o apto estiver livre e o e-mail continuar único.
- **Regras de negócio:** Unicidade global de e-mail. Um ativo por apto. Inativo não acessa. Ocorrências permanecem. Mudança de e-mail não altera a senha e não exige confirmação adicional neste recorte.
- **Validações:** Mesmas do cadastro; ao reativar, recusa se o apto já tiver outro ativo; ao mudar apto, recusa se o destino tiver ativo.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre o morador na lista.
  2. Altera dados ou inativa/reativa.
  3. O sistema valida e grava.
  4. Se inativou, operações protegidas deixam de autorizar a sessão. Se mudou e-mail, o novo endereço pode ser usado imediatamente com a senha atual.
- **Casos de borda e erros:** Inativar quem já está inativo: sem efeito colateral. Reativar com apto ocupado: recusa. E-mail duplicado na edição: recusa. Falha ao sincronizar Auth e perfil durante edição: reverter a atualização parcial e informar o funcionário.
- **Impacto no existente:** Altera quem pode usar a Spec 05.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador ativo, Quando o funcionário inativa, Então autenticação e operações protegidas são bloqueadas e o apto pode receber outro ativo.
  - Dado um morador ativo, Quando o e-mail é alterado, Então ele pode entrar pelo novo endereço com a senha atual.
  - Dado um apto com ativo, Quando outro cadastro (edição ou reativação) tenta usar o mesmo apto, Então o sistema recusa.
- **Definição de pronto:** Edição, inativação e reativação condicional funcionam com as unicidades e bloqueio server-side de moradores inativos.
- **Dependências:** Spec 03
- **Fora do escopo desta spec:** Excluir morador de vez; o morador editar o próprio cadastro.

### Spec 05 — Acesso do morador por e-mail e senha

- **Fase:** Fase 2 — Moradores e acesso por senha
- **Objetivo (o quê):** Permitir que um morador ativo entre com o e-mail cadastrado e a senha inicial definida pelo funcionário.
- **Intenção (por quê):** Restringir o acesso a credenciais provisionadas pela administração; conhecer somente o e-mail não concede acesso.
- **Contexto:** O morador e a senha inicial são cadastrados pela administração na Spec 03; o e-mail pode ser atualizado na Spec 04. A área do morador segue a Spec 01.
- **Atores:** Morador
- **Descrição do comportamento:** A tela pede e-mail e senha. O Supabase Auth valida as credenciais; após sucesso, o servidor valida que o usuário tem perfil de morador ativo e cadastro residencial ativo. Se válido, mantém a sessão por 30 dias e redireciona para a lista de ocorrências. O cadastro público é proibido. Senhas são gerenciadas pelo Supabase Auth, nunca armazenadas em `profiles`. O funcionário define a senha inicial, compartilha-a por canal seguro e pode conhecê-la; não há troca obrigatória no primeiro acesso neste recorte. A equipe pode autenticar como o morador enquanto conhecer a senha. Morador inativo não acessa e operações protegidas verificam a situação ativa.
- **Entradas e saídas:** Entrada: e-mail cadastrado e senha. Saída: sessão autenticada de morador ativo ou mensagem genérica de credenciais inválidas.
- **Dados/entidades envolvidos (conceitual):** Conta do Supabase Auth, perfil de morador ativo e sessão autenticada.
- **Estados e transições:** Sem sessão → credenciais válidas → sessão por até 30 dias. Credenciais incorretas, conta inativa ou papel diferente de morador → acesso negado. Sessão expirada ou morador inativado → operações protegidas negadas.
- **Regras de negócio:** Somente conta previamente provisionada e morador ativo autentica. Cadastro público é proibido. A senha é definida pelo funcionário e não tem troca obrigatória no primeiro acesso. Senha armazenada somente pelo Supabase Auth; sessão dura 30 dias.
- **Validações:** Validar formato do e-mail e senha obrigatória no servidor. Mensagem de falha não distingue conta inexistente, senha incorreta, papel inválido ou morador inativo.
- **Fluxo do usuário (passo a passo):**
  1. Morador abre a tela de acesso e informa o e-mail cadastrado e a senha recebida da administração.
  2. O Supabase Auth valida as credenciais.
  3. O servidor valida papel e situação ativa do perfil e do cadastro residencial.
  4. Se autorizado, a sessão é criada e o morador vê a lista de ocorrências.
- **Casos de borda e erros:** E-mail inexistente, senha incorreta, usuário com outro papel ou morador inativo: mesma mensagem genérica e nenhuma sessão funcional. Morador inativado após autenticar: próxima operação protegida é recusada. Senha esquecida: funcionário/administração define outra senha pelo fluxo administrativo controlado do Supabase; recuperação pelo próprio morador não faz parte deste recorte.
- **Impacto no existente:** Abre a área do morador da Spec 01 com identidade verificada e substitui o modelo anterior de autenticação.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador ativo, Quando informa e-mail e senha corretos, Então entra e mantém sessão por 30 dias.
  - Dado e-mail inexistente, senha incorreta, outro papel ou morador inativo, Quando tenta entrar, Então permanece sem acesso e vê mensagem genérica.
  - Dado um morador sem sessão, Quando tenta abrir diretamente uma rota protegida, Então é redirecionado para a tela de acesso.
  - Dado um morador autenticado, Quando é inativado, Então suas operações protegidas são bloqueadas imediatamente.
- **Definição de pronto:** Login por senha funciona para morador ativo; credenciais incorretas, outros papéis e moradores inativos são bloqueados sem revelar detalhes; acesso sem sessão segue protegido.
- **Dependências:** Specs 01, 03 e 04.
- **Fora do escopo desta spec:** Troca obrigatória no primeiro acesso, recuperação self-service de senha, cadastro self-service, autenticação do funcionário (Spec 02), criação de ocorrência (Spec 06).

### Spec 06 — Criar ocorrência

- **Fase:** Fase 3 — Ocorrências
- **Objetivo (o quê):** Morador identificado e funcionário autenticado criam ocorrência com título, descrição, categoria, local e até 5 fotos opcionais. A ocorrência nasce Pendente, com autor e data.
- **Intenção (por quê):** É o registro do problema. Sem criação, não há gestão.
- **Contexto:** Botão “Nova ocorrência” nas duas áreas. Categorias fixas. Fotos no armazenamento do produto.
- **Atores:** Morador e funcionário
- **Descrição do comportamento:** O usuário abre o formulário, informa título, descrição, categoria (Manutenção, Ruído, Limpeza, Outros) e local (texto livre). Pode anexar de 0 a 5 fotos. Ao salvar, o sistema cria a ocorrência **Pendente**, gera identificador visível, grava o autor (o morador identificado ou o funcionário logado), a data/hora e as fotos. A ocorrência passa a aparecer para **todos** os usuários das duas áreas. Não pede senha extra.
- **Entradas e saídas:** Entrada: título, descrição, categoria, local, fotos (0–5). Saída: ocorrência Pendente visível na lista e no detalhe.
- **Dados/entidades envolvidos (conceitual):** Ocorrência: identificador, título, descrição, categoria, local, status (Pendente), autor, data de criação, fotos (0–5).
- **Estados e transições:** Não existe → Pendente.
- **Regras de negócio:** Morador e funcionário podem criar. Status inicial sempre Pendente. Máximo 5 fotos. Categorias só as quatro. Local livre. Autor é quem está identificado/logado.
- **Validações:** Título, descrição, categoria e local obrigatórios. Categoria deve ser uma das quatro. Mais de 5 fotos: recusa o excedente. Arquivo que não seja imagem: recusa. Usuário sem acesso: recusa.
- **Fluxo do usuário (passo a passo):**
  1. Usuário clica em Nova ocorrência.
  2. Preenche os campos e, se quiser, anexa fotos.
  3. Salva.
  4. O sistema cria como Pendente e devolve o usuário à lista ou ao detalhe da criada.
- **Casos de borda e erros:** Campos vazios: não cria. 6ª foto: não aceita. Falha no envio da foto: não cria a ocorrência pela metade de forma silenciosa — ou grava sem a foto falha com aviso, **preferência: não confirmar sucesso total se as fotos obrigatórias ao usuário não subiram; como fotos são opcionais, cria a ocorrência e avisa quais fotos falharam**. Sem identificação: não cria.
- **Impacto no existente:** Alimenta lista e detalhe.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador identificado, Quando envia título, descrição, categoria e local válidos, Então a ocorrência nasce Pendente com ele como autor e aparece para funcionário e outros moradores.
  - Dado um funcionário autenticado, Quando cria uma ocorrência válida, Então ela nasce Pendente com o funcionário como autor e aparece na lista geral.
  - Dado um formulário sem título, Quando tenta salvar, Então o sistema não cria.
  - Dado 5 fotos já escolhidas, Quando tenta a sexta, Então o sistema não aceita.
- **Definição de pronto:** Os dois papéis criam ocorrência Pendente completa, com fotos opcionais e visibilidade geral.
- **Dependências:** Spec 02 (funcionário), Spec 05 (morador)
- **Fora do escopo desta spec:** Editar/excluir (Spec 09), status (Spec 10), comentários (Spec 11), filtros (Spec 07).

### Spec 07 — Listar, buscar e filtrar ocorrências

- **Fase:** Fase 3 — Ocorrências
- **Objetivo (o quê):** Mostrar todas as ocorrências em lista no estilo do mock (identificador, categoria/título, local, data, status, ação de ver), com busca por identificador, local ou descrição/título e filtros de status e categoria.
- **Intenção (por quê):** Administração e moradores precisam achar rápido o que está aberto ou de um tipo específico, sem home de indicadores.
- **Contexto:** Tela principal de Ocorrências nas duas áreas. Dados vêm das Specs 06 e 10 (status).
- **Atores:** Funcionário e morador
- **Descrição do comportamento:** A lista mostra **todas** as ocorrências do condomínio, das mais recentes para as mais antigas (suposição de ordenação). Colunas/campos visíveis: ID, categoria com título, local, data, status em pílula, ação de visualizar. Há busca (“ID, local ou descrição”), filtro de status (todos + Pendente, Em análise, Resolvido), filtro de categoria (todas + as quatro) e ação Filtrar. Sem resultados: estado vazio claro. Paginação quando a lista passar de uma página. Morador e funcionário veem o **mesmo conjunto** de ocorrências; a diferença é só a navegação da área e as ações posteriores (editar/status).
- **Entradas e saídas:** Entrada: texto de busca, status, categoria. Saída: lista filtrada.
- **Dados/entidades envolvidos (conceitual):** Ocorrência (campos de listagem).
- **Estados e transições:** Não se aplica (consulta). Filtros aplicados / limpos.
- **Regras de negócio:** Todos veem todas. Não lista ocorrência excluída. Status e categoria conforme regras gerais.
- **Validações:** Filtros só aceitam valores conhecidos; busca vazia = sem restrição de texto.
- **Fluxo do usuário (passo a passo):**
  1. Usuário abre Ocorrências.
  2. Vê a lista completa.
  3. Informa busca e/ou filtros e aplica.
  4. A lista reflete o recorte.
  5. Clica em visualizar e vai ao detalhe (Spec 08).
- **Casos de borda e erros:** Nenhuma ocorrência: vazio. Filtro sem match: vazio, sem erro. Busca com ID inexistente: vazio.
- **Impacto no existente:** É a tela inicial após autenticação.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado ocorrências de vários autores, Quando morador ou funcionário abre a lista, Então vê todas (não só as próprias).
  - Dado ocorrências em status mistos, Quando filtra por Pendente, Então só pendentes aparecem.
  - Dado uma ocorrência com local “Garagem”, Quando busca “Garagem”, Então ela aparece.
  - Dado uma ocorrência excluída, Quando a lista carrega, Então ela não aparece.
- **Definição de pronto:** Lista geral, busca e filtros funcionam para os dois papéis, no visual de tabela do mock.
- **Dependências:** Spec 06 (precisa existir ocorrência). Spec 01 para o casco.
- **Fora do escopo desta spec:** Cards de totais do mock; criar (já Spec 06); detalhe completo.

### Spec 08 — Detalhe da ocorrência

- **Fase:** Fase 3 — Ocorrências
- **Objetivo (o quê):** Exibir uma ocorrência completa: identificador, título, descrição, categoria, local, data, status, autor, fotos e (quando a Spec 11 existir) comentários, além das ações permitidas àquele usuário.
- **Intenção (por quê):** A lista não cabe o relato nem as fotos; o detalhe é onde se analisa e se age.
- **Contexto:** Ação de olho/visualizar da Spec 07. Ações de editar/excluir (Spec 09), status (Spec 10) e comentar (Spec 11) aparecem aqui quando essas specs existirem; nesta spec o mínimo é **ver**.
- **Atores:** Funcionário e morador
- **Descrição do comportamento:** Ao abrir o detalhe, qualquer usuário identificado/autenticado vê os dados da ocorrência e as fotos. Se a ocorrência não existir ou tiver sido excluída, mostra não encontrada. O detalhe deixa claro o autor (nome do morador + unidade, ou identificação do funcionário/administração). Não permite ao morador mudar status. Não mostra botões de editar/excluir se a pessoa não for o autor ou se o status não for Pendente (mesmo que a Spec 09 ainda não tenha o comportamento, a regra de visibilidade já vale quando 09 existir).
- **Entradas e saídas:** Entrada: escolha de uma ocorrência da lista. Saída: tela de detalhe ou não encontrado.
- **Dados/entidades envolvidos (conceitual):** Ocorrência completa + autor.
- **Estados e transições:** Não se aplica além de exibir o status atual.
- **Regras de negócio:** Quem está na área interna vê qualquer ocorrência existente (visibilidade geral). Sem exposição para visitante.
- **Validações:** ID inexistente → não encontrado, sem dados parciais.
- **Fluxo do usuário (passo a passo):**
  1. Usuário clica em visualizar na lista.
  2. Vê todas as informações e fotos.
  3. Volta à lista ou usa ações de outras specs.
- **Casos de borda e erros:** ID inválido: não encontrado. Ocorrência sem fotos: detalhe normal, sem galeria vazia confusa (estado “sem fotos”).
- **Impacto no existente:** Destino da ação da lista.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência existente, Quando qualquer morador ou funcionário abre o detalhe, Então vê título, descrição, categoria, local, data, status, autor e fotos.
  - Dado um identificador inexistente, Quando alguém tenta o detalhe, Então vê que não foi encontrada e não vê dados de outra ocorrência.
- **Definição de pronto:** Detalhe completo e recusa de ID inválido, para os dois papéis.
- **Dependências:** Spec 06, Spec 07
- **Fora do escopo desta spec:** Implementar edição, exclusão, status e comentários (specs seguintes); eles só se encaixam neste ecrã.

### Spec 09 — Editar e excluir a própria ocorrência (Pendente)

- **Fase:** Fase 3 — Ocorrências
- **Objetivo (o quê):** O autor edita ou exclui **somente a própria** ocorrência, **somente se o status for Pendente**.
- **Intenção (por quê):** Corrigir um relato recém-aberto sem deixar reescrever o que a administração já está tratando.
- **Contexto:** Detalhe (Spec 08). Status (Spec 10) tira o direito assim que sai de Pendente.
- **Atores:** Morador autor ou funcionário autor
- **Descrição do comportamento:** No detalhe, se o usuário for o autor e o status for Pendente, vê ações de editar e excluir. Editar permite mudar título, descrição, categoria, local e o conjunto de fotos (ainda no máximo 5). Salvar atualiza o registro; o identificador, o autor e a data de criação não mudam; o status permanece Pendente. Excluir pede confirmação e remove a ocorrência da listagem de todos. Se o usuário não for o autor, ou o status não for Pendente, as ações não aparecem e, se tentadas, são recusadas.
- **Entradas e saídas:** Entrada: dados atualizados ou confirmação de exclusão. Saída: ocorrência atualizada ou removida; ou recusa.
- **Dados/entidades envolvidos (conceitual):** Ocorrência (campos editáveis + status + autor).
- **Estados e transições:** Pendente + edição → continua Pendente. Pendente + exclusão → não existe mais na lista. Em análise/Resolvido → sem transição por esta spec.
- **Regras de negócio:** Só o autor. Só Pendente. Funcionário não edita ocorrência de morador. Morador não edita a de outro. Exclusão é definitiva na interface.
- **Validações:** Mesmas da criação na edição. Confirmação obrigatória na exclusão. Recusa se o status mudou para Em análise entre abrir o formulário e salvar.
- **Fluxo do usuário (passo a passo):**
  1. Autor abre o detalhe de uma Pendente sua.
  2. Edita e salva, ou confirma exclusão.
  3. Lista/detalhe refletem a mudança.
- **Casos de borda e erros:** Outro usuário tenta editar: recusa. Autor tenta editar Em análise: recusa. Exclusão sem confirmar: não exclui. Concorrência (funcionário avançou status enquanto o autor editava): recusa salvar a edição.
- **Impacto no existente:** Altera e remove itens da Spec 07/08.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o autor e status Pendente, Quando edita com dados válidos, Então as mudanças aparecem no detalhe e na lista.
  - Dado o autor e status Pendente, Quando confirma a exclusão, Então a ocorrência some da lista de todos.
  - Dado um não-autor, Quando tenta editar ou excluir, Então o sistema impede.
  - Dado o autor e status Em análise ou Resolvido, Quando tenta editar ou excluir, Então o sistema impede.
- **Definição de pronto:** Edição e exclusão só do autor em Pendente, com recusa em todos os outros casos.
- **Dependências:** Spec 06, Spec 08 (Spec 10 reforça o bloqueio após avançar status)
- **Fora do escopo desta spec:** Editar comentário; apagar ocorrência de terceiros; lixeira.

### Spec 10 — Avançar status

- **Fase:** Fase 3 — Ocorrências
- **Objetivo (o quê):** Qualquer funcionário avança o status de qualquer ocorrência na ordem Pendente → Em análise → Resolvido, sem voltar.
- **Intenção (por quê):** A administração precisa marcar o andamento; o morador não conduz esse fluxo.
- **Contexto:** Detalhe da ocorrência. Depois de sair de Pendente, a Spec 09 deixa de permitir edição/exclusão.
- **Atores:** Funcionário
- **Descrição do comportamento:** No detalhe, o funcionário vê a ação de avançar o próximo status (de Pendente para Em análise; de Em análise para Resolvido). Em Resolvido, não há avanço. O sistema não oferece escolher status arbitrário nem voltar. O morador não vê essas ações. A mudança é imediata e visível para todos na lista (pílula de status) e no detalhe.
- **Entradas e saídas:** Entrada: comando de avançar. Saída: ocorrência no próximo status.
- **Dados/entidades envolvidos (conceitual):** Ocorrência.status
- **Estados e transições:** Pendente → Em análise → Resolvido. Não há outras transições.
- **Regras de negócio:** Só funcionário. Qualquer funcionário, inclusive nas ocorrências criadas por funcionário. Morador nunca muda status. Sem retorno.
- **Validações:** Recusa se quem chama não é funcionário. Recusa se já está Resolvido. Recusa pular (Pendente → Resolvido direto).
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre o detalhe.
  2. Avança para o próximo status.
  3. A pílula muda para todos os que listam/veem a ocorrência.
- **Casos de borda e erros:** Morador tenta avançar: recusa. Já resolvida: sem ação. Dois funcionários avançam ao mesmo tempo: termina no próximo estado válido, sem pular para um estado impossível.
- **Impacto no existente:** Muda o que a Spec 07 mostra e trava a Spec 09.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário e ocorrência Pendente, Quando avança, Então fica Em análise.
  - Dado um funcionário e ocorrência Em análise, Quando avança, Então fica Resolvido.
  - Dado um funcionário e ocorrência Resolvida, Quando tenta avançar ou voltar, Então o sistema não muda o status.
  - Dado um morador, Quando está no detalhe, Então não consegue mudar o status.
- **Definição de pronto:** Avanço linear só por funcionário, visível na lista e no detalhe, sem volta e sem pulo.
- **Dependências:** Spec 08
- **Fora do escopo desta spec:** Histórico detalhado de quem mudou; e-mail de notificação de status.

### Spec 11 — Comentários na ocorrência

- **Fase:** Fase 4 — Comentários
- **Objetivo (o quê):** Permitir comentários em texto no detalhe: morador só na **própria** ocorrência; funcionário em **qualquer** uma; visíveis para todos que veem a ocorrência.
- **Intenção (por quê):** Esclarecer o relato (pedido de foto extra, prazo, o que foi feito) sem chat separado.
- **Contexto:** Detalhe (Spec 08). Visibilidade geral já definida (morador vê todas as ocorrências).
- **Atores:** Morador (autor daquela ocorrência) e funcionário
- **Descrição do comportamento:** No detalhe, a lista de comentários aparece em ordem cronológica (mais antigos primeiro ou mais novos — **suposição: mais antigos no topo, conversa linear**). Cada item mostra autor, data/hora e texto. Campo de novo comentário: visível para funcionário em qualquer ocorrência; visível para morador **apenas se ele for o autor**. Enviar grava o comentário e atualiza a lista. Não há edição nem exclusão de comentário. Fotos não entram no comentário. Comentário permitido em qualquer status (Pendente, Em análise, Resolvido).
- **Entradas e saídas:** Entrada: texto do comentário. Saída: comentário visível no detalhe para todos os papéis que veem a ocorrência.
- **Dados/entidades envolvidos (conceitual):** Comentário: texto, autor, data, ocorrência associada.
- **Estados e transições:** Não se aplica (acumula na ocorrência; não muda o status sozinho).
- **Regras de negócio:** Morador só na própria. Funcionário em qualquer. Visível para todos que veem a ocorrência. Sem editar/excluir comentário. Só texto.
- **Validações:** Texto obrigatório, não vazio. Recusa comentário de morador em ocorrência de outro. Recusa visitante.
- **Fluxo do usuário (passo a passo):**
  1. Usuário abre o detalhe.
  2. Se tiver permissão, escreve e envia.
  3. O comentário aparece para os demais que abrirem o mesmo detalhe.
- **Casos de borda e erros:** Morador em ocorrência alheia: sem campo; se tentar, recusa. Texto vazio: não envia. Ocorrência excluída: não comenta.
- **Impacto no existente:** Complementa o detalhe; não altera status nem listagem (a listagem não precisa mostrar último comentário neste recorte).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o morador autor, Quando envia um texto válido, Então o comentário aparece no detalhe para outros moradores e para o funcionário.
  - Dado um morador que não é o autor, Quando abre o detalhe de outra ocorrência, Então não consegue comentar.
  - Dado um funcionário, Quando comenta em ocorrência de morador ou de funcionário, Então o comentário é gravado e visível no detalhe.
  - Dado qualquer comentário existente, Quando outro usuário abre o detalhe, Então vê o texto (não há comentário privado neste recorte).
- **Definição de pronto:** Permissões de comentar e visibilidade geral dos comentários validadas nos dois papéis.
- **Dependências:** Spec 08
- **Fora do escopo desta spec:** Editar/excluir comentário; anexo no comentário; menções; e-mail ao novo comentário.

## 14. Ordem recomendada de implementação

1. Spec 01 — Áreas, navegação e visual de referência
2. Spec 02 — Login e sessão do funcionário
3. Spec 03 — Cadastrar morador
4. Spec 04 — Editar e inativar morador
5. Spec 05 — Acesso do morador por e-mail e senha
6. Spec 06 — Criar ocorrência
7. Spec 07 — Listar, buscar e filtrar ocorrências
8. Spec 08 — Detalhe da ocorrência
9. Spec 09 — Editar e excluir a própria ocorrência (Pendente)
10. Spec 10 — Avançar status
11. Spec 11 — Comentários na ocorrência

Seguir essa ordem evita construir ocorrência sem autor identificado, acesso sem cadastro, detalhe sem lista e comentário sem tela de detalhe. As regras de permissão ficam nas próprias specs, mas só fazem sentido depois do acesso (Specs 02 e 05) existir.

---

### Suposições explícitas (não foram perguntadas; podem ser revistas)

- Comentários permitidos em qualquer status.
- Comentários não se editam nem se apagam.
- E-mail de morador inativo continua único; apartamento é liberado.
- Morador inativo pode ser reativado se o apto estiver livre.
- Ordenação da lista: mais recentes primeiro.
- Primeiro funcionário nasce na implantação, não pela tela.
- Busca do topo do mock (sino, suporte) não entra.
