const { Pool } = require('pg');
require('dotenv').config();

let config = {};

// 1. Se estiver na nuvem (Render), usa a URL única com SSL ativo
if (process.env.DATABASE_URL) {
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false
  };
} else {
  // 2. Se estiver rodando Localmente, ele puxa as suas variáveis separadas do .env
  config = {
    user: process.env.DB_USER || process.env.PGUSER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '', 
    host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10),
    database: process.env.DB_DATABASE || process.env.PGDATABASE || 'acheidb',
    ssl: false // Localmente não exige criptografia SSL
  };
}

const pool = new Pool(config);

module.exports = pool;