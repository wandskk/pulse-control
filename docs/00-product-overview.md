# 00 - Visão Geral do Produto

## Resumo

A aplicação será um **PWA mobile first** para envio de comandos via **SMS** a números previamente cadastrados. Esses comandos poderão representar ações como ligar ou desligar equipamentos à distância.

## Objetivo do MVP

Validar de forma segura e simples um fluxo onde:

1. o usuário cadastra números/dispositivos
2. o usuário cria botões de comando para cada número
3. cada botão possui título, texto SMS e cor
4. ao tocar no botão, o sistema envia o texto configurado para o número selecionado
5. o backend registra o envio

## Restrições do MVP

- foco em usabilidade mobile
- apenas 1 usuário inicialmente, mas já estruturar pensando em multiusuário futuro
- sem painel administrativo complexo neste primeiro momento
- evitar excesso de features
- não expor segredos nem API keys no cliente

## Casos de uso principais

### Caso de uso 1 - Cadastrar dispositivo/número
O usuário abre o app, toca em “Adicionar número” e cadastra:
- nome
- número
- descrição opcional

### Caso de uso 2 - Criar botão/comando
O usuário escolhe um número e cria um botão com:
- título
- texto/código do SMS
- cor predefinida

### Caso de uso 3 - Executar comando
O usuário toca no botão e o sistema:
- valida a ação
- envia o SMS via backend
- mostra feedback visual
- registra a execução

### Caso de uso 4 - Ver histórico
O usuário consegue ver os últimos envios, com status básico.

## Requisitos funcionais

- cadastrar números/dispositivos
- editar número/dispositivo
- remover número/dispositivo
- cadastrar botões de comando
- editar botão
- remover botão
- selecionar número ativo
- listar apenas os botões do número selecionado
- enviar SMS via backend
- registrar histórico de execução
- exibir feedback de sucesso/erro
- instalar o app no dispositivo

## Requisitos não funcionais

- mobile first
- boa responsividade para tablet e desktop, sem perder foco no mobile
- PWA
- segurança de credenciais
- arquitetura simples, mas escalável
- baixo acoplamento
- código organizado por domínio

## Fora do escopo inicial

- automações avançadas por agendamento
- múltiplos níveis de permissão
- painel analítico completo
- comandos condicionais
- integração com múltiplos provedores de SMS
