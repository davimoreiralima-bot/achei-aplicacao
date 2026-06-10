const express = require('express');
const router = express.Router();
const pool = require('../db'); // Importa a conexão com o banco

// Endpoint de Login Real
router.post('/login', async (req, res) => {
  const { matricula, senha, tipo } = req.body;

  // Validação simples de campos obrigatórios
  if (!matricula || !senha || !tipo) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    // Busca o usuário no banco de dados
    const queryText = 'SELECT * FROM usuarios WHERE matricula = $1 AND senha = $2 AND tipo = $3';
    const resultado = await pool.query(queryText, [matricula, senha, tipo]);

    // Se não encontrar nenhum registro compatível
    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique os dados e tente novamente.' });
    }

    const usuarioLogado = resultado.rows[0];

    // Retorna os dados do usuário para o React salvar no estado global
    res.json({
      message: 'Acesso liberado com sucesso!',
      user: {
        matricula: usuarioLogado.matricula,
        nome: usuarioLogado.nome,
        tipo: usuarioLogado.tipo
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor ao tentar autenticar.' });
  }
});

module.exports = router;