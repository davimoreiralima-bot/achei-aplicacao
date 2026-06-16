const express = require('express');
const cors = require('cors');
const path = require('path'); 
const pool = require('./db');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
require('dotenv').config();

const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO: Torna a pasta 'uploads' pública para o React carregar as fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Rotas principais da API
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// =========================================================================
// ROTAS ADICIONADAS: Gerenciamento do Sistema de Notificações (Processo 4)
// =========================================================================

// Rota para BUSCAR as preferências e o e-mail salvo do usuário
app.get('/api/notifications/preferences/:matricula', async (req, res) => {
  const { matricula } = req.params;
  try {
    const result = await pool.query('SELECT * FROM preferencias_notificacoes WHERE matricula = $1', [matricula]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ eletronicos: false, documentos: false, livros: false, vestuario: false, outros: false, email_notificacao: '' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar preferências de notificações.' });
  }
});

// Rota para SALVAR ou EDITAR as preferências e o e-mail customizado
app.post('/api/notifications/preferences', async (req, res) => {
  const { matricula, eletronicos, documentos, livros, vestuario, outros, email_notificacao } = req.body;
  try {
    const query = `
      INSERT INTO preferencias_notificacoes (matricula, eletronicos, documentos, livros, vestuario, outros, email_notificacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (matricula) 
      DO UPDATE SET eletronicos = $2, documentos = $3, livros = $4, vestuario = $5, outros = $6, email_notificacao = $7;
    `;
    await pool.query(query, [matricula, eletronicos, documentos, livros, vestuario, outros, email_notificacao]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar preferências de notificações.' });
  }
});

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

// Inicialização única e correta do Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});