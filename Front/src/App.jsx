import { useState, useEffect } from 'react';
import { LogOut, Search, PlusCircle, ClipboardList, LayoutDashboard, SearchCheck, PackageCheck } from 'lucide-react';

// Importação dos componentes modulares protegidos
import Login from './components/Login';
import FeedView from './components/FeedView';
import RegisterView from './components/RegisterView';
import MineView from './components/MineView';
import ManagementView from './components/ManagementView';

export default function App() {
  const [user, setUser] = useState(null);   
  const [activeTab, setActiveTab] = useState('feed'); 
  const [feedItems, setFeedItems] = useState([]);
  const [mineItems, setMineItems] = useState([]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('000000');

  // Sincronização centralizada com o banco PostgreSQL
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        if (activeTab === 'feed') {
          const res = await fetch('http://localhost:3000/api/items/feed');
          const data = await res.json();
          if (res.ok && isMounted) setFeedItems(data);
        } else if (activeTab === 'mine') {
          const res = await fetch(`http://localhost:3000/api/items/mine/${user.matricula}`);
          const data = await res.json();
          if (res.ok && isMounted) setMineItems(data);
        }
      } catch (err) {
        console.error('Erro na API:', err);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [activeTab, user]);

  // Bloqueio de segurança: Se deslogado, exibe apenas a tela de autenticação
  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    // pb-32 garante espaço de segurança absoluto para que nenhum card fique preso atrás do menu inferior
    <div className="w-full min-h-screen bg-[#f4f7fa] pb-32 md:pb-24 box-border">
      
      {/* HEADER COMPARTILHADO */}
      <header className="border-b border-[#dfe7ee] bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10345c] text-white flex items-center justify-center shrink-0">
              <SearchCheck className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <h1 className="leading-none font-bold text-[#10345c] text-lg tracking-tight">ACHEI!</h1>
              <p className="text-xs text-[#6d7f90] mt-1 capitalize truncate">{user.nome} • {user.tipo}</p>
            </div>
          </div>
          <button 
            onClick={() => { setUser(null); setActiveTab('feed'); }} 
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#dbe5ec] text-xs font-bold text-[#365269] bg-white hover:bg-[#f5f8fa] transition cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" /> <span>Sair</span>
          </button>
        </div>
      </header>

      {/* RENDERIZADOR DA VIEW ATIVA */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 box-border">
        {activeTab === 'feed' && <FeedView feedItems={feedItems} />}
        {activeTab === 'register' && (
          <RegisterView 
            user={user} 
            onItemRegistered={(token) => { setGeneratedToken(token); setShowSuccessModal(true); }} 
          />
        )}
        {activeTab === 'mine' && <MineView mineItems={mineItems} />}
        {activeTab === 'management' && user.tipo === 'funcionario' && <ManagementView user={user} />}
      </main>

      {/* MODAL GLOBAL DE SUCESSO DE PRÉ-REGISTRO */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[28px] w-full max-w-md p-6 shadow-2xl text-center border border-white">
            <div className="w-16 h-16 rounded-2xl bg-[#eaf8f0] text-[#137b4f] flex items-center justify-center mb-5 mx-auto"><PackageCheck className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-[#10345c]">Item Pré-Registrado!</h3>
            <p className="text-sm text-[#6d7f90] mt-2 leading-relaxed">Apresente este código validador ao funcionário no momento em que for entregar o objeto físico ao balcão.</p>
            <div className="mt-5 rounded-2xl bg-[#f5f8fb] border border-[#dfe8ef] p-4">
              <p className="text-xs text-[#6d7f90] mb-2 font-bold tracking-wider">CÓDIGO DE ENTRADA</p>
              <div className="text-3xl tracking-[0.2em] font-extrabold text-[#10345c] font-mono">{generatedToken}</div>
            </div>
            <button onClick={() => { setShowSuccessModal(false); setActiveTab('mine'); }} className="w-full mt-5 rounded-2xl px-5 py-4 font-bold bg-[#10345c] text-white hover:opacity-95 transition cursor-pointer">Concluir e Ver Meus Itens</button>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO COMPACTA INFERIOR (Z-INDEX IMPEDINDO SOBREPOSIÇÃO) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#dce6ed] shadow-[0_-8px_30px_rgba(15,42,70,0.06)] md:max-w-xl md:mx-auto md:mb-5 md:rounded-2xl md:border box-border">
        <div className={`grid w-full p-2 gap-1.5 ${user.tipo === 'funcionario' ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <button onClick={() => setActiveTab('feed')} className={`px-2 py-2 flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${activeTab === 'feed' ? 'bg-[#e8f1f8] text-[#10345c]' : 'text-[#6d7f90] hover:bg-slate-50'}`}>
            <Search className="w-5 h-5" /> <span>Mural</span>
          </button>
          <button onClick={() => setActiveTab('register')} className={`px-2 py-2 flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${activeTab === 'register' ? 'bg-[#e8f1f8] text-[#10345c]' : 'text-[#6d7f90] hover:bg-slate-50'}`}>
            <PlusCircle className="w-5 h-5" /> <span>Registrar</span>
          </button>
          <button onClick={() => setActiveTab('mine')} className={`px-2 py-2 flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${activeTab === 'mine' ? 'bg-[#e8f1f8] text-[#10345c]' : 'text-[#6d7f90] hover:bg-slate-50'}`}>
            <ClipboardList className="w-5 h-5" /> <span>Meus Itens</span>
          </button>
          {user.tipo === 'funcionario' && (
            <button onClick={() => setActiveTab('management')} className={`px-2 py-2 flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${activeTab === 'management' ? 'bg-[#e8f1f8] text-[#10345c]' : 'text-[#6d7f90] hover:bg-slate-50'}`}>
              <LayoutDashboard className="w-5 h-5" /> <span>Balcão</span>
            </button>
          )}
        </div>
      </nav>

    </div>
  );
}