# 🚀 Configuração Google Apps Script para PromptVault

## Por que Apps Script é melhor?
- ✅ **Mais simples**: Sem necessidade de APIs ou chaves complexas
- ✅ **Integração nativa**: Acesso direto ao Google Sheets
- ✅ **Gratuito**: Não há cobrança por uso
- ✅ **Mais seguro**: Executa no ambiente do Google

## 📋 Passo a Passo

### 1. Criar o Projeto Apps Script

1. Acesse: https://script.google.com/
2. Clique em "Novo projeto"
3. Renomeie para "PromptVault Webhook"

### 2. Código do Apps Script

Cole o código abaixo no editor do Apps Script:

```javascript
// PromptVault - Google Apps Script Webhook
// Este script recebe prompts do seu app e adiciona ao Google Sheets

function doPost(e) {
  try {
    // Validar se a requisição POST existe e tem dados
    if (!e || !e.postData || !e.postData.contents) {
      console.error('Requisição POST inválida ou vazia');
      return ContentService
        .createTextOutput(JSON.stringify({ 
          error: 'Requisição POST inválida. Certifique-se de que está enviando dados via POST.' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Parse dos dados recebidos
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addPrompts' && data.prompts) {
      return addPromptsToSheet(data.prompts);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Ação não reconhecida' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Erro no webhook:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Erro no processamento: ' + error.toString(),
        details: 'Verifique se os dados estão sendo enviados corretamente via POST'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addPromptsToSheet(prompts) {
  try {
    // CONFIGURE AQUI: ID da sua planilha
    const SPREADSHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';
    
    // Abrir a planilha
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('PromptVault');
    
    // Criar aba se não existir
    if (!sheet) {
      sheet = spreadsheet.insertSheet('PromptVault');
      
      // Adicionar cabeçalhos
      const headers = [
        'ID', 'Título', 'Categoria', 'Modelo IA', 'Texto do Prompt',
        'Prioridade', 'Status', 'Caso de Uso', 'Data Limite', 'Tags',
        'Criado em', 'Atualizado em'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Formatar cabeçalhos
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#4c1d95')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
    
    // Preparar dados para inserir
    const rows = prompts.map(prompt => [
      prompt.id,
      prompt.title,
      prompt.category,
      prompt.ai_model,
      prompt.prompt_text,
      prompt.priority,
      prompt.status,
      prompt.use_case,
      prompt.deadline_date,
      prompt.tags,
      prompt.created_at,
      prompt.updated_at
    ]);
    
    // Inserir dados
    if (rows.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
      
      // Formatar dados inseridos
      const dataRange = sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length);
      dataRange.setBorder(true, true, true, true, true, true);
      
      // Colorir linhas alternadas
      for (let i = 0; i < rows.length; i++) {
        if ((lastRow + i) % 2 === 0) {
          sheet.getRange(lastRow + 1 + i, 1, 1, rows[0].length)
            .setBackground('#f8fafc');
        }
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: `${prompts.length} prompts adicionados com sucesso`,
        addedCount: prompts.length 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Erro ao adicionar prompts:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função para testar manualmente (opcional)
function test() {
  console.log('=== TESTE MANUAL DO PROMPTVAULT ===');
  
  const testData = {
    action: 'addPrompts',
    prompts: [{
      id: 999,
      title: 'Teste de Prompt',
      category: 'teste',
      ai_model: 'GPT-4',
      prompt_text: 'Este é um prompt de teste',
      priority: 'medium',
      status: 'testing',
      use_case: 'Teste',
      deadline_date: '',
      tags: 'teste, apps-script',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]
  };
  
  console.log('Testando addPromptsToSheet...');
  const result = addPromptsToSheet(testData.prompts);
  console.log('Resultado:', result);
  
  return result;
}

// Função para simular uma requisição POST (para testes)
function testWebhook() {
  console.log('=== TESTE DO WEBHOOK ===');
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'addPrompts',
        prompts: [{
          id: 888,
          title: 'Teste do Webhook',
          category: 'webhook-test',
          ai_model: 'GPT-4',
          prompt_text: 'Este é um teste do webhook',
          priority: 'high',
          status: 'testing',
          use_case: 'Teste de Webhook',
          deadline_date: '',
          tags: 'webhook, teste',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      })
    }
  };
  
  console.log('Testando doPost...');
  const result = doPost(mockEvent);
  console.log('Resultado:', result);
  
  return result;
}
```

### 3. Configurar a Planilha

1. **Criar planilha**: Acesse Google Sheets e crie uma nova planilha
2. **Copiar ID**: Na URL da planilha, copie o ID:
   ```
   https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit
   ```
3. **Substituir no código**: No Apps Script, substitua `SEU_ID_DA_PLANILHA_AQUI` pelo ID real

### 4. Publicar como Web App

1. No Apps Script, clique em "Implementar" > "Nova implementação"
2. Escolha o tipo: "Aplicativo da Web"
3. Configurações:
   - **Executar como**: Eu (seu email)
   - **Quem tem acesso**: Qualquer pessoa
4. Clique em "Implementar"
5. **Copie a URL do webhook** gerada

### 5. Configurar no PromptVault

1. Abra o arquivo `.env.local` do seu projeto
2. Substitua a URL:
   ```
   GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/SEU_ID/exec
   ```
3. Reinicie o servidor: `npm run dev`

## ✅ Testar

1. No PromptVault, crie alguns prompts
2. Clique no botão "Sheets"
3. Verifique se os dados aparecem na planilha do Google Sheets

## 🎨 Personalização

Você pode personalizar o código Apps Script para:
- Mudar cores e formatação
- Adicionar validações
- Criar gráficos automáticos
- Enviar notificações por email
- Integrar com outras ferramentas do Google Workspace

## 🔧 Problemas Comuns

**Erro de permissão**: Autorize o script na primeira execução
**Dados não aparecem**: Verifique se o ID da planilha está correto
**Erro 403**: Verifique se a planilha tem permissões adequadas

## 🧪 Testar o Script

**⚠️ IMPORTANTE: NUNCA execute a função `doPost()` manualmente! Ela só funciona via webhook.**

Após colar o código no Apps Script:

1. **Salve o projeto** (Ctrl+S)
2. **Configure o ID da planilha** no código (substitua `SEU_ID_DA_PLANILHA_AQUI`)
3. **Execute a função de teste**:
   - Na barra superior, selecione `test` na lista de funções (NÃO doPost!)
   - Clique no botão "Executar" (▶️)
   - Autorize o script quando solicitado
4. **Verifique os logs**:
   - Clique em "Registro de execução" 
   - Deve aparecer "🎉 TESTE CONCLUÍDO COM SUCESSO!"
5. **Confirme na planilha**:
   - Abra sua planilha do Google Sheets
   - Deve ter uma linha com "🧪 Teste PromptVault"

## 🔧 Problemas Comuns e Soluções

**❌ Erro: "Cannot read properties of undefined"**
- **Solução**: Execute primeiro a função `test()` para validar o script
- Certifique-se de ter substituído `SEU_ID_DA_PLANILHA_AQUI`

**❌ Erro: "Range not found"** 
- **Solução**: Verifique se o ID da planilha está correto
- A planilha precisa existir e estar acessível

**❌ Erro de permissão**
- **Solução**: Execute `test()` primeiro para autorizar o script
- Aceite todas as permissões solicitadas

**❌ Webhook não funciona**
- **Solução**: Certifique-se de que publicou como "Aplicativo da Web"
- Configuração: "Executar como: Eu" e "Acesso: Qualquer pessoa"

## 📱 Vantagens desta Solução

- **Setup em 5 minutos** vs horas configurando APIs
- **Zero configuração de autenticação**
- **Funciona em qualquer lugar** (desenvolvimento e produção)
- **Totalmente customizável** com JavaScript
- **Integração nativa** com todo o Google Workspace
