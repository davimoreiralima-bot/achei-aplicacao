// Chave seletora inteligente de ambiente
export const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://achei-aplicacao.onrender.com';