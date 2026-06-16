import { useState } from 'react';
import { Send } from 'lucide-react';
import { API_BASE_URL } from '../config'; // <-- Importação dinâmica da URL da API

export default function RegisterView({ user, onItemRegistered }) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [localItem, setLocalItem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegisterItem = async (e) => {
    e.preventDefault();
    if (!titulo || !categoria || !localItem || !descricao) return alert('Preencha tudo!');

    setRegisterLoading(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);
      formData.append('local', localItem);
      formData.append('descricao', descricao);
      formData.append('cadastrado_por', user.matricula);
      if (imagem) formData.append('imagem', imagem);

      const response = await fetch(`${API_BASE_URL}/api/items/register`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao registrar.');
        return;
      }

      onItemRegistered(data.token_entrada); // Dispara a abertura do modal no App.jsx

      // Limpa tudo
      setTitulo(''); setCategoria(''); setLocalItem(''); setDescricao(''); setImagem(null);
      if (document.getElementById('objectImage')) document.getElementById('objectImage').value = '';
    } catch (error) {
      console.error(error);
      alert('Erro de comunicação.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <section className="fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="inline-flex rounded-full px-3 py-1 text-sm font-semibold mb-3 bg-[#fff5e8] text-[#ad6a14]">REGISTRO DIGITAL</span>
        <h2 className="text-3xl font-extrabold text-[#18324a]">Encontrou algo?</h2>
        <p className="text-[#6d7f90] mt-2">Preencha os detalhes e gere o código de 6 dígitos.</p>
      </div>
      <form onSubmit={handleRegisterItem} className="bg-white rounded-[24px] p-5 sm:p-7 border border-[#e2eaf0] soft-shadow grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-[#18324a]">Nome do Objeto</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input-base" type="text" placeholder="Ex: Chaveiro com controle" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#18324a]">Categoria</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input-base" required>
            <option value="">Selecione</option>
            <option>Eletrônicos</option><option>Documentos</option><option>Livros</option><option>Vestuário</option><option>Outros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#18324a]">Local onde achou</label>
          <input value={localItem} onChange={(e) => setLocalItem(e.target.value)} className="input-base" type="text" placeholder="Ex: Bloco B" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-[#18324a]">Descrição Detalhada</label>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input-base min-h-[120px] resize-none" placeholder="Características..." required></textarea>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-[#18324a]">Foto do Objeto</label>
          <input id="objectImage" type="file" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} className="input-base cursor-pointer file:mr-3 file:px-4 file:rounded-xl file:border-0 file:bg-[#e8f1f8] file:text-[#10345c]" />
        </div>
        <button type="submit" disabled={registerLoading} className="sm:col-span-2 w-full rounded-2xl px-5 py-4 font-bold bg-[#10345c] text-white flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50">
          <Send className="w-5 h-5" /> {registerLoading ? 'Processando...' : 'Salvar e Gerar Token'}
        </button>
      </form>
    </section>
  );
}