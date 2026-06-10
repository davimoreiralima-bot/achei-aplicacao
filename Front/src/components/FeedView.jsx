import { useState } from 'react';
import { Search, PackageCheck, Archive, X, MapPin, Calendar, Tag } from 'lucide-react';

export default function FeedView({ feedItems }) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); // Estado para controlar o modal de detalhes

  const filteredItems = feedItems
    .filter(item => activeCategory === 'Todos' || item.categoria === activeCategory)
    .filter(item => item.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <section className="fade-in pb-12">
      {/* Cabeçalho do Feed */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
        <div className="text-left">
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold mb-3 bg-[#e8f1f8] text-[#10345c] tracking-wider uppercase">
            Mural do Campus
          </span>
          <h2 className="leading-tight tracking-[-0.03em] text-3xl font-extrabold text-[#18324a]">
            Objetos Localizados
          </h2>
          <p className="text-[#6d7f90] mt-1.5 text-sm max-w-2xl">
            Clique sobre qualquer objeto para visualizar os detalhes completos e instruções de retirada no balcão central.
          </p>
        </div>
        <div className="rounded-2xl px-4 py-3 bg-white border border-[#e3ebf0] flex items-center gap-3 card-shadow w-fit shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#eaf8f0] text-[#137b4f] flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-[#10345c] text-sm leading-tight">
              {filteredItems.length} disponíveis
            </p>
            <p className="text-xs text-[#6d7f90]">prontos para devolução</p>
          </div>
        </div>
      </div>

      {/* Filtros e Barra de Busca */}
      <div className="bg-white rounded-[22px] border border-[#e0e8ee] p-4 card-shadow mb-8 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-[#7c8e9d] absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            className="input-base pl-12 bg-[#f8fafc] border-gray-200/80 focus:bg-white text-sm" 
            placeholder="Buscar por nome, bloco, características..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {['Todos', 'Eletrônicos', 'Documentos', 'Livros', 'Vestuário', 'Outros'].map((cat) => (
            <button 
              key={cat} 
              type="button" 
              onClick={() => setActiveCategory(cat)} 
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-[#10345c] text-white border-[#10345c] shadow-sm shadow-[#10345c]/20' 
                  : 'border-[#d9e3ea] text-[#18324a] bg-white hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Exibição dos Itens */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-dashed border-[#cfdce5] p-12 text-center card-shadow">
          <Search className="w-8 h-8 text-[#6b7d8c] mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-[#18324a]">Nenhum item localizado</h3>
          <p className="text-xs text-[#6d7f90] mt-1 max-w-sm mx-auto">Não encontramos correspondências para a sua busca ou o estoque está vazio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              type="button"
              className="overflow-hidden rounded-[22px] bg-white border border-[#e1e9ef] card-shadow text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col group cursor-pointer"
            >
              {/* Contêiner de Imagem com Tamanho Rígido Proporcional */}
              <div className="w-full h-44 bg-[#f8fafc] flex items-center justify-center overflow-hidden border-b border-gray-100/60 shrink-0 relative">
                {item.image_url ? (
                  <img 
                    src={`http://localhost:3000${item.image_url}`} 
                    alt={item.titulo} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
                    <Archive className="w-8 h-8 text-[#10345c]" />
                    <span className="text-[10px] font-bold tracking-wider">SEM FOTO</span>
                  </div>
                )}
                <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-md">
                  #{item.id_numerico}
                </span>
              </div>

              {/* Informações Resumidas do Card */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white w-full">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-[#6d7f90] uppercase tracking-wider block truncate">
                    {item.categoria}
                  </span>
                  <h3 className="font-bold text-[#18324a] text-base leading-tight truncate group-hover:text-[#10345c] transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-[#6d7f90] text-xs line-clamp-2 mt-1 leading-relaxed">
                    {item.descricao}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-[#6d7f90] w-full min-w-0">
                  <span className="truncate flex items-center gap-1">📍 <span className="truncate">{item.local}</span></span>
                  <span className="shrink-0 font-medium">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL INTERATIVO DE DETALHES COMPLETOS DO OBJETO
          ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl border border-white flex flex-col max-h-[90vh] text-left relative animate-scale-up">
            
            {/* Botão Flutuante de Fechar */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner de Imagem Expandida no Modal */}
            <div className="w-full h-64 bg-[#f8fafc] flex items-center justify-center overflow-hidden border-b shrink-0 relative">
              {selectedItem.image_url ? (
                <img 
                  src={`http://localhost:3000${selectedItem.image_url}`} 
                  alt={selectedItem.titulo} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <Archive className="w-12 h-12 text-[#10345c]" />
                  <span className="text-xs font-bold tracking-wider">IMAGEM NÃO REGISTRADA VIA APP</span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-[#137b4f] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                📌 {selectedItem.status}
              </div>
            </div>

            {/* Painel de Informações Expandidas */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#6d7f90] tracking-wider uppercase">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{selectedItem.categoria} • Identificador #{selectedItem.id_numerico}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#18324a] leading-tight">
                  {selectedItem.titulo}
                </h3>
              </div>

              <div className="space-y-2 bg-[#f5f8fb] border border-[#e0e8ee] rounded-2xl p-4 text-sm text-[#365269]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#10345c] shrink-0" />
                  <p><strong>Encontrado em:</strong> {selectedItem.local}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Calendar className="w-4 h-4 text-[#10345c] shrink-0" />
                  <p><strong>Data de Entrada:</strong> {new Date(selectedItem.criado_em).toLocaleDateString('pt-BR')} às {new Date(selectedItem.criado_em).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#18324a] uppercase tracking-wider">Descrição das Características</h4>
                <p className="text-sm text-[#52667a] leading-relaxed bg-slate-50 rounded-2xl p-4 border border-gray-100">
                  {selectedItem.descricao}
                </p>
              </div>
            </div>

            {/* Rodapé de Instrução do Modal */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
              <p className="text-[11px] text-[#6d7f90] text-center w-full font-medium">
                Dono deste objeto? Vá ao Balcão Central do campus e informe o identificador <strong>#{selectedItem.id_numerico}</strong>.
              </p>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}