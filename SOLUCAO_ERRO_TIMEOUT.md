# 🔧 Solução para Erro de Timeout (ERR_CONNECTION_TIMED_OUT)

## 📋 Problema

O navegador está mostrando erros de timeout ao tentar acessar as APIs:
```
192.168.0.12:3001/api/equipments - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
192.168.0.12:3001/api/reservations - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
192.168.0.12:3001/api/periods - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
```

## ✅ Diagnóstico

O servidor está funcionando corretamente:
- ✅ Servidor rodando em `0.0.0.0:3001` (todas as interfaces)
- ✅ APIs respondem corretamente em `localhost:3001`
- ✅ Dados estão sendo salvos e recuperados corretamente

## 🔍 Causa Provável

O **Firewall do Windows** pode estar bloqueando conexões externas na porta3001.

## 🛠️ Soluções

### Solução 1: Usar Localhost (RECOMENDADO)

Altere a URL no [`.env`](.env) para usar localhost:

```env
# Antes
VITE_API_URL=http://192.168.0.12:3001

# Depois
VITE_API_URL=http://localhost:3001
```

**Passos:**
1. Pare o servidor (Ctrl+C no terminal)
2. Edite o arquivo [`.env`](.env)
3. Mude `VITE_API_URL=http://192.168.0.12:3001` para `VITE_API_URL=http://localhost:3001`
4. Salve o arquivo
5. Execute `npm run build` para recompilar o frontend
6. Inicie o servidor novamente: `npm run server`
7. Acesse `http://localhost:3001` no navegador

### Solução 2: Configurar o Firewall

Se você PRECISA acessar de outros dispositivos na rede:

#### Windows Firewall

1. **Abra o Windows Firewall**:
   - Pressione `Win + R`
   - Digite `firewall.cpl` e pressione Enter

2. **Crie uma nova regra**:
   - Clique em "Regras de Entrada" → "Nova Regra"
   - Selecione "Porta" → Avançar
   - Selecione "TCP" → Digite `3001` → Avançar
   - Selecione "Permitir a conexão" → Avançar
   - Marque todas as opções (Domínio, Particular, Público) → Avançar
   - Dê um nome (ex: "Node.js Server Port 3001") → Concluir

3. **Reinicie o servidor**

### Solução 3: Desabilitar Temporariamente o Firewall (NÃO RECOMENDADO)

⚠️ **ATENÇÃO**: Isso deixa seu computador vulnerável!

1. Abra o Windows Firewall
2. Clique em "Ativar ou desativar o Firewall do Windows Defender"
3. Desative temporariamente
4. Teste a aplicação
5. **Reative o firewall imediatamente após o teste!**

## 🧪 Teste de Conexão

Para verificar se o servidor está respondendo:

```bash
# Testar localhost
curl http://localhost:3001/api/equipments

# Testar IP da rede
curl http://192.168.0.12:3001/api/equipments
```

## 📝 Verificação Atual

O servidor está configurado corretamente:
- ✅ Escutando em `0.0.0.0:3001` (todas as interfaces)
- ✅ APIs funcionando em `localhost:3001`
- ✅ Dados persistindo corretamente
- ⚠️ Firewall pode estar bloqueando acesso externo

## 🚀 Recomendação

**Use a Solução 1 (localhost)** para desenvolvimento local. É mais simples e evita problemas de firewall.

Se você precisa acessar de outros dispositivos na rede, use a **Solução 2** para configurar o firewall corretamente.

---

**Status do Servidor**: ✅ Rodando e funcionando
**Status das APIs**: ✅ Respondendo corretamente
**Problema**: ⚠️ Firewall bloqueando acesso externo
