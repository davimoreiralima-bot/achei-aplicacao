import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'; // <-- Importação dinâmica da URL da API

export default function NotificationView({ user }) {
  const [emailNotificacao, setEmailNotificacao] = useState('');
  const [preferences, setPreferences] = useState({
    eletronicos: false,
    documentos: false,
    livros: false,
    vestuario: false,
    outros: false,
  });
  const [saved, setSaved] = useState(false);

  // Carrega as configurações direto do banco ao abrir a tela
  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE_URL}/api/notifications/preferences/${user.matricula}`)
      .then((res) => res.json())
      .then((data) => {
        setEmailNotificacao(data.email_notificacao || '');
        setPreferences({
          eletronicos: data.eletronicos || false,
          documentos: data.documentos || false,
          livros: data.livros || false,
          vestuario: data.vestuario || false,
          outros: data.outros || false,
        });
      })
      .catch((err) => console.error('Erro ao carregar dados:', err));
  }, [user]);

  const handleCheckboxChange = (category) => {
    setPreferences({
      ...preferences,
      [category]: !preferences[category],
    });
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: user.matricula,
          email_notificacao: emailNotificacao,
          ...preferences,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar no banco:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#10345c', borderBottom: '2px solid #10345c', paddingBottom: '10px', fontWeight: 'bold' }}>
        🔔 Sistema de Notificações
      </h2>
      <p style={{ color: '#555', fontSize: '14px', marginTop: '10px' }}>
        Configure seus alertas personalizados abaixo. Você poderá alterar o e-mail e as categorias de interesse sempre que desejar.
      </p>

      <form onSubmit={handleSave} style={{ marginTop: '20px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        
        {/* NOVO CAMPO: INPUT DO E-MAIL CUSTOMIZADO */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
            E-mail para Receber Avisos:
          </label>
          <input
            type="email"
            required
            placeholder="exemplo@email.com"
            value={emailNotificacao}
            onChange={(e) => { setEmailNotificacao(e.target.value); setSaved(false); }}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #dfe6ed',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none',
              accentColor: '#10345c'
            }}
          />
        </div>

        <h3 style={{ fontSize: '15px', marginBottom: '12px', color: '#333', fontWeight: 'bold' }}>
          Categorias de Interesse:
        </h3>
        
        {Object.keys(preferences).map((category) => (
          <label key={category} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', textTransform: 'capitalize', fontSize: '15px', color: '#444' }}>
            <input
              type="checkbox"
              checked={preferences[category]}
              onChange={() => handleCheckboxChange(category)}
              style={{ marginRight: '10px', width: '18px', height: '18px', accentColor: '#10345c' }}
            />
            {category}
          </label>
        ))}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            background: '#10345c',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Salvar Configurações
        </button>
      </form>

      {saved && (
        <div style={{ marginTop: '15px', padding: '12px', background: '#D4EDDA', color: '#155724', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #C3E6CB' }}>
          ✓ Configurações e e-mail salvos com sucesso!
        </div>
      )}
    </div>
  );
}