import { useState } from 'react';
import { SearchCheck, GraduationCap, BadgeCheck } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState('role'); 
  const [role, setRole] = useState(null);   
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!matricula || !senha) return alert('Por favor, preencha todos os campos.');
    
    setAuthLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula, senha, tipo: role })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao realizar login.');
        return;
      }

      alert(data.message);
      onLoginSuccess(data.user); // Avisa o App.jsx que o usuário logou
    } catch (error) {
      console.error(error);
      alert('Não foi possível conectar ao servidor back-end.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8">
      <main className="w-full max-w-6xl grid lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-14 items-center">
        
        {/* Lado Esquerdo */}
        <div className="fade-in">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[#10345c] soft-shadow">
              <SearchCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="leading-none tracking-tight text-2xl font-extrabold text-[#10345c]">ACHEI!</h1>
              <p className="text-xs text-[#6d7f90] mt-1">Achados e Perdidos</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold mb-4 bg-[#e8f1f8] text-[#10345c]">
            CAMPUS MAIS CONECTADO
          </span>
          <h2 className="leading-[1.08] tracking-[-0.03em] max-w-xl text-4xl sm:text-5xl font-extrabold text-[#18324a]">
            Perdeu ou encontrou? A gente aproxima você do que importa.
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-[#6d7f90]">
            O ACHEI! ajuda alunos e funcionários a registrar, localizar e devolver objetos de forma simples e segura.
          </p>
        </div>

        {/* Lado Direito */}
        <div className="bg-white rounded-[28px] p-5 sm:p-7 soft-shadow border border-white shadow-lg fade-in">
          {step === 'role' ? (
            <div>
              <div>
                <h2 className="text-[26px] font-bold text-[#10345c] tracking-tight">Acesse o ambiente de teste</h2>
                <p className="text-sm text-[#6d7f90] mt-2">Escolha um perfil para explorar o sistema.</p>
              </div>
              <div className="mt-6 space-y-3">
                <button onClick={() => { setRole('aluno'); setStep('credentials'); }} type="button" className="w-full rounded-2xl px-5 py-4 font-semibold flex items-center justify-center gap-3 transition bg-[#10345c] text-white hover:opacity-90"> 
                  <GraduationCap className="w-5 h-5 shrink-0" /> <span>Entrar como Aluno</span> 
                </button> 
                <button onClick={() => { setRole('funcionario'); setStep('credentials'); }} type="button" className="w-full rounded-2xl px-5 py-4 font-semibold flex items-center justify-center gap-3 border-2 border-[#10345c] text-[#10345c] transition hover:bg-[#10345c]/5"> 
                  <BadgeCheck className="w-5 h-5 shrink-0" /> <span>Entrar como Funcionário</span> 
                </button>
              </div>
            </div>
          ) : (
            <div className="fade-in">
              <h2 className="font-bold text-[#10345c] text-[25px] leading-none tracking-tight capitalize">Acesso - {role}</h2>
              <form onSubmit={handleSubmitLogin} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#29445a] mb-2">Matrícula</label> 
                  <input type="text" className="input-base" placeholder="Digite sua matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#29445a] mb-2">Senha</label> 
                  <input type="password" className="input-base" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setStep('role'); setMatricula(''); setSenha(''); }} type="button" className="flex-1 rounded-2xl px-5 py-3 font-semibold border-2 border-[#d9e3ea] text-[#10345c] hover:bg-[#f5f8fa] transition">Voltar</button> 
                  <button type="submit" disabled={authLoading} className="flex-1 rounded-2xl px-5 py-3 font-semibold bg-[#10345c] text-white hover:opacity-90 transition disabled:opacity-50">
                    {authLoading ? 'Verificando...' : 'Entrar'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}