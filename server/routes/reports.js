import express from 'express';
import pool from '../db.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create a new report (any authenticated user)
router.post('/', auth, async (req, res) => {
  try {
    const { resource_id, issue_type, description } = req.body;
    const reported_by = req.user.id;

    if (!resource_id || !issue_type) {
      return res.status(400).json({ error: 'resource_id and issue_type are required' });
    }

    const result = await pool.query(
      'INSERT INTO reports (resource_id, issue_type, description, reported_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [resource_id, issue_type, description, reported_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all reports (admin/faculty only)
router.get('/', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT r.*, res.title as resource_title, res.subject_id, s.name as subject_name, 
             u1.name as reported_by_name, u2.name as resolved_by_name
      FROM reports r
      JOIN resources res ON r.resource_id = res.id
      JOIN subjects s ON res.subject_id = s.id
      JOIN users u1 ON r.reported_by = u1.id
      LEFT JOIN users u2 ON r.resolved_by = u2.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve a report (admin/faculty only)
router.patch('/:id/resolve', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { id } = req.params;
    const resolved_by = req.user.id;

    const result = await pool.query(
      'UPDATE reports SET status = $1, resolved_by = $2, resolved_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['resolved', resolved_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dismiss a report (admin/faculty only)
router.patch('/:id/dismiss', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { id } = req.params;
    const resolved_by = req.user.id;

    const result = await pool.query(
      'UPDATE reports SET status = $1, resolved_by = $2, resolved_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['dismissed', resolved_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Dismiss report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
