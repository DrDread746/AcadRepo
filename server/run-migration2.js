import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const runMigration = async () => {
  try {
    await pool.query(`
      ALTER TABLE resources 
      ALTER COLUMN file_url DROP NOT NULL
    `);
    console.log('✅ Migration successful: Made file_url nullable in resources table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
