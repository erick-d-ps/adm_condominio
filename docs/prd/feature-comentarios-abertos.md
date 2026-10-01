# PRD — Comentários abertos nas ocorrências

> Tipo: PRD de feature · Data: 2026-10-01
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Esta feature amplia a conversa das ocorrências do Residencial Aurora. Qualquer morador ativo passa a comentar em qualquer ocorrência não excluída, inclusive nas registradas por outros moradores ou pela administração. Funcionários continuam comentando em qualquer ocorrência.

A identificação fica explícita: a ocorrência mostra se foi aberta por um morador ou pela administração, e o comentário de funcionário aparece como administração seguida do nome. Cada pessoa pode excluir apenas os próprios comentários, com confirmação, e a exclusão é definitiva.

Este recorte substitui, somente aqui, duas regras do PRD inicial: "morador comenta somente na própria ocorrência" e "comentário não pode ser excluído". As demais regras de ocorrência permanecem.

## 2. Problema que resolve

Moradores já veem todas as ocorrências do condomínio, mas só conseguem comentar na ocorrência que eles mesmos abriram. Isso impede que um morador complemente o relato de outro ou responda a uma ocorrência aberta pela administração. A conversa fica restrita ao autor e aos funcionários, embora o problema relatado seja visível para todo o condomínio.

## 3. Público-alvo

- **Morador ativo:** vê as ocorrências e passa a participar da conversa de qualquer uma que não tenha sido excluída.
- **Funcionário ativo:** continua acompanhando e comentando qualquer ocorrência; seus comentários passam a ser identificados como administração.

Visitantes e usuários inativos não entram neste recorte. Eles continuam sem acesso às áreas autenticadas.

## 4. Objetivo do recorte atual

Permitir uma conversa visível entre moradores e administração em qualquer ocorrência não excluída, com autoria clara e com a possibilidade de cada autor apagar definitivamente o próprio comentário.

## 5. Funcionalidades

**Essenciais:**

- Morador ativo comenta em qualquer ocorrência não excluída, seja de outro morador ou da administração.
- Funcionário ativo continua comentando em qualquer ocorrência não excluída.
- A ocorrência identifica quem a abriu como "Morador: {nome}" ou "Administração: {nome}", sem unidade.
- Comentário de morador mostra apenas o nome. Comentário de funcionário mostra "Administração: {nome}".
- Morador e funcionário excluem somente os próprios comentários, em qualquer status da ocorrência, após confirmação. A exclusão é definitiva.

**Desejáveis:**

- Nenhuma. O que não é essencial ficou fora deste recorte para não ampliar a conversa com curtidas, edição ou notificações.

## 6. Fora do escopo

- Curtir ou descurtir comentário, contagem de curtidas e lista de quem curtiu.
- Editar comentário.
- Excluir comentário de outra pessoa, inclusive funcionário excluindo comentário de morador.
- Anexo, menção ou comentário privado.
- Notificação, e-mail ou aviso de novo comentário.
- Alterar status da ocorrência ao comentar ou ao excluir comentário.
- Mostrar a unidade do morador no autor da ocorrência ou no comentário.
- Mostrar autor ou comentários na listagem. A listagem permanece como está.
- Mudar quem pode criar, editar, excluir ou avançar o status da ocorrência.
- Recuperar comentário excluído ou deixar um marcador de "comentário removido".

## 7. Regras de negócio

- Regra 1: Morador ativo comenta em qualquer ocorrência não excluída, tenha ela sido aberta por ele, por outro morador ou por funcionário.
- Regra 2: Funcionário ativo comenta em qualquer ocorrência não excluída.
- Regra 3: Visitante, morador inativo e funcionário inativo não comentam nem excluem comentário.
- Regra 4: Comentário continua somente texto, obrigatório e não vazio, respeitando o limite de tamanho já existente.
- Regra 5: Comentário pode ser enviado em ocorrência Pendente, Em análise ou Resolvida. Enviar comentário não muda o status.
- Regra 6: Quem vê a ocorrência vê todos os comentários. Não há comentário privado.
- Regra 7: A identificação de quem abriu a ocorrência é "Morador: {nome}" ou "Administração: {nome}". A unidade não aparece nessa identificação.
- Regra 8: Comentário de morador mostra apenas o nome, sem prefixo de papel e sem unidade. Comentário de funcionário mostra "Administração: {nome}".
- Regra 9: Somente o autor do comentário vê e confirma a exclusão daquele comentário. Morador não exclui comentário de outro morador nem de funcionário. Funcionário não exclui comentário de morador nem de outro funcionário.
- Regra 10: A exclusão do próprio comentário vale em qualquer status da ocorrência, é definitiva e não altera a ocorrência.
- Regra 11: Cancelar a confirmação não exclui o comentário.
- Regra 12: Ocorrência excluída não aceita comentário novo nem exclusão de comentário pela interface, porque deixa de ser encontrada.
- Regra 13: Comentário não é editado neste recorte.

## 8. Fluxos principais

### Fluxo 1 — Morador comenta em ocorrência de outra pessoa

1. O morador ativo abre o detalhe de uma ocorrência não excluída, aberta por outro morador ou pela administração.
2. Vê a identificação "Morador: {nome}" ou "Administração: {nome}".
3. Vê os comentários já existentes, com o nome do morador ou "Administração: {nome}".
4. Escreve um texto válido e envia.
5. O comentário aparece na conversa, identificado apenas pelo nome do morador, para qualquer pessoa que abrir o mesmo detalhe.

### Fluxo 2 — Funcionário comenta

1. O funcionário ativo abre qualquer ocorrência não excluída.
2. Escreve e envia um comentário.
3. O comentário aparece como "Administração: {nome}" para moradores e funcionários.

### Fluxo 3 — Autor exclui o próprio comentário

1. O autor do comentário, morador ou funcionário, abre a ocorrência.
2. Vê a ação de excluir somente nos próprios comentários.
3. Aciona a exclusão e confirma.
4. O comentário desaparece para todas as pessoas. A ocorrência, o status e os demais comentários permanecem.

## 9. Critérios de aceite

- O morador ativo consegue comentar em ocorrência de outro morador e em ocorrência aberta pela administração.
- O morador ativo continua conseguindo comentar na própria ocorrência.
- O funcionário ativo consegue comentar em qualquer ocorrência não excluída.
- A ocorrência aberta por morador é identificada como "Morador: {nome}", sem unidade.
- A ocorrência aberta por funcionário é identificada como "Administração: {nome}".
- O comentário de morador mostra apenas o nome. O de funcionário mostra "Administração: {nome}".
- O sistema impede comentário vazio, comentário de visitante ou usuário inativo e comentário em ocorrência excluída.
- O autor consegue excluir o próprio comentário após confirmação, em qualquer status.
- O sistema não exclui o comentário se a confirmação for cancelada.
- O sistema impede uma pessoa de excluir comentário de outra.
- Excluir comentário não muda status, título, descrição, fotos ou autor da ocorrência.
- O sistema não oferece curtir, editar comentário, anexo ou notificação.

## 10. Stack

A feature reutiliza a stack já existente do CondoManager: Next.js com App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase para autenticação, Postgres e autorização, validação com Zod e formulários com React Hook Form. Testes de interface seguem Jest; regras de autorização de banco seguem a suíte já usada no projeto.

Não há nova biblioteca, serviço externo, fila ou armazenamento. Comentário continua sendo texto associado à ocorrência e ao autor.

## 11. Justificativa da stack

A conversa já existe no detalhe da ocorrência e a permissão já é decidida no acesso autenticado ao condomínio. Ampliar quem comenta, ajustar a identificação e permitir exclusão do próprio comentário são mudanças de comportamento sobre esse fluxo. Trocar a stack ou criar um canal separado aumentaria o recorte sem resolver o problema.

## 12. Fases de construção

### Fase 1 — Identificação

Objetivo: deixar explícito quem abriu a ocorrência e quem escreveu cada comentário, antes de aumentar o número de participantes.
Specs:

- Spec 01 — Identificar quem abriu a ocorrência
- Spec 02 — Identificar quem escreveu o comentário

### Fase 2 — Conversa aberta

Objetivo: permitir que qualquer morador ativo participe da conversa de qualquer ocorrência não excluída.
Specs:

- Spec 03 — Morador comenta em qualquer ocorrência

### Fase 3 — Exclusão do próprio comentário

Objetivo: permitir que o autor retire definitivamente o próprio texto, sem apagar a ocorrência nem o comentário alheio.
Specs:

- Spec 04 — Excluir o próprio comentário

## 13. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Identificar quem abriu a ocorrência

- **Fase:** Fase 1 — Identificação
- **Objetivo (o quê):** No detalhe, mostrar se a ocorrência foi aberta por um morador ou pela administração, com o nome da pessoa.
- **Intenção (por quê):** Quando mais pessoas comentam, a conversa precisa deixar claro quem registrou o problema, sem confundir o autor da ocorrência com quem comentou depois.
- **Contexto:** O detalhe da ocorrência já existe e hoje informa quem registrou. A listagem de ocorrências não mostra o autor e não deve passar a mostrar.
- **Atores:** Morador ativo e funcionário ativo que abrem o detalhe.
- **Descrição do comportamento:** A linha de identificação do autor deixa de usar unidade e o formato antigo. Se o autor for morador, o detalhe mostra exatamente "Morador: {nome}". Se o autor for funcionário, mostra exatamente "Administração: {nome}". A frase não deve ficar "Registrada por Morador: {nome}". As demais informações do detalhe — identificador, título, descrição, categoria, local, data, status, fotos e ações de editar, excluir ou avançar status — não mudam.
- **Entradas e saídas:** Entrada: ocorrência não excluída e o papel e o nome de quem a abriu. Saída: uma linha de identificação com um dos dois formatos.
- **Dados/entidades envolvidos (conceitual):** Ocorrência já possui autor. O autor possui nome e papel de morador ou funcionário. A unidade do morador existe no cadastro, mas não é usada nesta identificação.
- **Estados e transições:** Não se aplica. A identificação não muda quando o status da ocorrência muda.
- **Regras de negócio:** Morador é identificado como "Morador: {nome}". Funcionário é identificado como "Administração: {nome}". Unidade não aparece. A regra vale para os dois públicos que veem o detalhe.
- **Validações:** Se o nome do autor não puder ser obtido, mostrar um identificador neutro já usado pelo produto, sem inventar papel. Não exibir unidade como substituto do nome.
- **Fluxo do usuário (passo a passo):**
  1. Usuário autenticado abre o detalhe de uma ocorrência.
  2. Lê quem a abriu no formato do papel correspondente.
  3. Continua vendo o restante da ocorrência como antes.
- **Casos de borda e erros:** Ocorrência inexistente ou excluída continua como não encontrada, sem linha de autor. Morador inativo não acessa a área. Dois moradores com o mesmo nome podem ficar indistinguíveis porque a unidade foi retirada de propósito.
- **Impacto no existente:** Substitui apenas a identificação do autor no detalhe. Não altera listagem, permissões de edição, exclusão da ocorrência, status ou fotos.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência aberta por morador, Quando qualquer usuário autorizado abre o detalhe, Então vê "Morador: {nome}" e não vê a unidade.
  - Dado uma ocorrência aberta por funcionário, Quando qualquer usuário autorizado abre o detalhe, Então vê "Administração: {nome}".
  - Dado a listagem de ocorrências, Quando ela é aberta, Então não passa a exibir o autor por causa desta spec.
- **Definição de pronto:** Os dois formatos aparecem no detalhe conforme o papel do autor, sem unidade e sem regressão das outras informações.
- **Dependências:** Nenhuma além do detalhe de ocorrência já existente.
- **Fora do escopo desta spec:** Mudar o texto dos comentários, permitir novo comentário ou excluir comentário.

### Spec 02 — Identificar quem escreveu o comentário

- **Fase:** Fase 1 — Identificação
- **Objetivo (o quê):** Diferenciar na conversa o comentário de um morador e o comentário da administração.
- **Intenção (por quê):** O nome isolado de um funcionário pode parecer o relato de outro morador. O prefixo de administração evita essa ambiguidade sem criar cargos que o produto não possui.
- **Contexto:** O detalhe já lista comentários em ordem cronológica, dos mais antigos para os mais novos, com nome, data, hora e texto. Esta spec muda somente a forma de apresentar o autor do comentário.
- **Atores:** Morador ativo e funcionário ativo que leem a conversa.
- **Descrição do comportamento:** Cada comentário continua mostrando data, hora e texto. Se o autor for morador, mostra apenas o nome, sem "Morador:", sem unidade e sem outro prefixo. Se o autor for funcionário, mostra "Administração: {nome}". A ordem da conversa não muda. Comentários já existentes passam a obedecer a mesma apresentação.
- **Entradas e saídas:** Entrada: comentários visíveis da ocorrência e o papel e o nome de cada autor. Saída: autor formatado conforme o papel.
- **Dados/entidades envolvidos (conceitual):** Comentário possui texto, data e autor. O autor possui nome e papel de morador ou funcionário.
- **Estados e transições:** Não se aplica. O rótulo não depende do status da ocorrência.
- **Regras de negócio:** Morador no comentário aparece só pelo nome. Funcionário aparece como "Administração: {nome}". Todos que veem a ocorrência veem o mesmo rótulo. Unidade não aparece no comentário.
- **Validações:** Se o nome não puder ser obtido, usar o identificador neutro já existente, sem atribuir o papel errado. Não transformar comentário de morador em comentário da administração.
- **Fluxo do usuário (passo a passo):**
  1. Usuário abre o detalhe.
  2. Lê a lista de comentários.
  3. Distingue morador e administração pelo formato do autor.
- **Casos de borda e erros:** Ocorrência sem comentários mantém o estado vazio já existente. Autor inativo depois do comentário não faz o texto sumir; o comentário permanece com a identificação correspondente ao papel que ele tinha.
- **Impacto no existente:** Altera a apresentação do autor na lista de comentários. Não altera quem pode comentar nem o conteúdo já gravado.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um comentário escrito por morador, Quando outro usuário abre o detalhe, Então vê somente o nome do morador.
  - Dado um comentário escrito por funcionário, Quando qualquer usuário autorizado abre o detalhe, Então vê "Administração: {nome}".
  - Dado comentários antigos, Quando o detalhe é aberto depois desta spec, Então eles seguem a mesma regra de identificação.
- **Definição de pronto:** A conversa distingue morador e administração nos dois papéis, inclusive em comentários anteriores, sem mudar a ordem nem o texto.
- **Dependências:** Nenhuma além da lista de comentários já existente. Pode ser entregue junto da Spec 01, mas não depende do novo texto do autor da ocorrência.
- **Fora do escopo desta spec:** Ampliar quem pode comentar e excluir comentário.

### Spec 03 — Morador comenta em qualquer ocorrência

- **Fase:** Fase 2 — Conversa aberta
- **Objetivo (o quê):** Permitir que qualquer morador ativo escreva um comentário em qualquer ocorrência não excluída.
- **Intenção (por quê):** O morador precisa complementar um relato de outro morador ou responder a uma ocorrência aberta pela administração sem abrir outra ocorrência.
- **Contexto:** O detalhe já possui campo de comentário para o autor da ocorrência e para o funcionário. O funcionário já comenta em qualquer ocorrência. Esta spec remove a restrição que limitava o morador à ocorrência criada por ele. A identificação definida na Spec 02 deve ser usada no comentário novo.
- **Atores:** Morador ativo e, sem mudança de permissão, funcionário ativo.
- **Descrição do comportamento:** No detalhe de uma ocorrência não excluída, o morador ativo vê o campo de novo comentário mesmo quando não é o autor e mesmo quando o autor é funcionário. Ele escreve um texto e envia. O comentário entra no fim da conversa, visível para todos que veem a ocorrência, identificado apenas pelo nome do morador. O funcionário continua podendo comentar em qualquer ocorrência, e o comentário dele aparece como "Administração: {nome}". O campo permanece disponível em Pendente, Em análise e Resolvida. Enviar não altera status, título, descrição, categoria, local, fotos ou autor da ocorrência.
- **Entradas e saídas:** Entrada: texto do comentário e a ocorrência aberta. Saída: comentário acrescentado à conversa e visível nos dois papéis. Em caso de recusa, a conversa não muda e o usuário recebe uma mensagem clara de que não foi possível comentar.
- **Dados/entidades envolvidos (conceitual):** Comentário com texto, autor e data, associado a uma ocorrência não excluída. O autor é o usuário autenticado que enviou.
- **Estados e transições:** Não se aplica à ocorrência. O comentário apenas se acumula. O status da ocorrência não muda.
- **Regras de negócio:** Morador ativo comenta em qualquer ocorrência não excluída. Funcionário ativo também comenta em qualquer uma. Quem vê a ocorrência vê o comentário. Comentário não é privado, não leva anexo e não muda o status.
- **Validações:** Texto obrigatório depois de remover espaços das extremidades. Texto vazio não é enviado. Vale o limite de tamanho já existente. Recusar visitante, usuário inativo e tentativa sobre ocorrência excluída ou inexistente. O autor gravado precisa ser o usuário autenticado; ninguém comenta em nome de outra pessoa.
- **Fluxo do usuário (passo a passo):**
  1. Morador ativo abre o detalhe de uma ocorrência que ele não criou.
  2. Vê o campo de comentário.
  3. Escreve um texto válido e envia.
  4. Vê o próprio comentário na conversa, só com o nome.
  5. Outro morador ou funcionário abre o mesmo detalhe e vê o mesmo comentário.
- **Casos de borda e erros:** Morador autor continua podendo comentar na própria ocorrência. Texto vazio não envia. Ocorrência excluída ou inexistente não oferece conversa. Se a permissão falhar, o comentário não aparece e a mensagem explica a recusa. Dois envios válidos geram dois comentários, na ordem em que forem aceitos.
- **Impacto no existente:** Amplia a permissão de comentário do morador. Mantém a permissão do funcionário. Não altera criação, edição, exclusão ou avanço de status da ocorrência. A listagem não mostra o último comentário.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador ativo e uma ocorrência de outro morador, Quando envia um texto válido, Então o comentário aparece para os demais moradores e para o funcionário.
  - Dado um morador ativo e uma ocorrência aberta pela administração, Quando envia um texto válido, Então o comentário é gravado e aparece só com o nome do morador.
  - Dado um funcionário ativo, Quando comenta em ocorrência de morador ou de funcionário, Então o comentário aparece como "Administração: {nome}".
  - Dado uma ocorrência Resolvida, Quando um morador ou funcionário autorizado comenta, Então o comentário é aceito e o status permanece Resolvida.
  - Dado um texto vazio ou um usuário sem acesso, Quando tenta comentar, Então o sistema recusa e não cria comentário.
- **Definição de pronto:** Morador e funcionário conseguem conversar em qualquer ocorrência não excluída, com as identificações da Spec 02, sem regressão das permissões de funcionário nem mudança de status.
- **Dependências:** Spec 02 — a apresentação do novo comentário precisa seguir a identificação fechada. O detalhe e o comentário em texto já existem.
- **Fora do escopo desta spec:** Excluir, editar, curtir, notificar ou anexar arquivo ao comentário.

### Spec 04 — Excluir o próprio comentário

- **Fase:** Fase 3 — Exclusão do próprio comentário
- **Objetivo (o quê):** Permitir que morador ou funcionário apague definitivamente apenas os comentários que ele mesmo escreveu.
- **Intenção (por quê):** Quem escreveu pode retirar um texto enviado por engano ou que não deva mais permanecer na conversa, sem dar a outra pessoa o poder de apagar a fala alheia.
- **Contexto:** A conversa passa a ter vários moradores e a administração. A ocorrência já possui exclusão com confirmação, mas ela remove a ocorrência inteira e só em condições próprias. Esta spec não reutiliza essa regra para o comentário: a confirmação é semelhante na experiência, mas o alvo é somente o comentário do próprio autor.
- **Atores:** Morador ativo ou funcionário ativo que seja o autor do comentário.
- **Descrição do comportamento:** Em cada comentário cujo autor é o usuário atual, o detalhe mostra uma ação de excluir. Nos comentários de outras pessoas, a ação não aparece. Ao acionar, o sistema pede confirmação e explica que a exclusão é definitiva. Se o usuário confirmar, o comentário some para todos e a quantidade de comentários é atualizada. Se cancelar, nada muda. A exclusão é permitida com a ocorrência Pendente, Em análise ou Resolvida. Não muda status, conteúdo ou autoria da ocorrência e não remove os outros comentários. Não resta marcador no lugar do comentário excluído.
- **Entradas e saídas:** Entrada: confirmação de exclusão de um comentário do próprio usuário. Saída: comentário removido da conversa para todos. Se a ação for inválida, o comentário permanece e o usuário recebe uma recusa clara.
- **Dados/entidades envolvidos (conceitual):** Comentário com autor, texto e ocorrência associada. A exclusão remove o comentário de forma definitiva, não apenas da tela de quem clicou.
- **Estados e transições:** Comentário visível, após confirmação do autor, passa a não existir. Cancelar mantém o estado visível. O status da ocorrência não participa dessa transição.
- **Regras de negócio:** Só o autor exclui o próprio comentário. Vale para morador e funcionário. Vale em qualquer status. Exige confirmação. É definitivo. Não autoriza excluir comentário alheio. Não edita o texto.
- **Validações:** Recusar exclusão quando o usuário autenticado não é o autor, quando está inativo, quando o comentário já não existe ou quando a ocorrência está excluída ou inexistente. Não aceitar exclusão sem confirmação. Não permitir que a interface ofereça a ação para comentário de outra pessoa.
- **Fluxo do usuário (passo a passo):**
  1. O autor abre a ocorrência e localiza o próprio comentário.
  2. Aciona excluir.
  3. Lê a confirmação de que a ação é definitiva.
  4. Confirma.
  5. O comentário desaparece para ele e para as outras pessoas que abrirem o detalhe.
- **Casos de borda e erros:** Cancelar não exclui. Outro usuário não vê a ação e, se tentar, é recusado. Se duas sessões confirmarem a exclusão do mesmo comentário, apenas a primeira remove; a segunda informa que o comentário não está mais disponível. Excluir o último comentário volta a mostrar o estado vazio já existente. Excluir comentário não exclui a ocorrência nem as fotos.
- **Impacto no existente:** Acrescenta exclusão definitiva ao comentário próprio. Não altera a exclusão da ocorrência, que continua seguindo a regra atual de autor e status Pendente. Não cria recuperação nem histórico de comentário removido.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o autor de um comentário, Quando confirma a exclusão, Então o comentário desaparece para todos e a ocorrência permanece.
  - Dado o autor, Quando cancela a confirmação, Então o comentário continua visível.
  - Dado uma pessoa que não escreveu o comentário, Quando abre o detalhe, Então não vê a ação de excluir aquele comentário e não consegue excluí-lo.
  - Dado uma ocorrência Em análise ou Resolvida, Quando o autor confirma a exclusão do próprio comentário, Então o comentário é removido e o status não muda.
  - Dado o último comentário da ocorrência, Quando o autor o exclui, Então a conversa volta ao estado vazio.
- **Definição de pronto:** Morador e funcionário excluem somente os próprios comentários, com confirmação, em qualquer status, sem afetar a ocorrência nem os comentários alheios.
- **Dependências:** Spec 03 — a conversa aberta é o contexto em que a exclusão passa a ser necessária. A identificação da Spec 02 ajuda o usuário a reconhecer o próprio comentário, mas a permissão depende do autor real, não do texto exibido.
- **Fora do escopo desta spec:** Editar comentário, excluir comentário de outra pessoa, curtir, notificar e recuperar comentário excluído.

## 14. Ordem recomendada de implementação

1. Spec 01 — Identificar quem abriu a ocorrência
2. Spec 02 — Identificar quem escreveu o comentário
3. Spec 03 — Morador comenta em qualquer ocorrência
4. Spec 04 — Excluir o próprio comentário

Seguir essa ordem evita abrir a conversa para mais moradores antes de ficar claro quem é morador e quem é administração. A exclusão vem por último porque atua sobre comentários que já podem ser criados e identificados.

## Trade-off aceito

A unidade do morador deixa de aparecer na identificação de quem abriu a ocorrência. Isso atende o formato escolhido, "Morador: {nome}", mas dois moradores com o mesmo nome podem não ser distinguíveis nesse ponto. A unidade não deve ser reintroduzida durante a implementação desta feature.
