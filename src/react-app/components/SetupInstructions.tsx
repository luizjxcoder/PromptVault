import { useState } from 'react';
import { Copy, Check, ExternalLink, FileText, Settings } from 'lucide-react';

export default function SetupInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const appsScriptCode = `// PromptVault - Google Apps Script Webhook
// IMPORTANTE: NÃO execute doPost() manualmente! Execute 'test()' primeiro!

function doPost(e) {
  try {
    // Esta função SÓ funciona quando chamada via webhook POST
    // Para testar, use a função test() ou testWebhook()
    
    if (!e || !e.postData || !e.postData.contents) {
      console.error('❌ doPost: Requisição POST inválida ou vazia');
      console.log('💡 DICA: Se você está executando manualmente, use a função test() ao invés desta!');
      return ContentService
        .createTextOutput(JSON.stringify({ 
          error: 'Esta função só funciona via webhook POST. Para testar manualmente, execute a função test().' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    console.log('📩 doPost: Recebendo dados via webhook...');
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addPrompts' && data.prompts) {
      console.log(\`📊 doPost: Processando \${data.prompts.length} prompts\`);
      return addPromptsToSheet(data.prompts);
    }
    
    console.error('❌ doPost: Ação não reconhecida:', data.action);
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Ação não reconhecida: ' + (data.action || 'undefined') }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ doPost: Erro no webhook:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Erro no processamento: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addPromptsToSheet(prompts) {
  try {
    console.log('🔧 addPromptsToSheet: Iniciando...');
    
    // CONFIGURE AQUI: ID da sua planilha (substitua pela sua)
    const SPREADSHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';
    
    if (SPREADSHEET_ID === 'SEU_ID_DA_PLANILHA_AQUI') {
      throw new Error('❌ ERRO: Você precisa substituir SEU_ID_DA_PLANILHA_AQUI pelo ID real da sua planilha!');
    }
    
    console.log('📋 Abrindo planilha:', SPREADSHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('PromptVault');
    
    if (!sheet) {
      console.log('📄 Criando nova aba PromptVault...');
      sheet = spreadsheet.insertSheet('PromptVault');
      
      const headers = [
        'ID', 'Título', 'Categoria', 'Modelo IA', 'Texto do Prompt',
        'Prioridade', 'Status', 'Caso de Uso', 'Data Limite', 'Tags',
        'Criado em', 'Atualizado em'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#4c1d95')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      console.log('✅ Cabeçalhos criados com sucesso!');
    }
    
    console.log(\`📝 Preparando \${prompts.length} linhas de dados...\`);
    const rows = prompts.map(prompt => [
      prompt.id, prompt.title, prompt.category, prompt.ai_model || '',
      prompt.prompt_text, prompt.priority, prompt.status, prompt.use_case || '',
      prompt.deadline_date || '', prompt.tags || '', prompt.created_at, prompt.updated_at
    ]);
    
    if (rows.length > 0) {
      const lastRow = sheet.getLastRow();
      console.log(\`📊 Inserindo dados na linha \${lastRow + 1}...\`);
      sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
      console.log('✅ Dados inseridos com sucesso!');
    }
    
    const successMessage = \`✅ \${prompts.length} prompts adicionados com sucesso ao Google Sheets!\`;
    console.log(successMessage);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: successMessage,
        addedCount: prompts.length 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ addPromptsToSheet: Erro:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Erro ao processar planilha: ' + error.toString(),
        help: 'Verifique se o ID da planilha está correto e se você tem permissões de escrita.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 🧪 EXECUTE ESTA FUNÇÃO PRIMEIRO! (para testar e autorizar)
function test() {
  console.log('🧪 === TESTE MANUAL PROMPTVAULT ===');
  console.log('📋 Este teste vai criar um prompt de exemplo na sua planilha');
  
  try {
    const testPrompts = [{
      id: 999,
      title: '🧪 Teste PromptVault',
      category: 'teste',
      ai_model: 'GPT-4',
      prompt_text: 'Este é um prompt de teste criado pelo Google Apps Script. Se você está vendo isso, a integração está funcionando! 🎉',
      priority: 'medium',
      status: 'testing',
      use_case: 'Teste de Integração',
      deadline_date: '',
      tags: 'teste, apps-script, integracao',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
    
    console.log('🔄 Executando addPromptsToSheet...');
    const result = addPromptsToSheet(testPrompts);
    
    console.log('🎉 === TESTE CONCLUÍDO COM SUCESSO! ===');
    console.log('✅ Verifique sua planilha - deve ter uma nova linha com o prompt de teste');
    console.log('✅ Agora você pode publicar como Web App e usar no PromptVault!');
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.log('💡 Verifique se você substituiu SEU_ID_DA_PLANILHA_AQUI pelo ID real da sua planilha');
    throw error;
  }
}

// 🔌 Simula uma requisição POST real (para testes avançados)
function testWebhook() {
  console.log('🔌 === TESTE DO WEBHOOK ===');
  console.log('📡 Simulando uma requisição POST do PromptVault...');
  
  try {
    const mockEvent = {
      postData: {
        contents: JSON.stringify({
          action: 'addPrompts',
          prompts: [{
            id: 888,
            title: '🔌 Teste do Webhook',
            category: 'webhook-test',
            ai_model: 'GPT-4',
            prompt_text: 'Este prompt foi criado via teste de webhook! Se você vê isso, o webhook está funcionando perfeitamente.',
            priority: 'high',
            status: 'testing',
            use_case: 'Teste de Webhook POST',
            deadline_date: '',
            tags: 'webhook, teste, post, integracao',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]
        })
      }
    };
    
    console.log('🚀 Chamando doPost com dados simulados...');
    const result = doPost(mockEvent);
    
    console.log('🎉 === TESTE DE WEBHOOK CONCLUÍDO ===');
    console.log('✅ Se não houve erros, o webhook está funcionando!');
    console.log('📋 Verifique sua planilha para confirmar');
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro no teste de webhook:', error);
    throw error;
  }
}

// 📋 Função para limpar dados de teste (opcional)
function clearTestData() {
  console.log('🧹 === LIMPANDO DADOS DE TESTE ===');
  
  try {
    const SPREADSHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';
    
    if (SPREADSHEET_ID === 'SEU_ID_DA_PLANILHA_AQUI') {
      throw new Error('Configure o ID da planilha primeiro!');
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('PromptVault');
    
    if (!sheet) {
      console.log('❌ Aba PromptVault não encontrada');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    let deletedRows = 0;
    
    // Remove linhas de teste (de trás para frente para não afetar índices)
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const title = row[1]; // Coluna do título
      
      if (title && (title.includes('🧪 Teste') || title.includes('🔌 Teste'))) {
        sheet.deleteRow(i + 1);
        deletedRows++;
      }
    }
    
    console.log(\`🧹 \${deletedRows} linhas de teste removidas\`);
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados de teste:', error);
  }
}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  if (!showInstructions) {
    return (
      <button
        onClick={() => setShowInstructions(true)}
        className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-200 text-sm font-medium"
      >
        <Settings className="w-4 h-4" />
        <span>Ver instruções de configuração</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md border-2 border-purple-500 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Configuração Google Apps Script</h2>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-white">
          {/* Why Apps Script */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-200 mb-2">🚀 Por que Apps Script é melhor?</h3>
            <ul className="space-y-1 text-green-100 text-sm">
              <li>✅ <strong>Mais simples:</strong> Sem necessidade de APIs ou chaves complexas</li>
              <li>✅ <strong>Integração nativa:</strong> Acesso direto ao Google Sheets</li>
              <li>✅ <strong>Gratuito:</strong> Não há cobrança por uso</li>
              <li>✅ <strong>Mais seguro:</strong> Executa no ambiente do Google</li>
            </ul>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <h3 className="text-lg font-semibold">Criar Projeto Apps Script</h3>
              </div>
              <ol className="space-y-2 text-purple-200 ml-8">
                <li>• Acesse: <a href="https://script.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1">
                  <span>script.google.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a></li>
                <li>• Clique em "Novo projeto"</li>
                <li>• Renomeie para "PromptVault Webhook"</li>
              </ol>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <h3 className="text-lg font-semibold">Código do Apps Script</h3>
              </div>
              <p className="text-purple-200 mb-3 ml-8">Cole este código no editor do Apps Script:</p>
              <div className="relative ml-8">
                <pre className="bg-black/40 border border-purple-400/30 rounded-lg p-4 text-sm overflow-x-auto max-h-60">
                  <code className="text-green-300">{appsScriptCode}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(appsScriptCode)}
                  className="absolute top-2 right-2 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-lg font-semibold">Configurar Planilha</h3>
              </div>
              <ol className="space-y-2 text-purple-200 ml-8">
                <li>• Crie uma nova planilha no Google Sheets</li>
                <li>• Copie o ID da URL: <code className="bg-black/30 px-2 py-1 rounded text-green-300">docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit</code></li>
                <li>• No código Apps Script, substitua <code className="bg-black/30 px-2 py-1 rounded text-yellow-300">SEU_ID_DA_PLANILHA_AQUI</code> pelo ID real</li>
              </ol>
            </div>

            {/* Step 4 - Test First */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <h3 className="text-lg font-semibold">🧪 Testar o Script (IMPORTANTE!)</h3>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 ml-8">
                <p className="text-red-200 text-sm font-medium">
                  ⚠️ <strong>NUNCA execute doPost() manualmente!</strong> Essa função só funciona via webhook.
                </p>
              </div>
              <ol className="space-y-2 text-blue-200 ml-8">
                <li>• <strong>Salve o projeto</strong> (Ctrl+S)</li>
                <li>• Na lista de funções, selecione <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300">test</code> (não doPost!)</li>
                <li>• Clique no botão "Executar" (▶️)</li>
                <li>• <strong>Autorize o script</strong> quando solicitado</li>
                <li>• Verifique se aparece "🎉 TESTE CONCLUÍDO COM SUCESSO!" nos logs</li>
                <li>• <strong>Confirme na planilha</strong> - deve aparecer uma linha de teste</li>
              </ol>
            </div>

            {/* Step 5 */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                <h3 className="text-lg font-semibold">Publicar como Web App</h3>
              </div>
              <ol className="space-y-2 text-purple-200 ml-8">
                <li>• No Apps Script: "Implementar" → "Nova implementação"</li>
                <li>• Tipo: "Aplicativo da Web"</li>
                <li>• Executar como: "Eu"</li>
                <li>• Acesso: "Qualquer pessoa"</li>
                <li>• Clique "Implementar" e <strong>copie a URL do webhook</strong></li>
              </ol>
            </div>

            {/* Step 6 */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">6</span>
                <h3 className="text-lg font-semibold">Configurar no PromptVault</h3>
              </div>
              <ol className="space-y-2 text-purple-200 ml-8">
                <li>• Abra o arquivo <code className="bg-black/30 px-2 py-1 rounded text-green-300">.env.local</code></li>
                <li>• Configure: <code className="bg-black/30 px-2 py-1 rounded text-yellow-300">GOOGLE_APPS_SCRIPT_WEBHOOK_URL=sua_url_aqui</code></li>
                <li>• Reinicie o servidor: <code className="bg-black/30 px-2 py-1 rounded text-blue-300">npm run dev</code></li>
              </ol>
            </div>
          </div>

          {/* Success */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-200 mb-2">🎉 Pronto!</h3>
            <p className="text-blue-100 text-sm">
              Agora você pode criar prompts e clicar em "Sheets" para exportar automaticamente para sua planilha do Google!
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-purple-500/30">
            <button
              onClick={() => setShowInstructions(false)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              Entendi!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
