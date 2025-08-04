import { useState, useEffect } from 'react';
import type { PromptType, CreatePromptType, UpdatePromptType } from '@/shared/types';

interface UsePromptsReturn {
  prompts: PromptType[];
  isLoading: boolean;
  error: string | null;
  createPrompt: (data: CreatePromptType) => Promise<void>;
  updatePrompt: (id: number, data: UpdatePromptType) => Promise<void>;
  deletePrompt: (id: number) => Promise<void>;
  refreshPrompts: () => Promise<void>;
  exportToSheets: () => Promise<{ message: string; exportedCount?: number; error?: string; setupInstructions?: string }>;
}

interface ApiResponse<T> {
  prompts?: T[];
  prompt?: T;
  error?: string;
  message?: string;
}

export function usePrompts(): UsePromptsReturn {
  const [prompts, setPrompts] = useState<PromptType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('API request error:', err);
      throw err instanceof Error ? err : new Error('Unknown error occurred');
    }
  };

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<ApiResponse<PromptType>>('/api/prompts');
      setPrompts(data.prompts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
      console.error('Error fetching prompts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createPrompt = async (data: CreatePromptType) => {
    try {
      setError(null);
      const response = await apiRequest<ApiResponse<PromptType>>('/api/prompts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (response.prompt) {
        setPrompts(prev => [response.prompt!, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
      throw err;
    }
  };

  const updatePrompt = async (id: number, data: UpdatePromptType) => {
    try {
      setError(null);
      const response = await apiRequest<ApiResponse<PromptType>>(`/api/prompts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (response.prompt) {
        setPrompts(prev => prev.map(p => p.id === id ? response.prompt! : p));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prompt');
      throw err;
    }
  };

  const deletePrompt = async (id: number) => {
    try {
      setError(null);
      await apiRequest<ApiResponse<never>>(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      setPrompts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
      throw err;
    }
  };

  const exportToSheets = async () => {
    try {
      setError(null);
      const response = await apiRequest<{ 
        message: string; 
        exportedCount?: number;
        error?: string;
        setupInstructions?: string;
      }>('/api/prompts/export-to-sheets', {
        method: 'POST',
      });
      
      // Refresh prompts to update the exported status
      await fetchPrompts();
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export to Google Sheets');
      throw err;
    }
  };

  const refreshPrompts = async () => {
    await fetchPrompts();
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  return {
    prompts,
    isLoading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    refreshPrompts,
    exportToSheets,
  };
}
