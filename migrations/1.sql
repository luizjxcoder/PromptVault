
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  ai_model TEXT,
  prompt_text TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  use_case TEXT,
  deadline_date DATE,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
