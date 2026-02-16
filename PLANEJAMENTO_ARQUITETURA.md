# Planejamento e Arquitetura

Este documento descreve as decisões de organização, responsabilidades e evolução da solução **RedeDor Pokédex**.

## Organização de módulos, serviços e componentes
- **Componentes de página** ficam em `src/app/pages/` e concentram UI, interação e orquestração de dados.
- **Serviços** ficam em `src/app/services/` e encapsulam regras de integração e cache de dados.
- **SEO** foi separado em `src/app/seo/` para centralizar tags, rotas e JSON‑LD.
- **Models** ficam em `src/app/models/` para tipar as respostas da PokéAPI.
- **Tokens de estilo** ficam em `src/styles/` para padronizar cores, espaçamentos e variações por página.

Essa organização facilita encontrar o que é UI, o que é infraestrutura e o que é domínio.

## Separação de responsabilidades (componentes vs. serviços)
- **Componentes**: exibem dados, lidam com eventos de UI, navegação e estados locais.
- **Serviços**: fazem chamadas HTTP, cuidam de cache e expõem métodos reutilizáveis.
- **SEO Service**: aplica `Title`, `Meta`, `Canonical` e JSON‑LD, evitando duplicação em cada página.

Com isso, a UI fica simples e o código de integração e SEO fica reutilizável e fácil de testar.

## Estado, reatividade e extensibilidade
- **Estado local**: filtros, paginação e loading são mantidos no componente de lista.
- **Reatividade**: uso de RxJS para combinar requisições e aplicar filtros de forma reativa.
- **Extensibilidade**: tipagem forte nos models e serviços facilita a inclusão de novas telas e dados.
- **Cache em serviço**: evita chamadas repetidas, melhora performance e reduz latência.

## Possíveis melhorias e escalabilidade
- **Cache no SSR**: armazenar respostas no servidor para reduzir chamadas em picos.
- **Sitemap dinâmico**: gerar URLs de Pokémon no SSR.
- **Prefetch**: pré‑carregar detalhes de Pokémon mais acessados.
- **Evolução de filtros**: multi‑seleção por tipo com presets e ordenações avançadas.
- **Observabilidade**: métricas de SEO, tempo de resposta e erros por rota.

## Uso de IA no processo
Utilizamos IA como apoio em:
- **Criação de testes**: estruturação de specs básicos e cenários principais.
- **SEO**: padronização de metatags por rota, canonical e JSON‑LD.
- **Documentação**: consolidação de decisões técnicas e explicações de arquitetura.

O uso de IA foi direcionado para acelerar tarefas repetitivas e aumentar a consistência.
