# 🌐 Como Acessar o Sistema de Fora do Notebook

## 📋 Informações Importantes

**Porta do Servidor:** `3001` (NÃO é 8080!)
**Endereço de Escuta:** `0.0.0.0` (todas as interfaces de rede)

## 🔍 Encontrar o IP Correto do Seu Computador

### Windows

1. **Abra o Prompt de Comando** (cmd)
2. **Digite:** `ipconfig`
3. **Procure por:** "IPv4 Address" em "Adaptador Ethernet" ou "Wi-Fi"

Exemplo:
```
Adaptador Ethernet Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.0.19
```

**Anote o IP Address** - este é o endereço que você deve usar!

## 🚀 Como Acessar de Outros Dispositivos

### Passo 1: Verificar se o Servidor Está Rodando

O servidor deve estar rodando e mostrar:
```
🚀 Servidor rodando em http://localhost:3001
🌐 Acessível na rede em http://192.168.0.19:3001
```

### Passo 2: Acessar pelo IP Correto

**Se o seu IP é 192.168.0.19, acesse:**
```
http://192.168.0.19:3001
```

**NÃO use:**
- ❌ `http://192.168.0.19:8080` (porta errada!)
- ❌ `http://192.168.0.12:3001` (IP pode ter mudado!)

### Passo 3: Configurar o Firewall do Windows

Se ainda não conseguir acessar, configure o firewall:

#### Opção 1: Permitir a Porta 3001

1. **Pressione** `Win + R`
2. **Digite:** `firewall.cpl` e pressione Enter
3. **Clique em:** "Regras de Entrada" → "Nova Regra"
4. **Selecione:** "Porta" → Avançar
5. **Selecione:** "TCP" → Digite `3001` → Avançar
6. **Selecione:** "Permitir a conexão" → Avançar
7. **Marque:** "Domínio", "Particular", "Público" → Avançar
8. **Nome:** "Node.js Server Port 3001" → Concluir

#### Opção 2: Desabilitar Firewall Temporariamente (NÃO RECOMENDADO)

⚠️ **ATENÇÃO:** Isso deixa seu computador vulnerável!

1. Abra o Windows Firewall
2. Clique em "Ativar ou desativar o Firewall do Windows Defender"
3. Desative temporariamente
4. Teste o acesso
5. **Reative imediatamente após o teste!**

## 🧪 Testar Conexão

### Testar do Próprio Computador

Abra o navegador e acesse:
```
http://localhost:3001
```

### Testar de Outro Dispositivo na Mesma Rede

1. **Conecte** o dispositivo à mesma rede Wi-Fi
2. **Abra** o navegador
3. **Acesse:** `http://SEU_IP:3001`
   - Substitua `SEU_IP` pelo IP encontrado no passo anterior

Exemplo: `http://192.168.0.19:3001`

## ⚠️ Problemas Comuns

### Problema 1: "Não consigo acessar de fora"

**Soluções:**
- ✅ Verifique se está usando a porta **3001** (não 8080!)
- ✅ Verifique se está usando o IP **correto** (pode ter mudado)
- ✅ Configure o firewall para permitir a porta 3001
- ✅ Certifique-se de que ambos os dispositivos estão na **mesma rede**

### Problema 2: "IP mudou"

**Solução:**
- Abra o cmd novamente
- Digite `ipconfig`
- Use o novo IP

### Problema 3: "Firewall bloqueando"

**Solução:**
- Siga as instruções acima para configurar o firewall
- Ou use `localhost:3001` apenas no computador local

## 📱 Acessar do Celular

1. **Conecte** o celular à mesma rede Wi-Fi
2. **Abra** o navegador do celular
3. **Digite:** `http://SEU_IP:3001`
   - Exemplo: `http://192.168.0.19:3001`

## 🎯 Resumo

| Acesso | URL |
|--------|-----|
| **Local** (no próprio notebook) | `http://localhost:3001` |
| **Rede** (outros dispositivos) | `http://SEU_IP:3001` |
| **Exemplo** | `http://192.168.0.19:3001` |

## ⚠️ Importante

- **Porta correta:** 3001
- **Protocolo:** http (não https)
- **Mesma rede:** Dispositivos devem estar na mesma rede Wi-Fi
- **Firewall:** Pode precisar configurar para permitir conexões externas

---

**Se ainda não conseguir acessar, verifique:**
1. ✅ Servidor está rodando?
2. ✅ Porta correta (3001)?
3. ✅ IP correto?
4. ✅ Mesma rede?
5. ✅ Firewall configurado?
