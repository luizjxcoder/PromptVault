import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { CreatePromptSchema, UpdatePromptSchema } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend requests
app.use("/*", cors());

// Get all prompts
app.get("/api/prompts", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM prompts 
      ORDER BY created_at DESC
    `).all();
    
    return c.json({ prompts: results });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return c.json({ error: "Failed to fetch prompts" }, 500);
  }
});

// Get prompt by ID
app.get("/api/prompts/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid prompt ID" }, 400);
    }

    const result = await c.env.DB.prepare(`
      SELECT * FROM prompts WHERE id = ?
    `).bind(id).first();

    if (!result) {
      return c.json({ error: "Prompt not found" }, 404);
    }

    return c.json({ prompt: result });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return c.json({ error: "Failed to fetch prompt" }, 500);
  }
});

// Create new prompt
app.post("/api/prompts", zValidator("json", CreatePromptSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const now = new Date().toISOString();

    const result = await c.env.DB.prepare(`
      INSERT INTO prompts (
        title, category, ai_model, prompt_text, priority, status, 
        use_case, deadline_date, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.title,
      data.category,
      data.ai_model || null,
      data.prompt_text,
      data.priority,
      data.status,
      data.use_case || null,
      data.deadline_date || null,
      data.tags || null,
      now,
      now
    ).run();

    if (!result.success) {
      return c.json({ error: "Failed to create prompt" }, 500);
    }

    // Fetch the created prompt
    const createdPrompt = await c.env.DB.prepare(`
      SELECT * FROM prompts WHERE id = ?
    `).bind(result.meta.last_row_id).first();

    return c.json({ prompt: createdPrompt }, 201);
  } catch (error) {
    console.error("Error creating prompt:", error);
    return c.json({ error: "Failed to create prompt" }, 500);
  }
});

// Update prompt
app.put("/api/prompts/:id", zValidator("json", UpdatePromptSchema), async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid prompt ID" }, 400);
    }

    const data = c.req.valid("json");
    const now = new Date().toISOString();

    // Check if prompt exists
    const existingPrompt = await c.env.DB.prepare(`
      SELECT * FROM prompts WHERE id = ?
    `).bind(id).first();

    if (!existingPrompt) {
      return c.json({ error: "Prompt not found" }, 404);
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }

    updateFields.push("updated_at = ?");
    values.push(now);
    values.push(id);

    const result = await c.env.DB.prepare(`
      UPDATE prompts SET ${updateFields.join(", ")} WHERE id = ?
    `).bind(...values).run();

    if (!result.success) {
      return c.json({ error: "Failed to update prompt" }, 500);
    }

    // Fetch the updated prompt
    const updatedPrompt = await c.env.DB.prepare(`
      SELECT * FROM prompts WHERE id = ?
    `).bind(id).first();

    return c.json({ prompt: updatedPrompt });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return c.json({ error: "Failed to update prompt" }, 500);
  }
});

// Delete prompt
app.delete("/api/prompts/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "Invalid prompt ID" }, 400);
    }

    // Check if prompt exists
    const existingPrompt = await c.env.DB.prepare(`
      SELECT * FROM prompts WHERE id = ?
    `).bind(id).first();

    if (!existingPrompt) {
      return c.json({ error: "Prompt not found" }, 404);
    }

    const result = await c.env.DB.prepare(`
      DELETE FROM prompts WHERE id = ?
    `).bind(id).run();

    if (!result.success) {
      return c.json({ error: "Failed to delete prompt" }, 500);
    }

    return c.json({ message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return c.json({ error: "Failed to delete prompt" }, 500);
  }
});

// Search prompts
app.get("/api/prompts/search", async (c) => {
  try {
    const query = c.req.query("q");
    const category = c.req.query("category");
    const status = c.req.query("status");

    let sql = "SELECT * FROM prompts WHERE 1=1";
    const bindings = [];

    if (query) {
      sql += " AND (title LIKE ? OR prompt_text LIKE ? OR tags LIKE ?)";
      const searchTerm = `%${query}%`;
      bindings.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      sql += " AND category = ?";
      bindings.push(category);
    }

    if (status) {
      sql += " AND status = ?";
      bindings.push(status);
    }

    sql += " ORDER BY created_at DESC";

    const { results } = await c.env.DB.prepare(sql).bind(...bindings).all();
    
    return c.json({ prompts: results });
  } catch (error) {
    console.error("Error searching prompts:", error);
    return c.json({ error: "Failed to search prompts" }, 500);
  }
});

// Get prompt statistics
app.get("/api/prompts/stats", async (c) => {
  try {
    const totalResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM prompts
    `).first();

    const statusResult = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count 
      FROM prompts 
      GROUP BY status
    `).all();

    const categoryResult = await c.env.DB.prepare(`
      SELECT category, COUNT(*) as count 
      FROM prompts 
      GROUP BY category
    `).all();

    const priorityResult = await c.env.DB.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM prompts 
      GROUP BY priority
    `).all();

    return c.json({
      total: totalResult?.total || 0,
      byStatus: statusResult.results || [],
      byCategory: categoryResult.results || [],
      byPriority: priorityResult.results || []
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch statistics" }, 500);
  }
});

// Export new prompts to Google Sheets via Apps Script
app.post("/api/prompts/export-to-sheets", async (c) => {
  try {
    // Get all prompts that haven't been exported yet
    const { results: newPrompts } = await c.env.DB.prepare(`
      SELECT * FROM prompts 
      WHERE exported_to_sheets = FALSE OR exported_to_sheets IS NULL
      ORDER BY created_at ASC
    `).all();

    if (!newPrompts || newPrompts.length === 0) {
      return c.json({ message: "Nenhum prompt novo para exportar" });
    }

    const appsScriptWebhookUrl = c.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;

    if (!appsScriptWebhookUrl) {
      return c.json({ 
        error: "URL do webhook do Google Apps Script não configurada. Configure a variável GOOGLE_APPS_SCRIPT_WEBHOOK_URL.",
        setupInstructions: "Acesse o painel de configurações para ver as instruções de setup do Google Apps Script."
      }, 400);
    }

    // Prepare data for Apps Script
    const promptsData = newPrompts.map((prompt: any) => ({
      id: prompt.id,
      title: prompt.title,
      category: prompt.category,
      ai_model: prompt.ai_model || '',
      prompt_text: prompt.prompt_text,
      priority: prompt.priority,
      status: prompt.status,
      use_case: prompt.use_case || '',
      deadline_date: prompt.deadline_date || '',
      tags: prompt.tags || '',
      created_at: prompt.created_at,
      updated_at: prompt.updated_at
    }));

    // Send data to Apps Script webhook
    const response = await fetch(appsScriptWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addPrompts',
        prompts: promptsData
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error('Apps Script webhook error:', errorText);
      return c.json({ 
        error: `Erro no webhook do Apps Script: ${response.status} - ${errorText}`
      }, 500);
    }

    const result = await response.json().catch(() => ({}));

    // Mark prompts as exported
    const promptIds = newPrompts.map((p: any) => p.id);
    for (const id of promptIds) {
      await c.env.DB.prepare(`
        UPDATE prompts SET exported_to_sheets = TRUE, updated_at = ?
        WHERE id = ?
      `).bind(new Date().toISOString(), id).run();
    }

    return c.json({ 
      message: `${newPrompts.length} prompts exportados com sucesso para o Google Sheets via Apps Script`,
      exportedCount: newPrompts.length,
      details: result
    });

  } catch (error) {
    console.error("Error exporting to Google Sheets:", error);
    return c.json({ error: "Falha ao exportar para Google Sheets" }, 500);
  }
});

export default app;
