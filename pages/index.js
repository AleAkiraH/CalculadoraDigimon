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
      background: `url('/images/background.jpg') center/cover fixed`,
      padding: '20px 10px',
      fontFamily: "'Montserrat', Arial, sans-serif",
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Orbitron:wght@400;500;700&display=swap');
        
        :root {
          --color-blue: #194b8d;
          --color-purple: #6342b2;
          --color-orange: #ff8c29;
          --color-yellow: #ffc700;
          --color-red: #e53e3e;
          --color-green: #38a169;
          --color-dark: #1a202c;
          --color-light: #f8fafc;
          --gradient-digimon: linear-gradient(135deg, var(--color-blue), var(--color-purple));
          --gradient-energy: linear-gradient(135deg, #0ba0ff, #6342b2);
          --gradient-fire: linear-gradient(45deg, var(--color-orange), var(--color-yellow));
        }
        
        .digimon-container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border-radius: 24px;
          padding: 28px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
          animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .digimon-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: var(--gradient-fire);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        
        .digimon-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--color-dark);
          margin-bottom: 28px;
          letter-spacing: -1px;
          text-align: center;
          text-shadow: 2px 2px 0 var(--color-orange);
          padding-bottom: 15px;
          border-bottom: 3px solid var(--color-blue);
          position: relative;
        }
        
        .digimon-title-icon {
          display: inline-block;
          width: 50px;
          height: 50px;
          margin-right: 10px;
          vertical-align: middle;
        }
        
        .layout-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          position: relative;
        }
        
        @media (min-width: 1024px) {
          .layout-container {
            grid-template-columns: 1.8fr 1fr 1fr;
            gap: 24px;
            align-items: start;
          }
        }
        
        .section {
          background: var(--color-light);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          height: fit-content;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .section:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.15);
        }
        
        .section-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-blue);
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--color-orange);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .section-icon {
          font-size: 1.6rem;
        }
        
        /* Estilos para a calculadora */
        .calculator-section {
          background: url('/images/calculator-bg.jpg');
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .calculator-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          z-index: 0;
        }
        
        .calculator-content {
          position: relative;
          z-index: 1;
        }
        
        .fields-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
        }
        
        .fieldset {
          border: none;
          background: white;
          border-radius: 14px;
          margin-bottom: 0;
          padding: 22px;
          box-shadow: 0 4px 12px rgba(99, 66, 178, 0.1);
          border-left: 4px solid var(--color-blue);
        }
        
        .legend {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-purple);
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
          border-color: var(--color-purple);
          box-shadow: 0 0 0 2px rgba(99, 66, 178, 0.2);
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
          background: var(--gradient-digimon);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 140px;
          position: relative;
          overflow: hidden;
        }
        
        .button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(99, 66, 178, 0.3);
        }
        
        .button::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(45deg);
          transition: all 0.6s ease;
          opacity: 0;
        }
        
        .button:hover::after {
          opacity: 1;
          transform: rotate(45deg) translate(10%, 10%);
        }
        
        .button-save {
          background: var(--gradient-energy);
        }
        
        .button-clear {
          background: var(--gradient-fire);
        }
        
        .time-section {
          margin-top: 22px;
          padding: 22px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.07);
          border-left: 4px solid var(--color-orange);
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
        .results-section {
          background: url('/images/results-bg.jpg');
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .results-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          z-index: 0;
        }
        
        .results-content {
          position: relative;
          z-index: 1;
        }
        
        .result-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          padding: 14px;
          border-radius: 10px;
          transition: all 0.3s;
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        
        .result-row:hover {
          background: #f0f7ff;
          transform: translateX(5px);
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
          color: var(--color-purple);
          font-size: 1.05rem;
          text-align: right;
          padding-right: 8px;
          font-family: 'Orbitron', sans-serif;
        }
        
        .result-highlight {
          font-size: 1.2rem;
          margin-top: 18px;
          padding: 18px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .result-highlight::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--gradient-digimon);
        }
        
        .result-positive {
          font-weight: 700;
          color: var(--color-green);
          font-family: 'Orbitron', sans-serif;
        }
        
        .result-negative {
          font-weight: 700;
          color: var(--color-red);
          font-family: 'Orbitron', sans-serif;
        }
        
        .icon {
          display: inline-block;
          font-size: 1.3rem;
        }
        
        /* Estilos para os gráficos e histórico */
        .stats-section {
          background: url('/images/stats-bg.jpg');
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .stats-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          z-index: 0;
        }
        
        .stats-content {
          position: relative;
          z-index: 1;
        }
        
        .stats-scroll {
          overflow-y: auto;
          max-height: 700px;
          padding-right: 10px;
        }
        
        .chart-wrapper {
          background: white;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-top: 22px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--gradient-digimon);
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-purple);
          margin: 8px 0;
          font-family: 'Orbitron', sans-serif;
        }
        
        .stat-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #4a5568;
        }
        
        .history-list {
          margin-top: 24px;
        }
        
        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .history-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-blue);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .history-item {
          background: white;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-left: 4px solid var(--color-orange);
          transition: all 0.3s;
        }
        
        .history-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        
        .history-head {
          font-weight: 600;
          color: var(--color-blue);
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
          padding: 6px;
          background: #f8fafc;
          border-radius: 6px;
        }
        
        .empty-history {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
          font-size: 0.95rem;
          background: white;
          border-radius: 12px;
        }
        
        .empty-history-icon {
          font-size: 4rem;
          margin-bottom: 15px;
          opacity: 0.7;
          color: var(--color-blue);
        }
        
        .digimon-mascot {
          position: absolute;
          width: 80px;
          height: 80px;
          bottom: -10px;
          right: -10px;
          opacity: 0.8;
        }
        
        .digimon-light-effect {
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(255,140,41,0.2) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 0;
        }
        
        .time-summary {
          margin-top: 16px;
          background: white;
          padding: 16px;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .time-summary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--gradient-fire);
        }
        
        .time-result-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .time-result-row:last-child {
          margin-bottom: 0;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .digimon-container {
            padding: 20px 16px;
          }
          
          .digimon-title {
            font-size: 1.8rem;
            margin-bottom: 20px;
          }
          
          .section {
            padding: 22px;
          }
          
          .section-title {
            font-size: 1.3rem;
          }
          
          .digimon-mascot {
            width: 60px;
            height: 60px;
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
          background: var(--color-purple);
          border-radius: 10px;
        }
        
        .stats-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--color-blue);
        }
        
        /* Ajustes para telas muito grandes */
        @media (min-width: 1600px) {
          .digimon-container {
            max-width: 1600px;
          }
          
          .layout-container {
            grid-template-columns: 2fr 1fr 1fr;
          }
          
          .input-field {
            height: 48px;
            font-size: 1.05rem;
          }
        }
        
        /* Ajustes para telas médias */
        @media (min-width: 768px) and (max-width: 1023px) {
          .layout-container {
            grid-template-columns: 1fr 1fr;
          }
          
          .section:last-child {
            grid-column: span 2;
          }
        }
      `}</style>

      <div className="digimon-container">
        <h1 className="digimon-title">
          <img src="/images/digimon-icon.png" alt="Digimon Icon" className="digimon-title-icon" />
          Calculadora de Farm Digimon
        </h1>
        
        <div className="layout-container">
          {/* Seção 1: Calculadora (Inputs) */}
          <section className="section calculator-section">
            <div className="calculator-content">
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
              <img src="/images/agumon.png" alt="Digimon mascot" className="digimon-mascot" />
            </div>
          </section>
          
          {/* Seção 2: Resultados */}
          <section className="section results-section">
            <div className="results-content">
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
              <img src="/images/gabumon.png" alt="Digimon mascot" className="digimon-mascot" />
            </div>
          </section>
          
          {/* Seção 3: Gráfico e Histórico */}
          <section className="section stats-section">
            <div className="stats-content">
              <h2 className="section-title">
                <span className="section-icon">📈</span> Gráfico e Histórico
              </h2>
              
              <div className="stats-scroll">
                {historico.length > 0 ? (
                  <>
                    <div className="chart-wrapper">
                      <div style={{ width: '100%', height: '250px' }}>
                        <Line data={dadosGrafico} options={{
                          ...opcoesGrafico, 
                          maintainAspectRatio: false,
                          plugins: {
                            ...opcoesGrafico.plugins,
                            legend: {
                              ...opcoesGrafico.plugins.legend,
                              labels: {
                                color: '#2c5364',
                                font: {
                                  family: "'Orbitron', sans-serif",
                                  weight: 500
                                }
                              }
                            },
                            title: {
                              ...opcoesGrafico.plugins.title,
                              color: '#1a365d',
                              font: {
                                family: "'Orbitron', sans-serif",
                                size: 16,
                                weight: 600
                              }
                            }
                          }
                        }} />
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
              <img src="/images/veemon.png" alt="Digimon mascot" className="digimon-mascot" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
