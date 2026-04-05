# 06 - PWA e Deploy na Vercel

## Objetivo

Permitir que a aplicação seja instalada no dispositivo via navegador.

## Itens mínimos de PWA

- manifest
- ícones
- nome curto
- tema
- standalone display
- service worker
- fallback mínimo para assets estáticos

## Comportamento esperado

- abrir como app instalado
- manter navegação fluida
- funcionar bem em mobile
- preservar experiência mesmo com oscilação leve de rede na camada visual

## Observação importante

O envio de SMS depende de conexão com internet e backend disponível. O PWA não torna o envio offline.

## Deploy na Vercel

### Requisitos
- projeto Next.js configurado
- variáveis de ambiente definidas
- banco acessível pelo deploy

### Variáveis esperadas
- DATABASE_URL
- SMSDEV_KEY
- NEXT_PUBLIC_APP_NAME

## Estratégia recomendada

- ambiente de preview para validar cada parte
- produção apenas após validar envio real
- logs básicos habilitados
