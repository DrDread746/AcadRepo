-- Add branch column to subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS branch VARCHAR(50);
