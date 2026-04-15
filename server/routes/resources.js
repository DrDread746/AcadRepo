import express from 'express';
import pool from '../db.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Upload new resource (faculty/admin only)
router.post('/', auth, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { title, type, subject_id, file_url, verified } = req.body;
    const uploaded_by = req.user.id;

    if (!title || !type || !subject_id || !file_url) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await pool.query(
      'INSERT INTO resources (title, type, subject_id, file_url, uploaded_by, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, type, subject_id, file_url, uploaded_by, verified || false]
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
