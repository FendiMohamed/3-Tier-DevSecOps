const db = require('../models/db');
const util = require('util');

const query = util.promisify(db.query).bind(db);


exports.list = async (req, res) => {
  try {
    const rows = await query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (e) {
    console.error('List Todos Error:', e);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};


exports.create = async (req, res) => {
  const { title, description, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  try {
    const result = await query(
      'INSERT INTO tasks (user_id, title, description, due_date) VALUES (?,?,?,?)',
      [req.user.id, title, description || null, due_date || null]
    );
    const [row] = await query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(row);
  } catch (e) {
    console.error('Create Todo Error:', e);
    res.status(500).json({ error: 'Failed to create todo' });
  }
};


exports.update = async (req, res) => {
  const { title, description, status, due_date } = req.body;
  try {
    const [existing] = await query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    await query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ? AND user_id = ?',
      [title || existing.title, description ?? existing.description, status || existing.status, due_date || existing.due_date, req.params.id, req.user.id]
    );
    const [row] = await query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(row);
  } catch (e) {
    console.error('Update Todo Error:', e);
    res.status(500).json({ error: 'Failed to update todo' });
  }
};


exports.remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Delete Todo Error:', e);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};
