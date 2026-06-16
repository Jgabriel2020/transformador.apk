# Workflows n8n

## 1. Webhook: Converter URL → APK  (`/webhook/convert-apk`)

**Nós do workflow:**
1. **Webhook** (POST) → recebe `{ url, appName, packageName }`
2. **HTTP Request** → chama a API do PWABuilder:
   - URL: `https://pwabuilder-api.azurewebsites.net/generatezip`
   - Method: POST
   - Body: `{ "siteUrl": "{{ $json.url }}", "platform": "android" }`
3. **Set** → extrai `downloadUrl` da resposta
4. **Respond to Webhook** → retorna `{ jobId, downloadUrl }`

### Alternativa (Bubblewrap CLI no servidor)
Se preferir rodar o Bubblewrap localmente, adicione um nó **Execute Command**:
```bash
npx @bubblewrap/cli init --manifest={{ $json.url }}/manifest.json --directory=/tmp/{{ $json.packageName }}
npx @bubblewrap/cli build --directory=/tmp/{{ $json.packageName }}
```
E um nó **Read Binary File** para ler o APK gerado.

---

## 2. Webhook: Analisar repositório  (`/webhook/analyze-apk`)

**Nós do workflow:**
1. **Webhook** (POST) → recebe `{ repoUrl }`
2. **HTTP Request** → GitHub API para buscar arquivos chave:
   - `https://api.github.com/repos/{owner}/{repo}/contents/app/src/main/AndroidManifest.xml`
   - `https://api.github.com/repos/{owner}/{repo}/contents/app/build.gradle`
3. **Code** → decodifica base64 do conteúdo dos arquivos
4. **Set** → monta `{ content: "AndroidManifest:\n...\nbuild.gradle:\n..." }`
5. **Respond to Webhook** → retorna o content para o Next.js processar com Gemini
