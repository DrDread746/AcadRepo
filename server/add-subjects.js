import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const addSubjects = async () => {
  const subjects = [
    // Sem 1 (Common for CS and IT)
    { name: 'Chemistry', code: 'CHEM101', semester: 1, regulation: 'R5', branch: 'CS' },
    { name: 'Chemistry', code: 'CHEM101', semester: 1, regulation: 'R5', branch: 'IT' },
    { name: 'Mathematics-I', code: 'MATH101', semester: 1, regulation: 'R5', branch: 'CS' },
    { name: 'Mathematics-I', code: 'MATH101', semester: 1, regulation: 'R5', branch: 'IT' },
    { name: 'Probability & Statistics', code: 'STAT101', semester: 1, regulation: 'R5', branch: 'CS' },
    { name: 'Probability & Statistics', code: 'STAT101', semester: 1, regulation: 'R5', branch: 'IT' },
    { name: 'Engineering Mechanics', code: 'EMECH101', semester: 1, regulation: 'R5', branch: 'CS' },
    { name: 'Engineering Mechanics', code: 'EMECH101', semester: 1, regulation: 'R5', branch: 'IT' },
    { name: 'Programming for Problem Solving', code: 'PPS101', semester: 1, regulation: 'R5', branch: 'CS' },
    { name: 'Programming for Problem Solving', code: 'PPS101', semester: 1, regulation: 'R5', branch: 'IT' },
    { name: 'Digital Logic Design', code: 'DLD101', semester: 1, regulation: 'R5', branch: 'CS' },
    { name: 'Digital Logic Design', code: 'DLD101', semester: 1, regulation: 'R5', branch: 'IT' },
    { name: 'Indian Knowledge System', code: 'IKS101', semester: 1, regulation: 'R5', branch: 'CS' },
    { name: 'Indian Knowledge System', code: 'IKS101', semester: 1, regulation: 'R5', branch: 'IT' },

    // Sem 2 (Common for CS and IT)
    { name: 'Physics', code: 'PHY201', semester: 2, regulation: 'R5', branch: 'CS' },
    { name: 'Physics', code: 'PHY201', semester: 2, regulation: 'R5', branch: 'IT' },
    { name: 'Mathematics-II', code: 'MATH201', semester: 2, regulation: 'R5', branch: 'CS' },
    { name: 'Mathematics-II', code: 'MATH201', semester: 2, regulation: 'R5', branch: 'IT' },
    { name: 'Engineering Graphics', code: 'EG201', semester: 2, regulation: 'R5', branch: 'CS' },
    { name: 'Engineering Graphics', code: 'EG201', semester: 2, regulation: 'R5', branch: 'IT' },
    { name: 'Computer Organisation', code: 'CO201', semester: 2, regulation: 'R5', branch: 'CS' },
    { name: 'Computer Organisation', code: 'CO201', semester: 2, regulation: 'R5', branch: 'IT' },
    { name: 'Data Structures', code: 'DS201', semester: 2, regulation: 'R5', branch: 'CS' },
    { name: 'Data Structures', code: 'DS201', semester: 2, regulation: 'R5', branch: 'IT' },

    // CS Sem 3
    { name: 'Mathematics for Computer Engineers', code: 'R5MA2007T', semester: 3, regulation: 'R5', branch: 'CS' },
    { name: 'Mathematics 3', code: 'MATH301', semester: 3, regulation: 'R5', branch: 'CS' },
    { name: 'Discrete Structure', code: 'DS301', semester: 3, regulation: 'R5', branch: 'CS' },
    { name: 'Design & Analysis of Algorithm', code: 'R5IT2002T', semester: 3, regulation: 'R5', branch: 'CS' },
    { name: 'Operating System', code: 'R5IT2003T', semester: 3, regulation: 'R5', branch: 'CS' },
    { name: 'Universal Human Values', code: 'R5HS2401O', semester: 3, regulation: 'R5', branch: 'CS' },

    // IT Sem 3
    { name: 'Mathematics for Computer Engineers', code: 'R5MA2007T', semester: 3, regulation: 'R5', branch: 'IT' },
    { name: 'Discrete Mathematics', code: 'R5IT2001T', semester: 3, regulation: 'R5', branch: 'IT' },
    { name: 'Design & Analysis of Algorithm', code: 'R5IT2002T', semester: 3, regulation: 'R5', branch: 'IT' },
    { name: 'Operating System', code: 'R5IT2003T', semester: 3, regulation: 'R5', branch: 'IT' },
    { name: 'Universal Human Values', code: 'R5HS2401O', semester: 3, regulation: 'R5', branch: 'IT' },

    // CS Sem 4
    { name: 'Theory of Computation', code: 'TOC401', semester: 4, regulation: 'R5', branch: 'CS' },
    { name: 'Artificial Intelligence', code: 'R5CO2009T', semester: 4, regulation: 'R5', branch: 'CS' },
    { name: 'Database Management System', code: 'DBMS401', semester: 4, regulation: 'R5', branch: 'CS' },
    { name: 'Software Engineering', code: 'R5CO2009T', semester: 4, regulation: 'R5', branch: 'CS' },
    { name: 'Environmental Science', code: 'R5CH2402O', semester: 4, regulation: 'R5', branch: 'CS' },

    // IT Sem 4
    { name: 'Automata Theory', code: 'AT401', semester: 4, regulation: 'R5', branch: 'IT' },
    { name: 'Artificial Intelligence', code: 'R5IT2007T', semester: 4, regulation: 'R5', branch: 'IT' },
    { name: 'Database Systems', code: 'R5IT2008T', semester: 4, regulation: 'R5', branch: 'IT' },
    { name: 'Computer Networks', code: 'R5IT2009T', semester: 4, regulation: 'R5', branch: 'IT' },
    { name: 'Environmental Science', code: 'R5CH2402O', semester: 4, regulation: 'R5', branch: 'IT' },

    // CS Sem 5
    { name: 'Compiler Construction', code: 'CC501', semester: 5, regulation: 'R5', branch: 'CS' },
    { name: 'Machine Learning', code: 'R5CO3002T', semester: 5, regulation: 'R5', branch: 'CS' },
    { name: 'Computer Network', code: 'R5CO3003T', semester: 5, regulation: 'R5', branch: 'CS' },
    { name: 'Parallel Computing', code: 'R5CO3004T', semester: 5, regulation: 'R5', branch: 'CS' },
    { name: 'Human Computer Interaction', code: 'HCI501', semester: 5, regulation: 'R5', branch: 'CS' },

    // IT Sem 5
    { name: 'Machine Learning', code: 'R5IT3001T', semester: 5, regulation: 'R5', branch: 'IT' },
    { name: 'Software Engineering', code: 'R5IT3002T', semester: 5, regulation: 'R5', branch: 'IT' },
    { name: 'Parallel Computing', code: 'R5IT3003T', semester: 5, regulation: 'R5', branch: 'IT' },
    { name: 'Cloud Computing', code: 'R5IT3004T', semester: 5, regulation: 'R5', branch: 'IT' },
    { name: 'Cryptography', code: 'CRYPT501', semester: 5, regulation: 'R5', branch: 'IT' },

    // CS Sem 6
    { name: 'Cloud Computing', code: 'R5CO3006T', semester: 6, regulation: 'R5', branch: 'CS' },
    { name: 'Cyber Security', code: 'R5CO3007T', semester: 6, regulation: 'R5', branch: 'CS' },
    { name: 'Research Methodology', code: 'RM601', semester: 6, regulation: 'R5', branch: 'CS' },
    { name: 'Financial Management', code: 'FM601', semester: 6, regulation: 'R5', branch: 'CS' },
    { name: 'Devops', code: 'DEVOPS601', semester: 6, regulation: 'R5', branch: 'CS' },

    // IT Sem 6
    { name: 'System Security', code: 'R5IT3006T', semester: 6, regulation: 'R5', branch: 'IT' },
    { name: 'Wireless Network', code: 'WN601', semester: 6, regulation: 'R5', branch: 'IT' },
    { name: 'Research Methodology', code: 'R5IT3008T', semester: 6, regulation: 'R5', branch: 'IT' },
    { name: 'Financial Management', code: 'FM601', semester: 6, regulation: 'R5', branch: 'IT' },
    { name: 'Devops', code: 'DEVOPS601', semester: 6, regulation: 'R5', branch: 'IT' },

    // CS Sem 7
    { name: 'Data Mining and Data Warehousing', code: 'R4CO4001T', semester: 7, regulation: 'R5', branch: 'CS' },
    { name: 'Cyber Security', code: 'R4CO4002T', semester: 7, regulation: 'R5', branch: 'CS' },

    // IT Sem 7
    { name: 'Data Mining and Data Warehousing', code: 'R4IT4001T', semester: 7, regulation: 'R5', branch: 'IT' },
    { name: 'Cyber Security', code: 'R4IT4002T', semester: 7, regulation: 'R5', branch: 'IT' },

    // CS Sem 8
    { name: 'Big Data Analytics', code: 'R4CO4011T', semester: 8, regulation: 'R5', branch: 'CS' },
    { name: 'Cloud Computing', code: 'R4CO4012T', semester: 8, regulation: 'R5', branch: 'CS' },

    // IT Sem 8
    { name: 'Big Data Analytics', code: 'R4IT4011T', semester: 8, regulation: 'R5', branch: 'IT' },
    { name: 'Cloud Computing', code: 'R4IT4012T', semester: 8, regulation: 'R5', branch: 'IT' },
  ];

  try {
    for (const subject of subjects) {
      const result = await pool.query(
        'INSERT INTO subjects (name, code, semester, regulation, branch) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING RETURNING *',
        [subject.name, subject.code, subject.semester, subject.regulation, subject.branch]
      );
      if (result.rows.length > 0) {
        console.log(`✅ Added: ${subject.name} (${subject.code}) - ${subject.branch}`);
      } else {
        console.log(`⚠️  Already exists: ${subject.name} (${subject.code}) - ${subject.branch}`);
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