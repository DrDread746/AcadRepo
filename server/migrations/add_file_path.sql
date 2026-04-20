-- Add file_path column to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_path TEXT;
