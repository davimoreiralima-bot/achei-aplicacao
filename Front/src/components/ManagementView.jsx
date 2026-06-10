import { useState, useEffect } from 'react';
import { ScanLine, Search, AlertCircle, CheckCircle2, ArrowRight, UserCheck, Gift, ClipboardList } from 'lucide-react';

export default function ManagementView({ user }) {
  // =========================================================================
  // 1. ESTADOS DE CONTROLE DE ABAS E CARREGAMENTO
  // =========================================================================
  const [managementTab, setManagementTab] = useState('entry');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // =========================================================================
  // 2. ESTADOS: VALIDAR ENTRADA (ABA 1)
  // =========================================================================
  const [tokenInput, setTokenInput] = useState('');
  const [foundItem, setFoundItem] = useState(null);

  // =========================================================================
  // 3. ESTADOS: INICIAR DEVOLUÇÃO (ABA 2)
  // =========================================================================
  const [stockItems, setStockItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [studentNome, setStudentNome] = useState('');   
  const [studentMatricula, setStudentMatricula] = useState('');
  const [studentEmail, setStudentEmail] = useState(''); 
  const [isSentSuccess, setIsSentSuccess] = useState(false); 

  // =========================================================================
  // 4. ESTADOS: CONFIRMAR ENTREGA (ABA 3)
  // =========================================================================
  const [tokenExitInput, setTokenExitInput] = useState('');
  const [deliveryItem, setDeliveryItem] = useState(null);

  // =========================================================================
  // 5. ESTADOS: HISTÓRICO COMPLETO (ABA 4)
  // =========================================================================
  const [systemLogs, setSystemLogs] = useState([]);

  // Limpeza segura ao transicionar entre abas
  const handleTabChange = (tabId) => {
    setManagementTab(tabId);
    
    setTokenInput('');
    setFoundItem(null);
    setSelectedItem(null);
    setStudentNome('');
    setStudentMatricula('');
    setStudentEmail('');
    setIsSentSuccess(false);
    setTokenExitInput('');
    setDeliveryItem(null);
  };

  // =========================================================================
  // 6. EFFECT ASSÍNCRONO: BUSCA DE ESTOQUE (ABA 2)
  // =========================================================================
  useEffect(() => {
    if (managementTab !== 'return') return;

    let isMounted = true;
    const loadStockItems = async () => {
      try {
        const response = await fetch('https://achei-aplicacao.onrender.com/api/items/feed');
        const data = await response.json();
        if (response.ok && isMounted) {
          setStockItems(data);
        }
      } catch (error) {
        console.error('Erro ao buscar estoque da API:', error);
      }
    };

    loadStockItems();
    return () => { isMounted = false; };
  }, [managementTab, refreshTrigger]);

  // =========================================================================
  // 7. EFFECT ASSÍNCRONO: BUSCA DE LOGS (ABA 4)
  // =========================================================================
  useEffect(() => {
    if (managementTab !== 'logs') return;

    let isMounted = true;
    const loadLogs = async () => {
      try {
        const response = await fetch('https://achei-aplicacao.onrender.com/api/items/logs');
        const data = await response.json();
        if (response.ok && isMounted) {
          setSystemLogs(data);
        } else {
          console.error('Erro na resposta da API de logs:', data.error);
        }
      } catch (error) {
        console.error('Erro de conexão ao buscar logs:', error);
      }
    };

    loadLogs();
    return () => { isMounted = false; };
  }, [managementTab]);

  // =========================================================================
  // 8. FUNÇÕES INTERNAS DE PROCESSAMENTO
  // =========================================================================
  const handleSearchToken = async (e) => {
    e.preventDefault();
    if (tokenInput.length !== 6) return alert('O token de entrada precisa ter 6 dígitos.');
    
    setLoading(true);
    setFoundItem(null);
    try {
      const response = await fetch(`https://achei-aplicacao.onrender.com/api/items/token/${tokenInput}`);
      const data = await response.json();
      if (!response.ok) { alert(data.error || 'Erro ao buscar o token.'); return; }
      setFoundItem(data);
    } catch (error) {
      console.error(error);
      alert('Erro de conexão com o servidor.');
    } finally { setLoading(false); }
  };

  const handleConfirmEntry = async () => {
    if (!foundItem) return;
    setLoading(true);
    try {
      const response = await fetch('https://achei-aplicacao.onrender.com/api/items/confirm-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: foundItem.id, funcionario_matricula: user.matricula })
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error); return; }
      alert(data.message);
      setFoundItem(null);
      setTokenInput('');
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleInitiateReturn = async (e) => {
    e.preventDefault();
    if (!selectedItem || !studentMatricula || !studentNome || !studentEmail) {
      return alert('Por favor, preencha todas as informações do requerente.');
    }

    setLoading(true);
    try {
      const response = await fetch('https://achei-aplicacao.onrender.com/api/items/initiate-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          item_id: selectedItem.id, 
          requerente_matricula: studentMatricula, 
          requerente_nome: studentNome,
          requerente_email: studentEmail,
          funcionario_matricula: user.matricula 
        })
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error || 'Erro ao processar.'); return; }
      
      setIsSentSuccess(true); 
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o back-end.');
    } finally { setLoading(false); }
  };

  const handleSearchExitToken = async (e) => {
    e.preventDefault();
    if (tokenExitInput.length !== 6) return alert('O token de saída possui exatamente 6 dígitos.');
    
    setLoading(true);
    setDeliveryItem(null);
    try {
      const response = await fetch(`https://achei-aplicacao.onrender.com/api/items/token-exit/${tokenExitInput}`);
      const data = await response.json();
      if (!response.ok) { alert(data.error || 'Token de saída não localizado.'); return; }
      setDeliveryItem(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleFinalDelivery = async () => {
    if (!deliveryItem) return;
    setLoading(true);
    try {
      const response = await fetch('https://achei-aplicacao.onrender.com/api/items/confirm-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: deliveryItem.id, funcionario_matricula: user.matricula })
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error); return; }
      alert(data.message);
      setDeliveryItem(null);
      setTokenExitInput('');
    } catch (error) { 
      console.error(error); 
      alert('Erro ao conectar com o back-end.');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <section className="fade-in">
      <div className="mb-6 text-left">
        <span className="inline-flex rounded-full px-3 py-1 text-sm font-semibold mb-3 bg-[#eaf8f0] text-[#137b4f]">
          ÁREA ADMINISTRATIVA
        </span>
        <h2 className="text-3xl font-extrabold text-[#18324a]">Gerenciamento do Balcão</h2>
        <p className="text-[#6d7f90] mt-2">Valide a entrada física de itens ou processe devoluções para requerentes.</p>
      </div>

      {/* Abas Superiores */}
      <div className="bg-white rounded-[24px] border border-[#e1e9ef] p-2 mb-6 flex gap-2 card-shadow overflow-x-auto">
        {[
          { id: 'entry', label: 'Validar Entrada' },
          { id: 'return', label: 'Iniciar Devolução' },
          { id: 'confirm', label: 'Confirmar Entrega' },
          { id: 'logs', label: 'Histórico Completo' }
        ].map((subTab) => (
          <button
            key={subTab.id}
            type="button"
            onClick={() => handleTabChange(subTab.id)}
            className={`flex-1 min-w-[150px] rounded-2xl px-4 py-3 font-semibold text-sm transition ${
              managementTab === subTab.id ? 'bg-[#10345c] text-white' : 'text-[#6d7f90] hover:bg-slate-50'
            }`}
          >
            {subTab.label}
          </button>
        ))}
      </div>

      {/* ABA 1: VALIDAR ENTRADA */}
      {managementTab === 'entry' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white rounded-[24px] p-5 sm:p-7 border border-[#e2eaf0] soft-shadow text-center">
            <ScanLine className="w-12 h-12 text-[#10345c] mx-auto mb-4" />
            <h3 className="font-bold text-lg text-[#18324a]">Token de Entrada</h3>
            <p className="text-sm text-[#6d7f90] mt-1 mb-5">Insira o código gerado pelo aluno para confirmar o recebimento do objeto físico no armário.</p>
            <form onSubmit={handleSearchToken} className="max-w-xs mx-auto space-y-4">
              <input maxLength="6" className="input-base text-center tracking-[.3em] text-2xl font-bold uppercase" type="text" placeholder="000000" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} disabled={loading || foundItem} required />
              {!foundItem && (
                <button type="submit" disabled={loading} className="w-full rounded-2xl px-5 py-3 font-bold bg-[#10345c] text-white flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Buscar Item
                </button>
              )}
            </form>
          </div>

          {foundItem && (
            <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#e2eaf0] soft-shadow text-left fade-in space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Objeto Localizado</span>
                  <h4 className="text-xl font-bold text-[#18324a] mt-0.5">{foundItem.titulo}</h4>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${foundItem.status === 'No Estoque' ? 'bg-[#eaf8f0] text-[#137b4f]' : 'bg-[#fff5e8] text-[#ad6a14]'}`}>{foundItem.status}</span>
              </div>
              <div className="text-sm space-y-1.5 text-[#365269]">
                <p><strong>Categoria:</strong> {foundItem.categoria}</p>
                <p><strong>Onde foi achado:</strong> {foundItem.local}</p>
                <p><strong>Descrição:</strong> {foundItem.descricao}</p>
              </div>
              {foundItem.status === 'Aguardando Balcão' ? (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleTabChange('entry')} className="flex-1 rounded-2xl py-3 border text-gray-500 font-bold hover:bg-gray-50 transition">Cancelar</button>
                  <button onClick={handleConfirmEntry} className="flex-1 rounded-2xl py-3 bg-[#137b4f] text-white font-bold hover:opacity-95 transition">Confirmar Estoque</button>
                </div>
              ) : (
                <div className="rounded-xl bg-[#eaf8f0] p-4 text-[#137b4f] font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> O item já se encontra guardado com sucesso no balcão físico.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: INICIAR DEVOLUÇÃO */}
      {managementTab === 'return' && (
        <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-6 text-left items-start">
          <div className="bg-white rounded-[24px] p-5 border border-[#e2eaf0] card-shadow">
            <h3 className="font-bold text-lg text-[#10345c] mb-4">Selecione o Objeto no Estoque</h3>
            {stockItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-12 text-center border border-dashed rounded-xl">Nenhum objeto disponível no estoque no momento.</p>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {stockItems.map((item) => (
                  <button key={item.id} onClick={() => { setSelectedItem(item); setIsSentSuccess(false); }} className={`w-full text-left p-3.5 rounded-xl border transition flex items-center gap-3 ${selectedItem?.id === item.id ? 'border-[#10345c] bg-[#f5f8fb]' : 'border-gray-100 hover:bg-slate-50'}`}>
                    {item.image_url ? <img src={`https://achei-aplicacao.onrender.com${item.image_url}`} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">📦</div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#18324a] truncate text-sm">{item.titulo}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{item.categoria} • {item.local}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {selectedItem ? (
              <div className="bg-white rounded-[24px] p-5 border border-[#e2eaf0] soft-shadow space-y-4 fade-in">
                <div>
                  <span className="text-[10px] font-bold bg-[#e8f1f8] text-[#10345c] px-2.5 py-1 rounded-full uppercase">Item Selecionado</span>
                  <h4 className="font-bold text-[#18324a] text-lg mt-2">{selectedItem.titulo}</h4>
                </div>
                
                {!isSentSuccess ? (
                  <form onSubmit={handleInitiateReturn} className="pt-2 space-y-3 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-[#365269] mb-1.5 uppercase">Nome Completo do Dono</label>
                      <input type="text" placeholder="Digite o nome completo" className="input-base text-sm" value={studentNome} onChange={(e) => setStudentNome(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#365269] mb-1.5 uppercase">Matrícula</label>
                      <input type="text" placeholder="Digite o número de matrícula" className="input-base text-sm" value={studentMatricula} onChange={(e) => setStudentMatricula(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#365269] mb-1.5 uppercase">E-mail para Envio do Token</label>
                      <input type="email" placeholder="aluno@universidade.edu" className="input-base text-sm" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full rounded-xl py-3 font-bold bg-[#10345c] text-white text-sm flex items-center justify-center gap-2 hover:opacity-95 transition">
                      <UserCheck className="w-4 h-4" /> Disparar Código por E-mail
                    </button>
                  </form>
                ) : (
                  <div className="pt-3 border-t border-gray-100 text-center space-y-3 fade-in">
                    <div className="w-10 h-10 rounded-full bg-[#eaf8f0] text-[#137b4f] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-[#137b4f] text-sm">Devolução Iniciada!</h5>
                    <p className="text-xs text-gray-400 leading-5">O token de resgate foi gerado e enviado com sucesso para o e-mail dinâmico do requerente (<strong>{studentEmail}</strong>).</p>
                    <button 
                      type="button"
                      onClick={() => handleTabChange('return')}
                      className="w-full text-xs font-bold text-[#10345c] hover:underline pt-2"
                    >
                      Vincular Próximo Objeto
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#f8fafc] border border-dashed rounded-[24px] p-8 text-center text-gray-400 text-sm">
                Selecione um objeto da lista ao lado para iniciar o processo de vinculação.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: CONFIRMAR ENTREGA */}
      {managementTab === 'confirm' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white rounded-[24px] p-5 sm:p-7 border border-[#e2eaf0] card-shadow text-center">
            <Gift className="w-12 h-12 text-[#137b4f] mx-auto mb-4" />
            <h3 className="font-bold text-lg text-[#18324a]">Token de Saída (Retirada)</h3>
            <p className="text-sm text-[#6d7f90] mt-1 mb-5">Insira o token de 6 dígitos enviado ao e-mail do aluno para liberar o objeto físico do armário.</p>
            
            <form onSubmit={handleSearchExitToken} className="max-w-xs mx-auto space-y-4">
              <input maxLength="6" className="input-base text-center tracking-[.3em] text-2xl font-bold uppercase border-[#137b4f]/30 focus:border-[#137b4f]" type="text" placeholder="000000" value={tokenExitInput} onChange={(e) => setTokenExitInput(e.target.value)} disabled={loading || deliveryItem} required />
              {!deliveryItem && <button type="submit" disabled={loading} className="w-full rounded-2xl px-5 py-3 bg-[#137b4f] text-white font-bold hover:opacity-95 transition"><Search className="w-4 h-4" /> Validar Código</button>}
            </form>
          </div>

          {deliveryItem && (
            <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#e2eaf0] text-left fade-in space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold bg-[#fff5e8] text-[#ad6a14] px-2.5 py-0.5 rounded-full uppercase">Pronto para Devolução</span>
                  <h4 className="text-xl font-bold text-[#18324a] mt-1.5">{deliveryItem.titulo}</h4>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#fff5e8] text-[#ad6a14] shrink-0">{deliveryItem.status}</span>
              </div>
              <div className="space-y-1.5 text-sm text-[#365269]">
                <p><strong>Dono Requerente:</strong> {deliveryItem.requerente_nome} ({deliveryItem.requerente_matricula})</p>
                <p><strong>E-mail de Notificação:</strong> {deliveryItem.requerente_email}</p>
                <p><strong>Local de Origem:</strong> {deliveryItem.local}</p>
              </div>
              {deliveryItem.status === 'Aguardando Retirada' ? (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleTabChange('confirm')} className="flex-1 rounded-2xl py-3 border text-gray-500 font-bold hover:bg-gray-50 transition">Cancelar</button>
                  <button onClick={handleFinalDelivery} disabled={loading} className="flex-1 rounded-2xl py-3 bg-[#137b4f] text-white font-bold hover:opacity-95 transition">Dar Baixa e Entregar</button>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-4 text-gray-500 font-semibold text-sm text-center">Este item já se encontra finalizado com status "{deliveryItem.status}".</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: HISTÓRICO COMPLETO */}
      {managementTab === 'logs' && (
        <div className="w-full bg-white rounded-[24px] border border-[#e2eaf0] card-shadow overflow-hidden text-left fade-in">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f1f8] text-[#10345c] flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#18324a] text-lg">Histórico de Auditoria</h3>
              <p className="text-xs text-[#6d7f90]">Linha do tempo das movimentações realizadas no balcão central.</p>
            </div>
          </div>

          {systemLogs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Nenhum registro de movimentação foi localizado no banco de dados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#365269] font-bold border-b border-gray-100">
                    <th className="p-4 text-left">Data / Hora</th>
                    <th className="p-4 text-left">Ação Realizada</th>
                    <th className="p-4 text-left">Objeto Relacionado</th>
                    <th className="p-4 text-center">Matrícula Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#18324a]">
                  {systemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 text-xs text-[#6d7f90] whitespace-nowrap">
                        {log.criado_em ? new Date(log.criado_em).toLocaleString('pt-BR') : 'Sem data'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          log.acao.includes('Cadastro') ? 'bg-[#fff5e8] text-[#ad6a14]' :
                          log.acao.includes('Confirmação') ? 'bg-[#eaf8f0] text-[#137b4f]' : 'bg-[#e8f1f8] text-[#10345c]'
                        }`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate">
                        {log.item_titulo ? (
                          <span>{log.item_titulo} <span className="text-xs text-gray-400">(#{log.item_id_numerico})</span></span>
                        ) : (
                          <span className="text-gray-300 italic">Item Removido</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-semibold text-xs text-[#365269]">
                        {log.funcionario_matricula}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}