import mysql from 'mysql2/promise';

if (!process.env.DB_PASSWORD) {
  console.error('❌ DB_PASSWORD env var is not set. Check your .env file.');
  process.exit(1);
}

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT || '3306', 10),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME     || 'mbays_game',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully to', (process.env.DB_HOST || '127.0.0.1'));
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });

export default pool;
