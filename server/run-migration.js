import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const runMigration = async () => {
  try {
    await pool.query(`
      ALTER TABLE resources 
      ADD COLUMN IF NOT EXISTS file_path TEXT
    `);
    console.log('✅ Migration successful: Added file_path column to resources table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
