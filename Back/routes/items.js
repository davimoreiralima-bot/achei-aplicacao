const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer'); 
const path = require('path');
const nodemailer = require('nodemailer');

// Configuração do armazenamento físico do Multer para fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const sufixoUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, sufixoUnico + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Configuração do transporte do Nodemailer para disparar e-mails (Porta 465 Segura)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 465,
  secure: true, 
  auth: {
    user: "davimoreiralima2005@gmail.com",       
    pass: "mahxiakytzhisfzw"    
  }
});

// =========================================================================
// ROTA: Cadastrar um item encontrado + Notificação por E-mail Automática
// =========================================================================
router.post('/register', upload.single('imagem'), async (req, res) => {
  const { titulo, categoria, descricao, local, cadastrado_por } = req.body;

  if (!titulo || !categoria || !descricao || !local || !cadastrado_por) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  const token_entrada = String(Math.floor(100000 + Math.random() * 900000));
  const id_numerico = Math.floor(1000 + Math.random() * 9000);
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // 1. Salva o item na tabela principal com o status pendente 'Aguardando Balcão'
    const queryText = `
      INSERT INTO itens (id_numerico, titulo, categoria, descricao, local, status, token_entrada, cadastrado_por, image_url)
      VALUES ($1, $2, $3, $4, $5, 'Aguardando Balcão', $6, $7, $8)
      RETURNING *;
    `;

    const resultado = await pool.query(queryText, [
      id_numerico, titulo, categoria, descricao, local, token_entrada, cadastrado_por, image_url
    ]);

    // 2. Registra a ação no histórico de auditoria
    await pool.query(
      'INSERT INTO logs_sistema (acao, item_id, funcionario_matricula) VALUES ($1, $2, $3)',
      ['Cadastro de item', resultado.rows[0].id, cadastrado_por]
    );

    // 3. PROCESSO 4: SISTEMA DE NOTIFICAÇÕES AUTOMÁTICAS
    const categoriaColuna = categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const colunasValidas = ['eletronicos', 'documentos', 'livros', 'vestuario', 'outros'];

    if (colunasValidas.includes(categoriaColuna)) {
      const buscaInteressados = await pool.query(
        `SELECT email_notificacao FROM preferencias_notificacoes 
         WHERE ${categoriaColuna} = true AND email_notificacao IS NOT NULL AND email_notificacao != '';`
      );

      buscaInteressados.rows.forEach(row => {
        const mailOptionsNotif = {
          from: '"ACHEI! Notificações" <davimoreiralima2005@gmail.com>',
          to: row.email_notificacao,
          subject: `🔔 Objeto de Interesse Encontrado: ${titulo}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2eaf0; border-radius: 12px;">
              <h2 style="color: #10345c;">🔔 Alerta de Preferências!</h2>
              <p>Olá! Um novo objeto correspondente às suas categorias de interesse foi cadastrado no sistema:</p>
              <div style="background-color: #f5f8fb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="font-size: 18px; color: #10345c;">${titulo}</strong><br/>
                <span style="font-size: 13px; color: #6d7f90;">Categoria: ${categoria} | Local: ${local}</span>
              </div>
              <p style="font-size: 13px; color: #6d7f90;">Acesse o Mural do aplicativo para conferir a listagem completa.</p>
            </div>
          `
        };

        transporter.sendMail(mailOptionsNotif, (err, info) => {
          if (err) console.error('Erro ao enviar e-mail de notificação:', err.message);
          else console.log('Notificação enviada com sucesso para:', row.email_notificacao);
        });
      });
    }

    res.status(201).json({
      message: 'Item pré-registrado com sucesso!',
      token_entrada: token_entrada
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar o item no banco de dados.' });
  }
});

// =========================================================================
// ROTA: Buscar todos os itens que estão "No Estoque" (Mural Público)
// =========================================================================
router.get('/feed', async (req, res) => {
  try {
    const queryText = `
      SELECT id, id_numerico, titulo, categoria, descricao, local, status, image_url, criado_em 
      FROM itens 
      WHERE status = 'No Estoque' 
      ORDER BY criado_em DESC;
    `;
    const resultado = await pool.query(queryText);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar itens do feed.' });
  }
});

// =========================================================================
// ROTA: Buscar itens cadastrados por uma matrícula específica (Meus Itens)
// =========================================================================
router.get('/mine/:matricula', async (req, res) => {
  const { matricula } = req.params;
  try {
    const queryText = `
      SELECT id, id_numerico, titulo, categoria, descricao, local, status, token_entrada, image_url, criado_em 
      FROM itens 
      WHERE cadastrado_por = $1 
      ORDER BY criado_em DESC;
    `;
    const resultado = await pool.query(queryText, [matricula]);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar seus itens.' });
  }
});

// =========================================================================
// ROTA: Buscar item pelo Token de Entrada (Validação no Balcão)
// =========================================================================
router.get('/token/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const queryText = `
      SELECT id, id_numerico, titulo, categoria, descricao, local, status, image_url, cadastrado_por, criado_em
      FROM itens
      WHERE token_entrada = $1;
    `;
    const resultado = await pool.query(queryText, [token]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum objeto localizado com este token de 6 dígitos.' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar token no banco de dados.' });
  }
});

// =========================================================================
// ROTA COM VALIDAÇÃO: Confirmação Física de Entrada (Libera para o Mural Público)
// =========================================================================
router.post('/confirm-entry', async (req, res) => {
  const { item_id, funcionario_matricula } = req.body;

  if (!item_id || !funcionario_matricula) {
    return res.status(400).json({ error: 'Dados insuficientes para confirmar a entrada do objeto.' });
  }

  try {
    const itemCheck = await pool.query("SELECT cadastrado_por FROM itens WHERE id = $1;", [item_id]);

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Objeto não localizado no banco de dados.' });
    }

    if (itemCheck.rows[0].cadastrado_por === funcionario_matricula) {
      return res.status(400).json({ 
        error: 'Operação Recusada! Por motivos de auditoria, o operador que localizou/cadastrou o item não pode validar a sua própria entrada no estoque.' 
      });
    }

    const queryText = `
      UPDATE itens
      SET status = 'No Estoque'
      WHERE id = $1 AND status = 'Aguardando Balcão'
      RETURNING *;
    `;
    const resultado = await pool.query(queryText, [item_id]);

    if (resultado.rows.length === 0) {
      return res.status(400).json({ error: 'Este item não existe ou já foi validado anteriormente.' });
    }

    await pool.query(
      'INSERT INTO logs_sistema (acao, item_id, funcionario_matricula) VALUES ($1, $2, $3)',
      ['Confirmação física no balcão', item_id, funcionario_matricula]
    );

    res.json({ 
      message: 'Objeto validado com sucesso e adicionado ao Mural público!', 
      item: resultado.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar o status do item.' });
  }
});

// =========================================================================
// ROTA: Iniciar Processo de Devolução (Salva dados do dono e envia e-mail)
// =========================================================================
router.post('/initiate-return', async (req, res) => {
  const { item_id, requerente_matricula, requerente_nome, requerente_email, funcionario_matricula } = req.body;

  if (!item_id || !requerente_matricula || !requerente_nome || !requerente_email || !funcionario_matricula) {
    return res.status(400).json({ error: 'Por favor, preencha todas as informações do requerente.' });
  }

  const token_saida = String(Math.floor(100000 + Math.random() * 900000));

  try {
    const queryText = `
      UPDATE itens 
      SET status = 'Aguardando Retirada', token_saida = $1, requerente_matricula = $2, requerente_nome = $3, requerente_email = $4
      WHERE id = $5 AND status = 'No Estoque' RETURNING *;
    `;
    const resultado = await pool.query(queryText, [token_saida, requerente_matricula, requerente_nome, requerente_email, item_id]);

    if (resultado.rows.length === 0) {
      return res.status(400).json({ error: 'Este item não está disponível no estoque para devolução.' });
    }

    const mailOptions = {
      from: '"ACHEI! Achados e Perdidos" <davimoreiralima2005@gmail.com>',
      to: requerente_email, 
      subject: `Código de Resgate - ${resultado.rows[0].titulo}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2eaf0; border-radius: 12px;">
          <h2 style="color: #10345c;">Olá, ${requerente_nome}!</h2>
          <p>O processo de devolução do seu objeto foi iniciado no balcão central.</p>
          <div style="background-color: #f5f8fb; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 12px; color: #6d7f90; font-weight: bold; display: block; margin-bottom: 5px;">CÓDIGO DE RETIRADA</span>
            <strong style="font-size: 28px; color: #10345c; letter-spacing: 4px;">${token_saida}</strong>
          </div>
          <p style="font-size: 13px; color: #6d7f90;">Apresente esse código de 6 dígitos no balcão físico para concluir o resgate do seu item (${resultado.rows[0].titulo}).</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Erro ao enviar e-mail:', err.message);
      else console.log('E-mail enviado com sucesso para:', requerente_email);
    });

    await pool.query(
      'INSERT INTO logs_sistema (acao, item_id, funcionario_matricula) VALUES ($1, $2, $3)', 
      [`Devolução iniciada para ${requerente_nome} (${requerente_matricula})`, item_id, funcionario_matricula]
    );
    
    res.json({
      message: 'Processo iniciado! O código de saída foi enviado para o e-mail do aluno.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao iniciar devolução no banco de dados.' });
  }
});

// =========================================================================
// ROTA: Buscar objeto pelo Token de Saída (Retirada Final)
// =========================================================================
router.get('/token-exit/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const queryText = "SELECT * FROM itens WHERE token_saida = $1;";
    const resultado = await pool.query(queryText, [token]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum objeto localizado com este token de saída.' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar token de saída.' });
  }
});

// =========================================================================
// ROTA: Confirmar Entrega Física (Muda status para 'Devolvido')
// =========================================================================
router.post('/confirm-delivery', async (req, res) => {
  const { item_id, funcionario_matricula } = req.body;
  try {
    const queryText = `
      UPDATE itens SET status = 'Devolvido'
      WHERE id = $1 AND status = 'Aguardando Retirada' RETURNING *;
    `;
    const resultado = await pool.query(queryText, [item_id]);

    if (resultado.rows.length === 0) {
      return res.status(400).json({ error: 'Este item não está aguardando retirada ou já foi entregue.' });
    }

    await pool.query(
      'INSERT INTO logs_sistema (acao, item_id, funcionario_matricula) VALUES ($1, $2, $3)',
      ['Entrega de objeto concluída com sucesso', item_id, funcionario_matricula]
    );

    res.json({ message: 'Objeto entregue ao dono! Fluxo finalizado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao finalizar entrega no banco.' });
  }
});

// =========================================================================
// ROTA: Leitura completa do histórico de Logs para auditoria
// =========================================================================
router.get('/logs', async (req, res) => {
  try {
    const queryText = `
      SELECT l.id, l.acao, l.funcionario_matricula, l.criado_em, 
             i.titulo AS item_titulo, i.id_numerico AS item_id_numerico
      FROM logs_sistema l
      LEFT JOIN itens i ON l.item_id = i.id
      ORDER BY l.criado_em DESC;
    `;
    const resultado = await pool.query(queryText);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico de auditoria.' });
  }
});

module.exports = router;