# API Backend

## MySQL Setup (Linux)

1. Install MySQL Server
```
sudo apt update
sudo apt install mysql-server -y
```

2. Secure/Set root auth (optional simplest dev approach)
```
sudo mysql -u root -p
```
Inside the MySQL shell run:
```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Fendi';
FLUSH PRIVILEGES;
EXIT;
```

3. Create database and tables
```
sudo mysql -u root -pFendi
```
Then in the MySQL prompt:
```
CREATE DATABASE IF NOT EXISTS crud_app;
USE crud_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'viewer') NOT NULL DEFAULT 'viewer',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
The app will auto-create the `tasks` table at runtime if missing. For reference its structure is:
```
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending','done') DEFAULT 'pending',
  due_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Environment Variables
Create an `.env` file in `api/`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Fendi
DB_NAME=crud_app
# Set to true to forcibly reset admin user password on startup
RESET_ADMIN_PASS=false
```

## Install & Run
From the `api/` folder:
```
npm install
npm start
```
Server starts on `http://0.0.0.0:5000` by default and seeds an admin user:
- Email: admin@esi.com
- Password: admin1234

## Health Check
Once running, test authentication endpoints (adjust host/port as needed):
```
POST /api/auth/login
POST /api/auth/register
```

## Notes
- For production, create a dedicated MySQL user with limited privileges instead of root.
- Change the default admin password immediately in production or set `RESET_ADMIN_PASS=true` once with a modified password in code.
- Ensure MySQL 8+ for compatibility with `mysql_native_password` (if using older versions adjust accordingly).
