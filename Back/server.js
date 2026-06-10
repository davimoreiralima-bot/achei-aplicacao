const express = require('express');
const cors = require('cors');
const path = require('path'); // Importado para lidar com caminhos de pastas
const pool = require('./db');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Middlewares globais
app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO: Torna a pasta 'uploads' pública para o React conseguir carregar as fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Rota de Teste Inicial da API
app.get('/api/teste', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ 
      status: "API Online!", 
      horario_banco: resultado.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao consultar o banco", detalhes: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});