import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Brain, Sparkles, AlertCircle, FileSpreadsheet } from 'lucide-react';
import PromptCard from '@/react-app/components/PromptCard';
import PromptForm from '@/react-app/components/PromptForm';
import SetupInstructions from '@/react-app/components/SetupInstructions';
import { usePrompts } from '@/react-app/hooks/usePrompts';
import type { PromptType, CreatePromptType } from '@/shared/types';

export default function Home() {
  const { prompts, isLoading, error, createPrompt, updatePrompt, deletePrompt, exportToSheets } = usePrompts();
  const [filteredPrompts, setFilteredPrompts] = useState<PromptType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToSheets, setIsExportingToSheets] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Filter prompts based on search and filters

  // Filtrar prompts
  useEffect(() => {
    let filtered = prompts;

    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(prompt => prompt.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(prompt => prompt.status === statusFilter);
    }

    setFilteredPrompts(filtered);
  }, [prompts, searchTerm, categoryFilter, statusFilter]);

  const handleCreatePrompt = async (data: CreatePromptType) => {
    try {
      setIsSubmitting(true);
      await createPrompt(data);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating prompt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPrompt = async (data: CreatePromptType) => {
    if (!editingPrompt) return;
    
    try {
      setIsSubmitting(true);
      await updatePrompt(editingPrompt.id, data);
      setEditingPrompt(null);
    } catch (err) {
      console.error('Error updating prompt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este prompt?')) {
      try {
        await deletePrompt(id);
      } catch (err) {
        console.error('Error deleting prompt:', err);
      }
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompts_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExportToSheets = async () => {
    try {
      setIsExportingToSheets(true);
      setExportMessage('');
      const result = await exportToSheets();
      
      if (result.error && result.setupInstructions) {
        setExportMessage(result.error + ' ' + result.setupInstructions);
      } else {
        setExportMessage(result.message);
      }
      
      setTimeout(() => setExportMessage(''), 8000); // Clear message after 8 seconds
    } catch (err) {
      console.error('Error exporting to Google Sheets:', err);
      setExportMessage('Erro ao exportar para Google Sheets. Verifique as configurações.');
      setTimeout(() => setExportMessage(''), 8000);
    } finally {
      setIsExportingToSheets(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#202323' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando prompts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#202323' }}>
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Erro ao carregar dados</h2>
          <p className="text-purple-200 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#202323' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              PromptVault
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-purple-200 font-light max-w-2xl mx-auto">
            Sistema moderno para cadastro, organização e gestão de prompts de inteligência artificial
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[300px]"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todas as categorias</option>
                <option value="chatbot">🤖 Chatbot</option>
                <option value="codigo">💻 Código</option>
                <option value="imagem">🎨 Imagem</option>
                <option value="texto">📝 Texto</option>
                <option value="analise">📊 Análise</option>
                <option value="criativo">✨ Criativo</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos os status</option>
                <option value="draft">📝 Rascunho</option>
                <option value="active">✅ Ativo</option>
                <option value="testing">🧪 Testando</option>
                <option value="archived">📚 Arquivado</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={exportToJSON}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>

              <button
                onClick={handleExportToSheets}
                disabled={isExportingToSheets}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 font-medium"
              >
                {isExportingToSheets ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>{isExportingToSheets ? 'Exportando...' : 'Sheets'}</span>
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Prompt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Export Message */}
        {exportMessage && (
          <div className={`
            bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/20
            ${exportMessage.includes('Erro') ? 'border-red-500/50 bg-red-500/10' : 'border-green-500/50 bg-green-500/10'}
          `}>
            <p className={`text-sm font-medium ${exportMessage.includes('Erro') ? 'text-red-200' : 'text-green-200'}`}>
              {exportMessage}
            </p>
            {exportMessage.includes('Google Apps Script') && (
              <div className="mt-3">
                <SetupInstructions />
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total de Prompts', value: prompts.length, icon: Brain, color: 'from-purple-500 to-purple-600' },
            { label: 'Ativos', value: prompts.filter(p => p.status === 'active').length, icon: Sparkles, color: 'from-green-500 to-green-600' },
            { label: 'Em Teste', value: prompts.filter(p => p.status === 'testing').length, icon: Filter, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Rascunhos', value: prompts.filter(p => p.status === 'draft').length, icon: Plus, color: 'from-blue-500 to-blue-600' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">{stat.label}</p>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={setEditingPrompt}
                onDelete={handleDeletePrompt}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
              <Brain className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {prompts.length === 0 ? 'Nenhum prompt cadastrado' : 'Nenhum prompt encontrado'}
              </h3>
              <p className="text-purple-200 mb-6">
                {prompts.length === 0 
                  ? 'Crie seu primeiro prompt de IA para começar'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              {prompts.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Criar Primeiro Prompt</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Forms */}
        {showForm && (
          <PromptForm
            onSubmit={handleCreatePrompt}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        )}

        {editingPrompt && (
          <PromptForm
            prompt={editingPrompt}
            onSubmit={handleEditPrompt}
            onCancel={() => setEditingPrompt(null)}
            isEdit
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
