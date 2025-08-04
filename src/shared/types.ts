import z from "zod";

export const PromptSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  ai_model: z.string().optional(),
  prompt_text: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['draft', 'active', 'archived', 'testing']),
  use_case: z.string().optional(),
  deadline_date: z.string().optional(),
  tags: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export type PromptType = z.infer<typeof PromptSchema>;

export const CreatePromptSchema = PromptSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export type CreatePromptType = z.infer<typeof CreatePromptSchema>;

export const UpdatePromptSchema = CreatePromptSchema.partial();
export type UpdatePromptType = z.infer<typeof UpdatePromptSchema>;
