# 03 - Contrato Inicial de API

## Padrão

- respostas em JSON
- validação com Zod
- mensagens de erro claras
- status HTTP corretos

## Rotas

### GET /api/devices
Lista dispositivos.

Resposta:
```json
{
  "data": [
    {
      "id": "dev_1",
      "name": "Portão",
      "phone": "5584999999999",
      "description": "Controlador do portão"
    }
  ]
}
```

### POST /api/devices
Cria dispositivo.

Body:
```json
{
  "name": "Portão",
  "phone": "5584999999999",
  "description": "Controlador do portão"
}
```

### PATCH /api/devices/:id
Atualiza dispositivo.

### DELETE /api/devices/:id
Remove dispositivo.

### GET /api/commands?deviceId=xxx
Lista comandos do dispositivo.

### POST /api/commands
Cria comando.

Body:
```json
{
  "deviceId": "dev_1",
  "title": "Ligar",
  "message": "ON123",
  "color": "green"
}
```

### PATCH /api/commands/:id
Atualiza comando.

### DELETE /api/commands/:id
Remove comando.

### POST /api/execute
Executa comando.

Body:
```json
{
  "deviceId": "dev_1",
  "commandId": "cmd_1"
}
```

Resposta de sucesso:
```json
{
  "success": true,
  "executionId": "exec_1",
  "provider": "smsdev",
  "providerMessageId": "123456"
}
```

Resposta de erro:
```json
{
  "success": false,
  "message": "Falha ao enviar SMS"
}
```

### GET /api/history?deviceId=xxx
Lista histórico de execuções.
