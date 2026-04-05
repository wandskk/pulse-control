# 04 - Segurança

## Princípios

Embora o MVP seja simples, esta aplicação pode acionar equipamentos remotos. Portanto, o projeto deve nascer com base segura.

## Regras obrigatórias

- nunca expor chave da SMS Dev no cliente
- nunca chamar provedor SMS diretamente do frontend
- validar payload no backend
- registrar execuções
- tratar erros sem vazar segredos
- preparar estrutura para autenticação

## Segredos e ambiente

Variáveis esperadas:
- DATABASE_URL
- SMSDEV_KEY
- NEXT_PUBLIC_APP_NAME

## O que fica no cliente

- interface
- estado visual
- preferências não sensíveis
- último dispositivo selecionado

## O que fica no servidor

- integração com SMS Dev
- regras de envio
- persistência operacional
- logs de execução

## Validações mínimas

### Device
- nome obrigatório
- telefone obrigatório
- telefone sanitizado

### Command
- deviceId obrigatório
- título obrigatório
- mensagem obrigatória
- cor apenas dentro da enum definida

### Execute
- deviceId obrigatório
- commandId obrigatório
- dispositivo e comando devem existir
- comando deve pertencer ao dispositivo

## Medidas recomendadas pós-MVP

- autenticação com NextAuth ou auth provider equivalente
- rate limit por rota crítica
- auditoria por usuário
- confirmação dupla para comandos críticos
- webhooks de status, se o provedor suportar bem esse fluxo futuramente
