import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/data
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM user_data WHERE user_id = $1', [req.user.userId]);
    if (!result.rows.length) return res.json({});

    const row = result.rows[0];
    res.json({
      completed: JSON.parse(row.completed || '{}'),
      customSkills: JSON.parse(row.custom_skills || '{}'),
      cords: JSON.parse(row.cords || '[]'),
      songs: JSON.parse(row.songs || '[]'),
      events: JSON.parse(row.events || '[]'),
      attending: JSON.parse(row.attending || '{}'),
      preferences: JSON.parse(row.preferences || '{}'),
    });
  } catch (err) {
    console.error('Load data error:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// PUT /api/data
router.put('/', requireAuth, async (req, res) => {
  try {
    const { completed, customSkills, cords, songs, events, attending, preferences } = req.body;

    const existing = await query('SELECT user_id FROM user_data WHERE user_id = $1', [req.user.userId]);

    if (existing.rows.length) {
      await query(`
        UPDATE user_data SET
          completed = $1, custom_skills = $2, cords = $3, songs = $4,
          events = $5, attending = $6, preferences = $7,
          updated_at = now()
        WHERE user_id = $8
      `, [
        JSON.stringify(completed || {}),
        JSON.stringify(customSkills || {}),
        JSON.stringify(cords || []),
        JSON.stringify(songs || []),
        JSON.stringify(events || []),
        JSON.stringify(attending || {}),
        JSON.stringify(preferences || {}),
        req.user.userId
      ]);
    } else {
      await query(`
        INSERT INTO user_data (user_id, completed, custom_skills, cords, songs, events, attending, preferences)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        req.user.userId,
        JSON.stringify(completed || {}),
        JSON.stringify(customSkills || {}),
        JSON.stringify(cords || []),
        JSON.stringify(songs || []),
        JSON.stringify(events || []),
        JSON.stringify(attending || {}),
        JSON.stringify(preferences || {})
      ]);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Save data error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

export default router;
