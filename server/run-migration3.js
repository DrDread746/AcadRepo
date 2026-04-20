import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const runMigration = async () => {
  try {
    await pool.query(`
      ALTER TABLE reports 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
      ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP
    `);
    console.log('✅ Migration successful: Added status, resolved_by, resolved_at columns to reports table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
