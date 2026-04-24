-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  semester INTEGER NOT NULL,
  regulation VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('PYQ', 'notes', 'book')),
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  file_url TEXT,
  file_path TEXT,
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT FALSE,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  issue_type VARCHAR(50) NOT NULL,
  description TEXT,
  reported_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for search optimization
CREATE INDEX IF NOT EXISTS idx_resources_title ON resources(title);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_verified ON resources(verified);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester);

-- Seed sample data
INSERT INTO subjects (name, code, semester, regulation) VALUES
  ('Mathematics I', 'MA101', 1, 'R2021'),
  ('Physics', 'PH101', 1, 'R2021'),
  ('Chemistry', 'CH101', 1, 'R2021'),
  ('Engineering Mechanics', 'ME101', 2, 'R2021'),
  ('Data Structures', 'CS201', 3, 'R2021'),
  ('Operating Systems', 'CS202', 4, 'R2021')
ON CONFLICT (code) DO NOTHING;

-- Insert sample user (faculty) for testing
INSERT INTO users (name, email, password, role) VALUES
  ('Faculty User', 'faculty@test.com', '$2b$10$XQWzZQZQZQZQZQZQZQZQZu', 'faculty')
ON CONFLICT (email) DO NOTHING;

-- Insert sample resources
INSERT INTO resources (title, type, subject_id, file_url, uploaded_by, verified) VALUES
  ('Mathematics I - Mid Sem PYQ 2023', 'PYQ', 1, 'https://example.com/math1-pyq.pdf', 1, TRUE),
  ('Mathematics I - Handbook of Engineering', 'book', 1, 'https://archive.org/details/handbookofengine00wynn/page/30/mode/2up', 1, TRUE),
  ('Physics - Chapter 1 Notes', 'notes', 2, 'https://example.com/physics-notes.pdf', 1, TRUE),
  ('Chemistry Lab Manual', 'book', 3, 'https://example.com/chemistry-lab.pdf', 1, FALSE),
  ('Data Structures - Final Exam PYQ 2023', 'PYQ', 5, 'https://example.com/ds-pyq.pdf', 1, TRUE)
ON CONFLICT DO NOTHING;
