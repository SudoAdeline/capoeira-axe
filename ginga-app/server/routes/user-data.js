import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function rowToObj(rows) {
  if (!rows.length || !rows[0].values.length) return null;
  const cols = rows[0].columns;
  const vals = rows[0].values[0];
  return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
}

// GET /api/data
router.get('/', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const row = rowToObj(db.exec('SELECT * FROM user_data WHERE user_id = ?', [req.user.userId]));
    if (!row) return res.json({});

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
    const db = await getDb();
    const { completed, customSkills, cords, songs, events, attending, preferences } = req.body;

    const existing = rowToObj(db.exec('SELECT user_id FROM user_data WHERE user_id = ?', [req.user.userId]));

    if (existing) {
      db.run(`
        UPDATE user_data SET
          completed = ?, custom_skills = ?, cords = ?, songs = ?,
          events = ?, attending = ?, preferences = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
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
      db.run(`
        INSERT INTO user_data (user_id, completed, custom_skills, cords, songs, events, attending, preferences)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

    saveDb();
    res.json({ ok: true });
  } catch (err) {
    console.error('Save data error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

export default router;
