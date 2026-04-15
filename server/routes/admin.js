import express from 'express';
import pool from '../db.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement (faculty/admin only)
router.post('/announcements', auth, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const created_by = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await pool.query(
      'INSERT INTO announcements (title, content, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, content, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as created_by_name 
       FROM announcements a 
       JOIN users u ON a.created_by = u.id 
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
