import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

export default function Home() {
  const [hpInicio, setHpInicio] = useState('');
  const [hpFim, setHpFim] = useState('');
  const [hpPreco, setHpPreco] = useState('');
  const [spInicio, setSpInicio] = useState('');
  const [spFim, setSpFim] = useState('');
  const [spPreco, setSpPreco] = useState('');
  const [evpInicio, setEvpInicio] = useState('');
  const [evpFim, setEvpFim] = useState('');
  const [evpPreco, setEvpPreco] = useState('');
  const [bitsInicio, setBitsInicio] = useState('');
  const [bitsFim, setBitsFim] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [historico, setHistorico] = useState([]);

  // Cálculos
  const gastoHP = Math.max(0, (Number(hpInicio) - Number(hpFim))) * Number(hpPreco || 0);
  const gastoSP = Math.max(0, (Number(spInicio) - Number(spFim))) * Number(spPreco || 0);
  const gastoEVP = Math.max(0, (Number(evpInicio) - Number(evpFim))) * Number(evpPreco || 0);
  const bitsAcumulados = Math.max(0, Number(bitsFim) - Number(bitsInicio));
  const totalGasto = gastoHP + gastoSP + gastoEVP;
  const resultado = bitsAcumulados - totalGasto;

  // Calcular duração entre horário início e fim em minutos
  const calcularDuracao = () => {
    if (!horaInicio || !horaFim) return 0;
    
    const [horaI, minI] = horaInicio.split(':').map(Number);
    const [horaF, minF] = horaFim.split(':').map(Number);
    
    const dataInicio = new Date();
    dataInicio.setHours(horaI, minI, 0);
    
    const dataFim = new Date();
    dataFim.setHours(horaF, minF, 0);
    
    // Se a hora de fim for menor, consideramos que passou para o dia seguinte
    if (dataFim < dataInicio) {
      dataFim.setDate(dataFim.getDate() + 1);
    }
    
    const diferencaMs = dataFim - dataInicio;
    return Math.floor(diferencaMs / (1000 * 60));
  };

  const duracao = calcularDuracao();
  
  // Calcular taxa de bits por minuto
  const taxaBits = duracao > 0 ? Math.round(bitsAcumulados / duracao) : 0;
  
  // Função para obter hora atual formatada
  const obterHoraAtual = () => {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  };
  
  // Funções para definir hora atual
  const definirHoraInicio = () => {
    setHoraInicio(obterHoraAtual());
  };
  
  const definirHoraFim = () => {
    setHoraFim(obterHoraAtual());
  };
  
  // Função para salvar no histórico
  const salvarNoHistorico = () => {
    if (!horaInicio || !horaFim || !bitsAcumulados) {
      alert('Preencha os horários e os bits acumulados para salvar no histórico.');
      return;
    }
    
    const novoRegistro = {
      id: Date.now(),
      horaInicio,
      horaFim,
      duracao,
      bitsAcumulados,
      totalGasto,
      resultado,
      taxaBits,
      timestamp: new Date().toLocaleString()
    };
    
    setHistorico(prev => [...prev, novoRegistro]);
    
    // Opcional: Limpar os campos após salvar
    // resetarCampos();
  };
  
  // Preparar dados para o gráfico
  const dadosGrafico = {
    labels: historico.map(item => `${item.horaInicio}-${item.horaFim}`),
    datasets: [
      {
        label: 'Bits por Minuto',
        data: historico.map(item => item.taxaBits),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Resultado (Lucro/Prejuízo)',
        data: historico.map(item => item.resultado),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };
  
  const opcoesGrafico = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance de Farm'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      padding: '20px 10px',
      fontFamily: "'Montserrat', Arial, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        
        .calc-container {
          background: rgba(255,255,255,0.97);
          box-shadow: 0 10px 35px 0 rgba(31,38,135,0.25);
          border-radius: 24px;
          padding: 28px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        
        .calc-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1a365d;
          margin-bottom: 28px;
          letter-spacing: -1px;
          text-align: center;
          text-shadow: 0 2px 8px #e3e9f7;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5f0ff;
        }
        
        .layout-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        
        @media (min-width: 1024px) {
          .layout-container {
            grid-template-columns: 1.5fr 1fr 1fr;
            gap: 24px;
            align-items: start;
          }
        }
        
        .section {
          background: #f8fafc;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.05);
          height: fit-content;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .section-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1a365d;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5f0ff;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .section-icon {
          font-size: 1.5rem;
        }
        
        /* Estilos para a calculadora */
        .fields-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        
        .fieldset {
          border: none;
          background: #fff;
          border-radius: 14px;
          margin-bottom: 0;
          padding: 22px;
          box-shadow: 0 2px 8px 0 rgba(44,83,100,0.06);
        }
        
        .legend {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c5364;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e9eef6;
        }
        
        .field-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }
        
        .input-label {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
          font-size: 1rem;
          color: #4a5568;
        }
        
        .input-field {
          height: 44px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          padding: 0 16px;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
          margin-top: 6px;
          width: 100%;
        }
        
        .input-field:focus {
          border-color: #4299e1;
          box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
          outline: none;
        }
        
        .button-row {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        
        .button {
          background: #2c5364;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 140px;
        }
        
        .button:hover {
          background: #1a365d;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .button-save {
          background: #38a169;
        }
        
        .button-save:hover {
          background: #2f855a;
        }
        
        .button-clear {
          background: #e53e3e;
        }
        
        .button-clear:hover {
          background: #c53030;
        }
        
        .time-section {
          margin-top: 18px;
          padding: 22px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 8px 0 rgba(44,83,100,0.06);
        }
        
        .time-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .time-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .time-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .time-button {
          padding: 8px 14px;
          min-width: auto;
        }
        
        /* Estilos para os resultados */
        .result-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          padding: 12px;
          border-radius: 10px;
          transition: background 0.2s;
          background: #fff;
        }
        
        .result-row:hover {
          background: #f0f7ff;
        }
        
        .result-row:last-child {
          margin-bottom: 0;
        }
        
        .result-label {
          flex: 1;
          color: #4a5568;
          margin-left: 8px;
          font-weight: 500;
        }
        
        .result-value {
          font-weight: 600;
          color: #2d3748;
          font-size: 1.05rem;
          text-align: right;
          padding-right: 8px;
        }
        
        .result-highlight {
          font-size: 1.2rem;
          margin-top: 18px;
          padding: 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .result-positive {
          font-weight: 700;
          color: #38a169;
        }
        
        .result-negative {
          font-weight: 700;
          color: #e53e3e;
        }
        
        .icon {
          display: inline-block;
          font-size: 1.2rem;
        }
        
        /* Estilos para os gráficos e histórico */
        .stats-scroll {
          overflow-y: auto;
          max-height: 700px;
          padding-right: 5px;
        }
        
        .chart-wrapper {
          background: #fff;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }
        
        .stat-card {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c5364;
          margin: 6px 0;
        }
        
        .stat-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #4a5568;
        }
        
        .history-list {
          margin-top: 20px;
        }
        
        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .history-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c5364;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .history-item {
          background: #fff;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .history-item:last-child {
          margin-bottom: 0;
        }
        
        .history-head {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 10px;
        }
        
        .history-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .history-stat {
          font-size: 0.9rem;
          color: #4a5568;
          padding: 4px;
        }
        
        .empty-history {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
          font-size: 0.95rem;
          background: #fff;
          border-radius: 12px;
        }
        
        .empty-history-icon {
          font-size: 3rem;
          margin-bottom: 10px;
          opacity: 0.7;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .calc-container {
            padding: 20px 16px;
          }
          
          .calc-title {
            font-size: 1.8rem;
            margin-bottom: 20px;
          }
          
          .section {
            padding: 18px;
          }
          
          .section-title {
            font-size: 1.3rem;
          }
        }
        
        @media (max-width: 480px) {
          .history-details {
            grid-template-columns: 1fr;
          }
          
          .button {
            width: 100%;
          }
        }
        
        /* Estilos para scrollbar personalizada */
        .stats-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .stats-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .stats-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .stats-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Área do resumo de tempo */
        .time-summary {
          margin-top: 16px;
          background: #fff;
          padding: 14px;
          border-radius: 12px;
        }
        
        .time-result-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .time-result-row:last-child {
          margin-bottom: 0;
        }
      `}</style>

      <div className="calc-container">
        <h1 className="calc-title">💰 Calculadora de Farm Digimon 💰</h1>
        
        <div className="layout-container">
          {/* Seção 1: Calculadora (Inputs) */}
          <section className="section">
            <h2 className="section-title">
              <span className="section-icon">🧮</span> Calculadora
            </h2>
            
            <form>
              <div className="fields-grid">
                {/* HP Fieldset */}
                <fieldset className="fieldset">
                  <div className="legend">
                    <span className="icon" role="img" aria-label="hp">❤️</span> HP
                  </div>
                  <div className="field-row">
                    <label className="input-label">Início:
                      <input className="input-field" type="number" value={hpInicio} onChange={e => setHpInicio(e.target.value)} />
                    </label>
                    <label className="input-label">Fim:
                      <input className="input-field" type="number" value={hpFim} onChange={e => setHpFim(e.target.value)} />
                    </label>
                  </div>
                  <label className="input-label">Preço por unidade:
                    <input className="input-field" type="number" value={hpPreco} onChange={e => setHpPreco(e.target.value)} />
                  </label>
                </fieldset>
                
                {/* SP Fieldset */}
                <fieldset className="fieldset">
                  <div className="legend">
                    <span className="icon" role="img" aria-label="sp">💧</span> SP
                  </div>
                  <div className="field-row">
                    <label className="input-label">Início:
                      <input className="input-field" type="number" value={spInicio} onChange={e => setSpInicio(e.target.value)} />
                    </label>
                    <label className="input-label">Fim:
                      <input className="input-field" type="number" value={spFim} onChange={e => setSpFim(e.target.value)} />
                    </label>
                  </div>
                  <label className="input-label">Preço por unidade:
                    <input className="input-field" type="number" value={spPreco} onChange={e => setSpPreco(e.target.value)} />
                  </label>
                </fieldset>
                
                {/* EVP Fieldset */}
                <fieldset className="fieldset">
                  <div className="legend">
                    <span className="icon" role="img" aria-label="evp">⚡</span> EVP
                  </div>
                  <div className="field-row">
                    <label className="input-label">Início:
                      <input className="input-field" type="number" value={evpInicio} onChange={e => setEvpInicio(e.target.value)} />
                    </label>
                    <label className="input-label">Fim:
                      <input className="input-field" type="number" value={evpFim} onChange={e => setEvpFim(e.target.value)} />
                    </label>
                  </div>
                  <label className="input-label">Preço por unidade:
                    <input className="input-field" type="number" value={evpPreco} onChange={e => setEvpPreco(e.target.value)} />
                  </label>
                </fieldset>
                
                {/* Bits Fieldset */}
                <fieldset className="fieldset">
                  <div className="legend">
                    <span className="icon" role="img" aria-label="bits">💰</span> Bits
                  </div>
                  <div className="field-row">
                    <label className="input-label">Início:
                      <input className="input-field" type="number" value={bitsInicio} onChange={e => setBitsInicio(e.target.value)} />
                    </label>
                    <label className="input-label">Fim:
                      <input className="input-field" type="number" value={bitsFim} onChange={e => setBitsFim(e.target.value)} />
                    </label>
                  </div>
                </fieldset>
                
                {/* Time Section */}
                <div className="time-section">
                  <div className="legend">
                    <span className="icon" role="img" aria-label="time">⏱️</span> Tempo de Farm
                  </div>
                  <div className="time-grid">
                    <div>
                      <div className="input-label">Horário de início:</div>
                      <div className="time-controls">
                        <input 
                          className="input-field" 
                          type="time" 
                          value={horaInicio} 
                          onChange={e => setHoraInicio(e.target.value)} 
                          style={{ flex: 1 }} 
                        />
                        <button 
                          type="button" 
                          className="button time-button" 
                          onClick={definirHoraInicio}
                        >
                          Agora
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="input-label">Horário de fim:</div>
                      <div className="time-controls">
                        <input 
                          className="input-field" 
                          type="time" 
                          value={horaFim} 
                          onChange={e => setHoraFim(e.target.value)} 
                          style={{ flex: 1 }} 
                        />
                        <button 
                          type="button" 
                          className="button time-button" 
                          onClick={definirHoraFim}
                        >
                          Agora
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="time-summary">
                    <div className="time-result-row">
                      <span className="icon" role="img" aria-label="clock">🕒</span>
                      <span className="result-label">Tempo total:</span>
                      <span className="result-value">
                        {duracao} minutos ({Math.floor(duracao / 60)}h {duracao % 60}min)
                      </span>
                    </div>
                    <div className="time-result-row">
                      <span className="icon" role="img" aria-label="speed">⚡</span>
                      <span className="result-label">Taxa média:</span>
                      <span className="result-value">{taxaBits} bits/min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="button-row">
                <button
                  type="button"
                  className="button button-save"
                  onClick={salvarNoHistorico}
                >
                  💾 Salvar no Histórico
                </button>
                <button
                  type="button"
                  className="button button-clear"
                  onClick={() => {
                    const inputs = document.querySelectorAll('input');
                    inputs.forEach(input => input.value = '');
                    
                    setHpInicio('');
                    setHpFim('');
                    setHpPreco('');
                    setSpInicio('');
                    setSpFim('');
                    setSpPreco('');
                    setEvpInicio('');
                    setEvpFim('');
                    setEvpPreco('');
                    setBitsInicio('');
                    setBitsFim('');
                    setHoraInicio('');
                    setHoraFim('');
                  }}
                >
                  🗑️ Limpar Campos
                </button>
              </div>
            </form>
          </section>
          
          {/* Seção 2: Resultados */}
          <section className="section">
            <h2 className="section-title">
              <span className="section-icon">📊</span> Resultados
            </h2>
            
            <div>
              <div className="result-row">
                <span className="icon" role="img" aria-label="hp">❤️</span>
                <span className="result-label">Gasto com HP:</span>
                <span className="result-value">{gastoHP}</span>
              </div>
              <div className="result-row">
                <span className="icon" role="img" aria-label="sp">💧</span>
                <span className="result-label">Gasto com SP:</span>
                <span className="result-value">{gastoSP}</span>
              </div>
              <div className="result-row">
                <span className="icon" role="img" aria-label="evp">⚡</span>
                <span className="result-label">Gasto com EVP:</span>
                <span className="result-value">{gastoEVP}</span>
              </div>
              <div className="result-row">
                <span className="icon" role="img" aria-label="bits">💰</span>
                <span className="result-label">Bits acumulados:</span>
                <span className="result-value">{bitsAcumulados}</span>
              </div>
              <div className="result-row">
                <span className="icon" role="img" aria-label="total">🧾</span>
                <span className="result-label">Total gasto:</span>
                <span className="result-value">{totalGasto}</span>
              </div>
            </div>
            
            <div className="result-highlight">
              <span className="icon" role="img" aria-label="resultado" style={{ fontSize: '1.4rem', marginRight: '10px' }}>🏆</span>
              <span className="result-label">Resultado do farm:</span>
              <span className={resultado >= 0 ? "result-positive" : "result-negative"}>
                {resultado >= 0 ? `+${resultado}` : resultado}
              </span>
            </div>
            
            {/* Estatísticas gerais quando há histórico */}
            {historico.length > 0 && (
              <div className="summary-stats" style={{ marginTop: '24px' }}>
                <div className="stat-card">
                  <div className="stat-label">Taxa Média Total</div>
                  <div className="stat-value">
                    {Math.round(historico.reduce((acc, item) => acc + item.taxaBits, 0) / historico.length)} bits/min
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Melhor Taxa</div>
                  <div className="stat-value">
                    {Math.max(...historico.map(item => item.taxaBits))} bits/min
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Lucro Total</div>
                  <div className={`stat-value ${historico.reduce((acc, item) => acc + item.resultado, 0) >= 0 ? 'result-positive' : 'result-negative'}`}>
                    {historico.reduce((acc, item) => acc + item.resultado, 0)}
                  </div>
                </div>
              </div>
            )}
          </section>
          
          {/* Seção 3: Gráfico e Histórico */}
          <section className="section">
            <h2 className="section-title">
              <span className="section-icon">📈</span> Gráfico e Histórico
            </h2>
            
            <div className="stats-scroll">
              {historico.length > 0 ? (
                <>
                  <div className="chart-wrapper">
                    <div style={{ width: '100%', height: '250px' }}>
                      <Line data={dadosGrafico} options={{...opcoesGrafico, maintainAspectRatio: false}} />
                    </div>
                  </div>
                  
                  <div className="history-list">
                    <div className="history-header">
                      <h3 className="history-title">
                        <span className="icon" role="img" aria-label="history">📜</span> Histórico de Sessões
                      </h3>
                      <button 
                        className="button"
                        style={{ padding: '6px 10px', fontSize: '0.85rem', minWidth: 'auto' }}
                        onClick={() => setHistorico([])}
                      >
                        Limpar
                      </button>
                    </div>
                    
                    {historico.map((item, index) => (
                      <div key={item.id} className="history-item">
                        <div className="history-head">
                          Sessão {index + 1} - {item.timestamp}
                        </div>
                        <div className="history-details">
                          <div className="history-stat">⏱️ {item.horaInicio} a {item.horaFim}</div>
                          <div className="history-stat">⌛ Duração: {item.duracao} min</div>
                          <div className="history-stat">💰 Bits: {item.bitsAcumulados}</div>
                          <div className="history-stat">💸 Gastos: {item.totalGasto}</div>
                          <div className={`history-stat ${item.resultado >= 0 ? "result-positive" : "result-negative"}`} style={{ gridColumn: "span 2", fontWeight: "600" }}>
                            🏆 Resultado: {item.resultado >= 0 ? `+${item.resultado}` : item.resultado}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-history">
                  <div className="empty-history-icon">📊</div>
                  <p>Ainda não há sessões no histórico.</p>
                  <p>Preencha os dados e clique em "Salvar no Histórico".</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
