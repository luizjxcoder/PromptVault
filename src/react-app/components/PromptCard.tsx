import { useState } from 'react';
import { Edit3, Trash2, Brain, Code, Image, MessageSquare, Sparkles } from 'lucide-react';
import type { PromptType } from '@/shared/types';

interface PromptCardProps {
  prompt: PromptType;
  onEdit: (prompt: PromptType) => void;
  onDelete: (id: number) => void;
}

const categoryIcons = {
  'chatbot': <MessageSquare className="w-5 h-5" />,
  'codigo': <Code className="w-5 h-5" />,
  'imagem': <Image className="w-5 h-5" />,
  'texto': <Edit3 className="w-5 h-5" />,
  'analise': <Brain className="w-5 h-5" />,
  'criativo': <Sparkles className="w-5 h-5" />
};

const priorityColors = {
  'low': 'border-l-green-500 border-purple-500',
  'medium': 'border-l-yellow-500 border-purple-500', 
  'high': 'border-l-red-500 border-purple-500'
};

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'active': 'bg-green-100 text-green-800',
  'archived': 'bg-blue-100 text-blue-800',
  'testing': 'bg-purple-100 text-purple-800'
};

export default function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      'low': '🟢 Baixa',
      'medium': '🟡 Média',
      'high': '🔴 Alta'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'draft': '📝 Rascunho',
      'active': '✅ Ativo',
      'archived': '📚 Arquivado',
      'testing': '🧪 Testando'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'chatbot': '🤖 Chatbot',
      'codigo': '💻 Código',
      'imagem': '🎨 Imagem',
      'texto': '📝 Texto',
      'analise': '📊 Análise',
      'criativo': '✨ Criativo'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className={`
      bg-white/10 backdrop-blur-md rounded-xl shadow-lg border-2 border-purple-500 border-l-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1
      ${priorityColors[prompt.priority as keyof typeof priorityColors]}
    `}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
              {categoryIcons[prompt.category as keyof typeof categoryIcons] || <Brain className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white line-clamp-1">{prompt.title}</h3>
              <p className="text-sm text-purple-200">{getCategoryLabel(prompt.category)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(prompt)}
              className="p-2 text-blue-400 hover:text-blue-200 hover:bg-purple-500/20 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(prompt.id)}
              className="p-2 text-red-400 hover:text-red-200 hover:bg-purple-500/20 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center justify-between mb-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${statusColors[prompt.status as keyof typeof statusColors]}
          `}>
            {getStatusLabel(prompt.status)}
          </span>
          <span className="text-sm text-purple-200">
            {getPriorityLabel(prompt.priority)}
          </span>
        </div>

        {/* AI Model */}
        {prompt.ai_model && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
              🤖 {prompt.ai_model}
            </span>
          </div>
        )}

        {/* Prompt Preview */}
        <div className="mb-4">
          <div className={`
            text-sm text-gray-200 font-mono bg-black/20 p-3 rounded-lg border border-purple-400/30
            ${isExpanded ? '' : 'line-clamp-3'}
          `}>
            {prompt.prompt_text}
          </div>
          {prompt.prompt_text.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-xs mt-2 font-medium"
            >
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>

        {/* Use Case */}
        {prompt.use_case && (
          <div className="mb-4">
            <p className="text-sm text-purple-200">
              <span className="font-medium">Caso de uso:</span> {prompt.use_case}
            </p>
          </div>
        )}

        {/* Tags */}
        {prompt.tags && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {prompt.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-purple-300 pt-4 border-t border-purple-500/30">
          <span>Criado: {formatDate(prompt.created_at)}</span>
          {prompt.deadline_date && (
            <span className="text-orange-600 font-medium">
              Prazo: {formatDate(prompt.deadline_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
