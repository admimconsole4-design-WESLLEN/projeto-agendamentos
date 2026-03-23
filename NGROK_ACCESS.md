# 🌐 Acesso Externo via Ngrok

## 📋 Configuração Realizada

O projeto foi configurado para permitir acesso externo através do túnel ngrok:
- **URL do Ngrok:** `https://nonlogistical-krishna-ontogenetical.ngrok-free.dev`

## ✅ Alterações Implementadas

### 1. Configuração do Servidor (server.ts)

Adicionada configuração específica de CORS para permitir requisições do domínio ngrok:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://nonlogistical-krishna-ontogenetical.ngrok-free.dev'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. Configuração do Vite (vite.config.ts)

Adicionada configuração para permitir host do ngrok:

```typescript
server: {
  host: "::",
  port: 8080,
  cors: true,
  allowedHosts: [
    'nonlogistical-krishna-ontogenetical.ngrok-free.dev',
    '.ngrok-free.dev'
  ]
}
```

## 🚀 Como Usar

### Passo 1: Iniciar o Servidor Backend

```bash
npm run dev:server
```

O servidor deve iniciar em `http://localhost:3001`

### Passo 2: Iniciar o Frontend (opcional)

```bash
npm run dev
```

O frontend deve iniciar em `http://localhost:8080`

### Passo 3: Acessar via Ngrok

Agora você pode acessar o projeto através da URL:
```
https://nonlogistical-krishna-ontogenetical.ngrok-free.dev
```

## 🔧 Configuração do Ngrok

Se você precisa criar um novo túnel ngrok:

1. **Instale o ngrok** (se ainda não tiver):
   - Windows: `choco install ngrok`
   - Ou baixe de https://ngrok.com/download

2. **Inicie o túnel para o servidor backend:**
   ```bash
   ngrok http 3001
   ```

3. **Copie a URL HTTPS gerada** e atualize as configurações:
   - Atualize `server.ts` com a nova URL
   - Atualize `vite.config.ts` com a nova URL

## 📱 Testando o Acesso

### Teste da API

```bash
curl https://nonlogistical-krishna-ontogenetical.ngrok-free.dev/api/equipments
```

### Teste no Navegador

Abra o navegador e acesse:
```
https://nonlogistical-krishna-ontogenetical.ngrok-free.dev/api/equipments
```

## ⚠️ Observações Importantes

1. **URL Dinâmica:** A URL do ngrok pode mudar a cada sessão. Se a URL mudar, atualize as configurações acima.

2. **Plano Gratuito:** O plano gratuito do ngrok tem limitações:
   - URL muda a cada reinicialização
   - Pode ter limites de requisições
   - Mostra página de aviso do ngrok

3. **Segurança:** Esta configuração é adequada para desenvolvimento/teste. Para produção, considere:
   - Usar domínios fixos (plano pago do ngrok)
   - Implementar autenticação
   - Usar HTTPS com certificado próprio
   - Configurar firewall adequadamente

4. **CORS:** Se encontrar problemas de CORS, verifique se:
   - O servidor está rodando
   - A URL do ngrok está correta nas configurações
   - Não há firewall bloqueando as conexões

## 🔍 Solução de Problemas

### Erro: "CORS policy blocked"

**Solução:**
- Verifique se a URL do ngrok está adicionada em `server.ts`
- Reinicie o servidor após as alterações

### Erro: "Connection refused"

**Solução:**
- Verifique se o servidor backend está rodando na porta 3001
- Verifique se o túnel ngrok está ativo

### Erro: "Host not allowed"

**Solução:**
- Verifique se o domínio ngrok está em `allowedHosts` no `vite.config.ts`
- Reinicie o servidor de desenvolvimento

## 📊 Resumo

| Componente | Porta | URL Ngrok |
|------------|-------|-----------|
| Backend | 3001 | https://nonlogistical-krishna-ontogenetical.ngrok-free.dev |
| Frontend | 8080 | Acesso via ngrok |

---

**Pronto!** O projeto agora está acessível externamente através do túnel ngrok configurado.
