# Debug de Conexão com Banco de Dados

## Problema Identificado
Erro "failed to fetch" ao carregar períodos, equipamentos e agendamentos.

## Soluções Aplicadas

### 1. CORRIGIDO: Configuração de CORS
**Problema:** O frontend estava rodando na porta 8081, mas o servidor só aceitava requisições da porta 5173.

**Solução:** Adicionei as portas 8080 e 8081 à lista de origens permitidas no CORS, além dos IPs locais (192.168.0.19 e 192.168.0.12).

**Arquivo modificado:** `server.ts`

### 2. VERIFICADO: Configuração do Banco de Dados
- Arquivo `.env`: `DATABASE_URL="file:./prisma/dev.db"`
- Arquivo `prisma/schema.prisma`: `url = "file:./dev.db"`
- Banco de dados existe em `prisma/dev.db` (57.344 bytes)
- Servidor backend conecta-se ao banco com sucesso

## Como Testar

### 1. Verificar se os servidores estão rodando
```bash
# Terminal 1 - Backend (porta 3001)
npm run server

# Terminal 2 - Frontend (porta 8081)
npm run dev
```

### 2. Verificar URLs de acesso
- Frontend: http://localhost:8081 ou http://192.168.0.19:8081
- Backend API: http://localhost:3001 ou http://192.168.0.19:3001

### 3. Testar a API diretamente
Abra o navegador e acesse:
- http://localhost:3001/api/equipments
- http://localhost:3001/api/periods
- http://localhost:3001/api/lessons

Se essas URLs retornarem dados JSON, o backend está funcionando corretamente.

### 4. Verificar console do navegador
Pressione F12 no navegador e verifique:
- Aba "Network": Veja se as requisições para `/api/*` estão falhando
- Aba "Console": Veja se há mensagens de erro

## Possíveis Problemas Restantes

### Problema 1: URL da API Incorreta
Se o frontend não conseguir se conectar, verifique se a URL da API está correta.

**Solução:** O arquivo `src/lib/api.ts` detecta automaticamente a URL baseada na origem. Se estiver acessando via `localhost:8081`, ele usará `http://localhost:3001` para a API.

### Problema 2: Firewall Bloqueando Conexões
Se estiver acessando de outra máquina na rede, verifique se o firewall não está bloqueando as portas 3001 e 8081.

**Solução:** Adicione exceções no firewall para essas portas.

### Problema 3: Múltiplas Instâncias do Servidor
Se houver múltiplas instâncias do Node.js rodando, pode haver conflitos de porta.

**Solução:** Mate todos os processos node.exe e reinicie os servidores:
```bash
taskkill /F /IM node.exe
npm run server
npm run dev
```

## Próximos Passos

1. Abra o navegador em http://localhost:8081
2. Verifique se os períodos, equipamentos e agendamentos estão carregando
3. Se ainda houver erro, copie a mensagem exata do console do navegador (F12)
4. Verifique a aba "Network" para ver qual requisição está falhando
5. Anote o status code (ex: 404, 500, CORS error)

## Comandos Úteis

```bash
# Verificar se o servidor backend está rodando
curl http://localhost:3001/api/equipments

# Verificar logs do servidor
# (Veja o terminal onde rodou `npm run server`)

# Reiniciar tudo
taskkill /F /IM node.exe
npm run server
npm run dev
```
