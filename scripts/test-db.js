const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'data', 'mosphere.db');
console.log('Opening SQLite database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  console.log('Database connected successfully.');

  db.all('SELECT * FROM services', [], (err, rows) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log('Services rows:', rows?.length, rows);
    }
    db.close();
  });
});
