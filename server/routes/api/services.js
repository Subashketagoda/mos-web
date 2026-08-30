import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/index.js';
import { requireAdminAuth } from '../../middleware/auth.js';

const router = express.Router();

// GET /api/services - Public list of active services
router.get('/', async (req, res) => {
  try {
    const services = await query.all(
      'SELECT id, name, duration, price, description, category, sortOrder FROM services WHERE isActive = 1 ORDER BY sortOrder ASC, name ASC'
    );
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/services/all - Admin view including inactive
router.get('/all', requireAdminAuth, async (req, res) => {
  try {
    const services = await query.all(
      'SELECT * FROM services ORDER BY sortOrder ASC, name ASC'
    );
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/services - Create service (Admin)
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { name, duration, price, description, category, sortOrder } = req.body;
    if (!name || !duration || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name, duration (mins), and price are required.' });
    }

    const id = `srv-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    await query.run(
      `INSERT INTO services (id, name, duration, price, description, category, isActive, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [id, name.trim(), parseInt(duration, 10), parseFloat(price), (description || '').trim(), category || 'General', parseInt(sortOrder || 0, 10), now, now]
    );

    const created = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    res.status(201).json({ success: true, service: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/services/:id - Update service (Admin)
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price, description, category, isActive, sortOrder } = req.body;

    const existing = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }

    const now = new Date().toISOString();
    await query.run(
      `UPDATE services 
       SET name = ?, duration = ?, price = ?, description = ?, category = ?, isActive = ?, sortOrder = ?, updatedAt = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        duration !== undefined ? parseInt(duration, 10) : existing.duration,
        price !== undefined ? parseFloat(price) : existing.price,
        description !== undefined ? description.trim() : existing.description,
        category !== undefined ? category : existing.category,
        isActive !== undefined ? (isActive ? 1 : 0) : existing.isActive,
        sortOrder !== undefined ? parseInt(sortOrder, 10) : existing.sortOrder,
        now,
        id
      ]
    );

    const updated = await query.get('SELECT * FROM services WHERE id = ?', [id]);
    res.json({ success: true, service: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/services/:id - Delete service (Admin)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query.run('DELETE FROM services WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
