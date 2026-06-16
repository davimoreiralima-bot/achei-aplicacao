import { Archive, ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config'; // <-- IMPORTAÇÃO DINÂMICA DA API

export default function MineView({ mineItems }) {
  return (
    <section className="fade-in max-w-3xl mx-auto pb-24 text-left">
      {/* Cabeçalho da Seção */}
      <div className="mb-6">
        <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold mb-3 bg-[#e8f1f8] text-[#10345c] tracking-wider uppercase">
          Meu Histórico
        </span>
        <h2 className="text-3xl font-extrabold text-[#18324a]">Minhas Contribuições</h2>
        <p className="text-[#6d7f90] mt-1 text-sm">
          Acompanhe aqui o andamento e o código validador de todos os pertences que você localizou pelo campus.
        </p>
      </div>

      {/* Listagem de Itens Cadastrados */}
      {mineItems.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-dashed border-[#cfdce5] p-12 text-center card-shadow">
          <ClipboardList className="w-8 h-8 text-[#6b7d8c] mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-[#18324a]">Nenhum objeto registrado</h3>
          <p className="text-xs text-[#6d7f90] mt-1 max-w-sm mx-auto">
            Os objetos que você registrar utilizando seu perfil acadêmico aparecerão listados aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mineItems.map((item) => (
            <article 
              key={item.id} 
              className="bg-white rounded-[22px] border border-[#e1e9ef] p-4 card-shadow flex flex-col sm:flex-row sm:items-center gap-4 transition-shadow hover:shadow-md"
            >
              {/* ENVELOPE RÍGIDO ANTI-EXPLOSÃO DE IMAGEM */}
              <div className="w-20 h-20 rounded-xl bg-[#f8fafc] border border-gray-100 overflow-hidden shrink-0 mx-auto sm:mx-0 flex items-center justify-center relative shadow-inner">
                {item.image_url ? (
                  <img 
                    src={`${API_BASE_URL}${item.image_url}`} // <-- URL DINÂMICA AJUSTADA HERE
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Archive className="w-5 h-5 text-[#10345c]/40" />
                )}
              </div>

              {/* Informações e Status do Objeto */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0 text-center sm:text-left">
                    <h3 className="font-bold text-[#18324a] text-lg leading-tight truncate">
                      {item.titulo}
                    </h3>
                    <p className="text-xs text-[#6d7f90] mt-0.5 truncate">
                      {item.categoria} • 📍 {item.local}
                    </p>
                  </div>
                  
                  {/* Badge de Status Dinâmico */}
                  <span className={`w-fit mx-auto sm:mx-0 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide flex items-center gap-1.5 shrink-0 ${
                    item.status === 'No Estoque' 
                      ? 'bg-[#eaf8f0] text-[#137b4f]' 
                      : item.status === 'Devolvido'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-[#fff5e8] text-[#ad6a14]'
                  }`}>
                    {item.status === 'No Estoque' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {item.status}
                  </span>
                </div>

                {/* Bloco de Código de Validação do Balcão */}
                <div className="rounded-xl bg-[#f5f8fb] border border-[#e0e8ee] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                  <div>
                    <p className="text-[10px] text-[#6d7f90] uppercase font-extrabold tracking-wider">
                      Token de Autenticação para Delivery
                    </p>
                    <p className="font-mono font-extrabold tracking-[0.15em] text-[#10345c] text-lg mt-0.5">
                      {item.token_entrada}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#6d7f90] sm:max-w-xs sm:text-right leading-tight">
                    Apresente este código de 6 dígitos no balcão físico para validar o recebimento do item.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}