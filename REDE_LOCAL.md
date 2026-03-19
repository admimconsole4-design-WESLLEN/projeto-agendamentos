# Como Acessar o Sistema na Rede Local

## Configuração Atual

O sistema está configurado para acessar na rede local usando o IP `192.168.0.12`.

## Passo a Passo

### 1. Verificar seu IP na rede

**Windows:**
```cmd
ipconfig
```
Procure por "IPv4 Address" (ex: 192.168.0.12)

**Linux/Mac:**
```bash
ifconfig ou ip addr
```

### 2. Atualizar o arquivo .env

```env
VITE_API_URL=http://SEU_IP:3001
```

Substitua `SEU_IP` pelo seu IP real (ex: `192.168.0.12`)

### 3. Reiniciar o servidor

```bash
# Pare o servidor atual (Ctrl+C)
# E reinicie
npm run server
```

### 4. Acessar de outros dispositivos

**Do celular ou outro computador na mesma rede:**

```
Frontend: http://SEU_IP:8080
API: http://SEU_IP:3001
```

## Solução de Problemas

### Firewall bloqueando conexões

**Windows:**
1. Vá em "Firewall do Windows Defender"
2. Clique em "Permitir um aplicativo pelo Firewall"
3. Encontre "Node.js" e marque as caixas "Particular" e "Público"

**Linux:**
```bash
sudo ufw allow 3001
sudo ufw allow 8080
```

### Erro "Failed to Fetch"

1. Verifique se o servidor está rodando: `npm run server`
2. Verifique se o IP está correto no `.env`
3. Certifique-se de que todos os dispositivos estão na mesma rede
4. Desabilite VPN se estiver ativa

### IP muda frequentemente?

Configure um IP estático no roteador ou use DNS dinâmico (ex: no-ip.org)

## Deploy em Servidor Local

Para instalar em um servidor permanente:

1. **Copie toda a pasta do projeto**
2. **Instale as dependências:** `npm install`
3. **Rode o seed:** `npm run db:seed`
4. **Build:** `npm run build`
5. **Inicie o servidor:** `npm run server`

### Como serviço do Windows (opcional)

Use o PM2 para manter o servidor rodando:

```bash
npm install -g pm2
pm2 start "npm run server" --name agendamento
pm2 save
pm2 startup
```

### Acesso externo (fora da rede local)

Para acessar de fora da rede, você precisa:

1. **Redirecionar porta no roteador:**
   - Porta externa: 3001 → Porta interna: 3001
   - Porta externa: 8080 → Porta interna: 8080

2. **Usar IP público ou DNS dinâmico**

3. **Considerar segurança:**
   - Usar HTTPS
   - Adicionar autenticação
   - Usar VPN

## Dicas

- Para testes locais, use o IP da rede (192.168.x.x)
- Para produção, considere usar um domínio próprio
- Mantenha o backup do arquivo `prisma/dev.db` regularmente
- Documente o IP usado para facilitar o acesso futuro
