import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const addBranchColumn = async () => {
  try {
    // Add branch column to subjects table
    await pool.query(`
      ALTER TABLE subjects 
      ADD COLUMN IF NOT EXISTS branch VARCHAR(50)
    `);
    console.log('✅ Added branch column to subjects table');

    // Update existing subjects to have branch (default to CS for existing data)
    await pool.query(`
      UPDATE subjects 
      SET branch = 'CS' 
      WHERE branch IS NULL
    `);
    console.log('✅ Updated existing subjects with branch = CS');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding branch column:', error);
    process.exit(1);
  }
};

addBranchColumn();
