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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Montserrat', Arial, sans-serif",
      transition: 'background 1s',
      padding: '30px 10px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap');
        .calc-container {
          background: rgba(255,255,255,0.97);
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          border-radius: 20px;
          padding: 32px 24px 24px 24px;
          max-width: 800px;
          width: 100%;
          animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .calc-title {
          font-size: 2.1rem;
          font-weight: 700;
          color: #1a365d;
          margin-bottom: 18px;
          letter-spacing: -1px;
          text-align: center;
          text-shadow: 0 2px 8px #e3e9f7;
        }
        .fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 18px;
        }
        .fieldset {
          border: none;
          background: #f7fafd;
          border-radius: 14px;
          margin-bottom: 0;
          padding: 14px 14px 6px 14px;
          box-shadow: 0 2px 8px 0 rgba(44,83,100,0.06);
        }
        .legend {
          font-size: 1.08rem;
          font-weight: 600;
          color: #2c5364;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .input-label {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
          font-size: 0.95rem;
          color: #4a5568;
        }
        .input-field {
          height: 38px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 0 12px;
          font-size: 0.95rem;
          transition: all 0.2s;
          background: white;
        }
        .input-field:focus {
          border-color: #4299e1;
          box-shadow: 0 0 0 1px #4299e1;
          outline: none;
        }
        .button {
          background: #2c5364;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
        }
        .button:hover {
          background: #1a365d;
          transform: translateY(-1px);
        }
        .time-section {
          margin: 20px 0;
          padding: 14px;
          background: #f7fafd;
          border-radius: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .time-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .results {
          margin-top: 24px;
          background: #f7fafd;
          border-radius: 14px;
          padding: 16px;
        }
        .results-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c5364;
          margin-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .result-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        .result-label {
          flex: 1;
          color: #4a5568;
          margin-left: 8px;
        }
        .result-value {
          font-weight: 600;
          color: #2d3748;
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
          margin-right: 4px;
          font-size: 1.1em;
        }
        .chart-container {
          margin-top: 24px;
          background: #f7fafd;
          border-radius: 14px;
          padding: 16px;
        }
        .history-container {
          margin-top: 24px;
          background: #f7fafd;
          border-radius: 14px;
          padding: 16px;
          max-height: 300px;
          overflow-y: auto;
        }
        .history-item {
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        .history-item:last-child {
          border-bottom: none;
        }
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
        }
        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2c5364;
          margin: 4px 0;
        }
        .stat-label {
          font-size: 0.85rem;
          color: #4a5568;
        }
      `}</style>

      <div className="calc-container">
        <h1 className="calc-title">💰 Calculadora de Farm Digimon 💰</h1>
        
        <form>
          <div className="fields-grid">
            <fieldset className="fieldset">
              <legend className="legend">HP</legend>
              <label className="input-label">Início:
                <input className="input-field" type="number" value={hpInicio} onChange={e => setHpInicio(e.target.value)} />
              </label>
              <label className="input-label">Fim:
                <input className="input-field" type="number" value={hpFim} onChange={e => setHpFim(e.target.value)} />
              </label>
              <label className="input-label">Preço por unidade:
                <input className="input-field" type="number" value={hpPreco} onChange={e => setHpPreco(e.target.value)} />
              </label>
            </fieldset>
            
            <fieldset className="fieldset">
              <legend className="legend">SP</legend>
              <label className="input-label">Início:
                <input className="input-field" type="number" value={spInicio} onChange={e => setSpInicio(e.target.value)} />
              </label>
              <label className="input-label">Fim:
                <input className="input-field" type="number" value={spFim} onChange={e => setSpFim(e.target.value)} />
              </label>
              <label className="input-label">Preço por unidade:
                <input className="input-field" type="number" value={spPreco} onChange={e => setSpPreco(e.target.value)} />
              </label>
            </fieldset>
            
            <fieldset className="fieldset">
              <legend className="legend">EVP</legend>
              <label className="input-label">Início:
                <input className="input-field" type="number" value={evpInicio} onChange={e => setEvpInicio(e.target.value)} />
              </label>
              <label className="input-label">Fim:
                <input className="input-field" type="number" value={evpFim} onChange={e => setEvpFim(e.target.value)} />
              </label>
              <label className="input-label">Preço por unidade:
                <input className="input-field" type="number" value={evpPreco} onChange={e => setEvpPreco(e.target.value)} />
              </label>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="legend">Bits</legend>
              <label className="input-label">Início:
                <input className="input-field" type="number" value={bitsInicio} onChange={e => setBitsInicio(e.target.value)} />
              </label>
              <label className="input-label">Fim:
                <input className="input-field" type="number" value={bitsFim} onChange={e => setBitsFim(e.target.value)} />
              </label>
            </fieldset>
          </div>
          
          <div className="time-section">
            <div>
              <legend className="legend">Horário de Início/Fim</legend>
              <div className="time-controls">
                <input 
                  className="input-field" 
                  type="time" 
                  value={horaInicio} 
                  onChange={e => setHoraInicio(e.target.value)} 
                />
                <button 
                  type="button" 
                  className="button" 
                  onClick={definirHoraInicio}
                >
                  Agora
                </button>
              </div>
              <div className="time-controls" style={{ marginTop: '10px' }}>
                <input 
                  className="input-field" 
                  type="time" 
                  value={horaFim} 
                  onChange={e => setHoraFim(e.target.value)} 
                />
                <button 
                  type="button" 
                  className="button" 
                  onClick={definirHoraFim}
                >
                  Agora
                </button>
              </div>
            </div>
            <div>
              <div className="results-title">
                <span className="icon" role="img" aria-label="time">⏱️</span> Duração
              </div>
              <div className="result-row">
                <span className="icon" role="img" aria-label="clock">🕒</span>
                <span className="result-label">Tempo total:</span>
                <span className="result-value">
                  {duracao} minutos ({Math.floor(duracao / 60)}h {duracao % 60}min)
                </span>
              </div>
              <div className="result-row">
                <span className="icon" role="img" aria-label="speed">⚡</span>
                <span className="result-label">Taxa média de bits:</span>
                <span className="result-value">{taxaBits} bits/min</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              type="button"
              className="button"
              onClick={salvarNoHistorico}
              style={{ backgroundColor: '#38a169' }}
            >
              💾 Salvar no Histórico
            </button>
            <button
              type="button"
              className="button"
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
              style={{ backgroundColor: '#e53e3e' }}
            >
              🗑️ Limpar Campos
            </button>
          </div>
        </form>
        
        <div className="results">
          <div className="results-title">
            <span className="icon" role="img" aria-label="resultados">📊</span> Resultados
          </div>
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
          <div className="result-row" style={{ fontSize: '1.18rem', marginTop: 10 }}>
            <span className="icon" role="img" aria-label="resultado">🏆</span>
            <span className="result-label">Resultado do farm:</span>
            <span className={resultado >= 0 ? "result-positive" : "result-negative"}>
              {resultado >= 0 ? `+${resultado}` : resultado}
            </span>
          </div>
        </div>
        
        {historico.length > 0 && (
          <>
            <div className="chart-container">
              <div className="results-title">
                <span className="icon" role="img" aria-label="chart">📈</span> Gráfico de Performance
              </div>
              <Line data={dadosGrafico} options={opcoesGrafico} />
              
              <div className="summary-stats">
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
            </div>
            
            <div className="history-container">
              <div className="results-title">
                <span className="icon" role="img" aria-label="history">📜</span> Histórico de Sessões
                <button 
                  className="button" 
                  style={{marginLeft: 'auto', padding: '4px 8px', fontSize: '0.8rem'}}
                  onClick={() => setHistorico([])}
                >
                  Limpar Histórico
                </button>
              </div>
              
              {historico.map((item, index) => (
                <div key={item.id} className="history-item">
                  <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                    Sessão {index + 1} - {item.timestamp}
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                    <div>⏱️ {item.horaInicio} a {item.horaFim} ({item.duracao} min)</div>
                    <div>💰 Bits: {item.bitsAcumulados}</div>
                    <div>💸 Gastos: {item.totalGasto}</div>
                    <div className={item.resultado >= 0 ? "result-positive" : "result-negative"}>
                      🏆 Resultado: {item.resultado >= 0 ? `+${item.resultado}` : item.resultado}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
