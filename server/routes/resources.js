import express from 'express';
import pool from '../db.js';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload new resource (faculty/admin only)
router.post('/', auth, authorize('faculty', 'admin'), upload.single('file'), async (req, res) => {
  try {
    const { title, type, subject_id, file_url, verified } = req.body;
    const uploaded_by = req.user.id;

    if (!title || !type || !subject_id) {
      return res.status(400).json({ error: 'Title, type, and subject_id are required' });
    }

    if (!req.file && !file_url) {
      return res.status(400).json({ error: 'Either a file or URL is required' });
    }

    const file_path = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO resources (title, type, subject_id, file_url, file_path, uploaded_by, verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, type, subject_id, file_url || null, file_path, uploaded_by, verified || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify resource (faculty/admin only)
router.patch('/:id/verify', auth, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE resources SET verified = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Verify resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all resources
router.get('/', async (req, res) => {
  try {
    const { subject_id, type, verified } = req.query;
    
    let query = `
      SELECT r.*, s.name as subject_name, s.code as subject_code, u.name as uploaded_by_name
      FROM resources r
      JOIN subjects s ON r.subject_id = s.id
      JOIN users u ON r.uploaded_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (subject_id) {
      query += ` AND r.subject_id = $${paramIndex}`;
      params.push(subject_id);
      paramIndex++;
    }

    if (type) {
      query += ` AND r.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (verified !== undefined) {
      query += ` AND r.verified = $${paramIndex}`;
      params.push(verified === 'true');
      paramIndex++;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalResources = await pool.query('SELECT COUNT(*) as count FROM resources');
    const totalDownloads = await pool.query('SELECT COALESCE(SUM(downloads_count), 0) as total FROM resources');
    const recentUploads = await pool.query(
      'SELECT COUNT(*) as count FROM resources WHERE created_at > NOW() - INTERVAL \'7 days\''
    );

    res.json({
      totalResources: parseInt(totalResources.rows[0].count),
      totalDownloads: parseInt(totalDownloads.rows[0].total),
      recentUploads: parseInt(recentUploads.rows[0].count)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get analytics (most downloaded, recent uploads)
router.get('/analytics', async (req, res) => {
  try {
    const mostDownloaded = await pool.query(
      `SELECT r.*, s.name as subject_name 
       FROM resources r 
       JOIN subjects s ON r.subject_id = s.id 
       ORDER BY r.downloads_count DESC 
       LIMIT 10`
    );

    const recentUploads = await pool.query(
      `SELECT r.*, s.name as subject_name, u.name as uploaded_by_name 
       FROM resources r 
       JOIN subjects s ON r.subject_id = s.id 
       JOIN users u ON r.uploaded_by = u.id 
       ORDER BY r.created_at DESC 
       LIMIT 10`
    );

    res.json({
      mostDownloaded: mostDownloaded.rows,
      recentUploads: recentUploads.rows
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const { semester, regulation } = req.query;
    
    let query = 'SELECT * FROM subjects WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (semester) {
      query += ` AND semester = $${paramIndex}`;
      params.push(semester);
      paramIndex++;
    }

    if (regulation) {
      query += ` AND regulation = $${paramIndex}`;
      params.push(regulation);
      paramIndex++;
    }

    query += ' ORDER BY semester, name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
