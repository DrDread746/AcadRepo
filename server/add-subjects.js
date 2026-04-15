import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const addSubjects = async () => {
  const subjects = [
    { name: 'Mathematics for Computer Engineers', code: 'R5MA2007T', semester: 3, regulation: 'R5' },
    { name: 'Discrete Mathematics', code: 'R5IT2001T', semester: 3, regulation: 'R5' },
    { name: 'Design & Analysis of Algorithm', code: 'R5IT2002T', semester: 3, regulation: 'R5' },
    { name: 'Operating System', code: 'R5IT2003T', semester: 3, regulation: 'R5' },
    { name: 'Multi-disciplinary Minor-I', code: 'MDM-I', semester: 3, regulation: 'R5' },
    { name: 'Program Development Laboratory', code: 'R5IT2005L', semester: 3, regulation: 'R5' },
    { name: 'Algorithm Laboratory', code: 'R5IT2002L', semester: 3, regulation: 'R5' },
    { name: 'Operating System Laboratory', code: 'R5IT2003L', semester: 3, regulation: 'R5' },
    { name: 'Modern Indian Languages', code: 'MIL', semester: 3, regulation: 'R5' },
    { name: 'Open Source Technology Laboratory', code: 'R5IT2004L', semester: 3, regulation: 'R5' },
    { name: 'Universal Human Values', code: 'R5HS2401O', semester: 3, regulation: 'R5' },
  ];

  try {
    for (const subject of subjects) {
      const result = await pool.query(
        'INSERT INTO subjects (name, code, semester, regulation) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING RETURNING *',
        [subject.name, subject.code, subject.semester, subject.regulation]
      );
      if (result.rows.length > 0) {
        console.log(`✅ Added: ${subject.name} (${subject.code})`);
      } else {
        console.log(`⚠️  Already exists: ${subject.name} (${subject.code})`);
      }
    }
    console.log('\n✅ All subjects processed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding subjects:', error);
    process.exit(1);
  }
};

addSubjects();
