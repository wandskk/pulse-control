# 02 - Modelo de Dados

## Visão geral

O domínio gira em torno de três núcleos:
- dispositivos/números
- comandos
- execuções

## Entidades

### Device
Representa o número/dispositivo que receberá o comando via SMS.

Campos sugeridos:
- id
- name
- phone
- description
- isActive
- createdAt
- updatedAt

### Command
Representa um botão configurado pelo usuário.

Campos sugeridos:
- id
- deviceId
- title
- message
- color
- sortOrder
- isActive
- createdAt
- updatedAt

### Execution
Representa um envio/acionamento realizado.

Campos sugeridos:
- id
- deviceId
- commandId
- phone
- message
- provider
- providerMessageId
- status
- errorMessage
- createdAt

## Relacionamentos

- um Device possui vários Commands
- um Device possui várias Executions
- um Command possui várias Executions

## Enum sugerida para cores

- blue
- green
- red
- yellow
- violet
- slate

## Enum sugerida para status de execução

- pending
- success
- failed

## Exemplo Prisma

```prisma
model Device {
  id          String      @id @default(cuid())
  name        String
  phone       String
  description String?
  isActive    Boolean     @default(true)
  commands    Command[]
  executions  Execution[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Command {
  id        String      @id @default(cuid())
  deviceId  String
  title     String
  message   String
  color     String
  sortOrder Int         @default(0)
  isActive  Boolean     @default(true)
  device    Device      @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  executions Execution[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model Execution {
  id                String   @id @default(cuid())
  deviceId          String
  commandId         String
  phone             String
  message           String
  provider          String
  providerMessageId String?
  status            String
  errorMessage      String?
  device            Device   @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  command           Command  @relation(fields: [commandId], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())
}
```
