import { useState } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import type { PromptType, CreatePromptType } from '@/shared/types';

interface PromptFormProps {
  prompt?: PromptType;
  onSubmit: (data: CreatePromptType) => void;
  onCancel: () => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

export default function PromptForm({ prompt, onSubmit, onCancel, isEdit = false, isSubmitting = false }: PromptFormProps) {
  const [formData, setFormData] = useState({
    title: prompt?.title || '',
    category: prompt?.category || 'chatbot',
    ai_model: prompt?.ai_model || '',
    prompt_text: prompt?.prompt_text || '',
    priority: prompt?.priority || 'medium',
    status: prompt?.status || 'draft',
    use_case: prompt?.use_case || '',
    deadline_date: prompt?.deadline_date || '',
    tags: prompt?.tags || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md border-2 border-purple-500 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              {isEdit ? 'Editar Prompt' : 'Novo Prompt de IA'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-white">
          {/* Title and Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Título do Prompt *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white placeholder-purple-300"
                placeholder="Ex: Gerador de artigos técnicos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white"
              >
                <option value="chatbot">🤖 Chatbot</option>
                <option value="codigo">💻 Código</option>
                <option value="imagem">🎨 Imagem</option>
                <option value="texto">📝 Texto</option>
                <option value="analise">📊 Análise</option>
                <option value="criativo">✨ Criativo</option>
              </select>
            </div>
          </div>

          {/* AI Model and Use Case */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Modelo de IA
              </label>
              <input
                type="text"
                name="ai_model"
                value={formData.ai_model}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white placeholder-purple-300"
                placeholder="Ex: GPT-4, Claude, Gemini"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Caso de Uso
              </label>
              <input
                type="text"
                name="use_case"
                value={formData.use_case}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white placeholder-purple-300"
                placeholder="Ex: Marketing, Desenvolvimento, Educação"
              />
            </div>
          </div>

          {/* Prompt Text */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Texto do Prompt *
            </label>
            <textarea
              name="prompt_text"
              value={formData.prompt_text}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-mono text-sm text-white placeholder-purple-300"
              placeholder="Digite o prompt completo aqui..."
            />
            <p className="text-xs text-purple-300 mt-1">
              Dica: Use variáveis entre chaves, ex: {"{tópico}"}, {"{estilo}"}
            </p>
          </div>

          {/* Priority, Status, and Deadline */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Prioridade *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white"
              >
                <option value="low">🟢 Baixa</option>
                <option value="medium">🟡 Média</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white"
              >
                <option value="draft">📝 Rascunho</option>
                <option value="active">✅ Ativo</option>
                <option value="testing">🧪 Testando</option>
                <option value="archived">📚 Arquivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Data Limite
              </label>
              <input
                type="date"
                name="deadline_date"
                value={formData.deadline_date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black/20 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white placeholder-purple-300"
              placeholder="marketing, copywriting, automação (separadas por vírgula)"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-purple-500/30">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-purple-200 bg-black/20 border border-purple-400/50 hover:bg-purple-500/20 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {isSubmitting 
                  ? (isEdit ? 'Atualizando...' : 'Criando...') 
                  : (isEdit ? 'Atualizar' : 'Criar') + ' Prompt'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
