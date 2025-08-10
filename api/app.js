const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const userRoutes = require('./routes/userRoutes'); 
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const db = require('./models/db'); 

const app = express();


app.use(cors());
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);   
app.use('/api/users', userRoutes);   
app.use('/api/todos', todoRoutes);  


const initAdminUser = async () => {
  const name = 'Admin User';
  const email = 'admin@esi.com';
  const password = 'admin1234';
  const role = 'admin';
  const saltRounds = 10;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('❌ Error checking admin existence:', err);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (results.length === 0) {
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role],
        (err, result) => {
          if (err) return console.error('❌ Failed to insert admin:', err);
          console.log(`✅ Admin user created: ${email} / ${password}`);
        }
      );
    } else {
      if (process.env.RESET_ADMIN_PASS === 'true') {
        db.query(
          'UPDATE users SET password = ?, name = ?, role = ? WHERE email = ?',
          [hashedPassword, name, role, email],
          (err, result) => {
            if (err) return console.error('❌ Failed to reset admin password:', err);
            console.log(`🔁 Admin password reset to: ${password}`);
          }
        );
      } else {
        console.log('✅ Admin user already exists.');
      }
    }
  });
};


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  initAdminUser(); 
  ensureTasksTable();
});


function ensureTasksTable() {
  const createSql = `CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending','done') DEFAULT 'pending',
    due_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`;
  db.query(createSql, (err) => {
    if (err) return console.error('❌ Failed ensuring tasks table:', err);
    console.log('🗂 Tasks table ready.');
  });
}

