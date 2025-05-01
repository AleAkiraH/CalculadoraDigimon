import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

// Lista de tipos de recursos disponíveis
const tiposRecursos = [
  'HP', 'SP', 'EVP', 'BITS', 'CUBO R', 'CUBO C', 'CUBO U', 'CUBO M', 
  'ASA DE ABELHA', 'ANTENA DE ABELHA', 'ENGRENAGEM', 'VELA', 'CHAPEU', 
  'ASA DE AIRDRAMON', 'CABELO BLACK WAR', 'RIFT', 'COLAR', 'ANEL', 'BRACELETE'
];

export default function Home() {
  // Estado para campos dinâmicos
  const [campos, setCampos] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [historico, setHistorico] = useState([]);
  
  // Estado para o modal
  const [modalAberto, setModalAberto] = useState(false);
  const [comboboxAberto, setComboboxAberto] = useState(false);
  const [editandoRecurso, setEditandoRecurso] = useState(null);
  
  // Armazena os dados para cada tipo de recurso
  const [dadosRecursos, setDadosRecursos] = useState(() => {
    const dados = {};
    tiposRecursos.forEach(tipo => {
      dados[tipo] = {
        inicio: '',
        fim: '',
        preco: tipo === 'BITS' ? '0' : ''
      };
    });
    return dados;
  });
  
  // Tipo atualmente selecionado no modal
  const [tipoSelecionado, setTipoSelecionado] = useState('HP');

  // Função para abrir o modal de adição
  const abrirModal = (tipo = 'HP') => {
    setTipoSelecionado(tipo);
    setEditandoRecurso(null);
    setModalAberto(true);
    setComboboxAberto(false);
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setModalAberto(false);
    setEditandoRecurso(null);
    setComboboxAberto(false);
  };

  // Função para adicionar um novo campo
  const adicionarCampo = () => {
    const dadosTipo = dadosRecursos[tipoSelecionado];
    
    if (!dadosTipo.inicio || !dadosTipo.fim) {
      alert('Por favor, preencha pelo menos os campos início e fim.');
      return;
    }
    
    const novoCampo = {
      id: editandoRecurso || Date.now(),
      tipo: tipoSelecionado,
      inicio: dadosTipo.inicio,
      fim: dadosTipo.fim,
      preco: tipoSelecionado === 'BITS' ? '0' : dadosTipo.preco || '0'
    };
    
    if (editandoRecurso) {
      setCampos(campos.map(campo => 
        campo.id === editandoRecurso ? novoCampo : campo
      ));
    } else {
      setCampos([...campos, novoCampo]);
    }
    
    fecharModal();
  };

  // Função para remover um campo
  const removerCampo = (id) => {
    setCampos(campos.filter(campo => campo.id !== id));
  };

  // Função para editar um campo
  const editarCampo = (campo) => {
    // Não precisamos atualizar os dados do recurso aqui, pois já estão salvos no dadosRecursos
    setTipoSelecionado(campo.tipo);
    setEditandoRecurso(campo.id);
    setModalAberto(true);
    setComboboxAberto(false);
  };

  // Função para atualizar dados de um tipo de recurso
  const atualizarDadosRecurso = (tipo, campo, valor) => {
    setDadosRecursos(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [campo]: valor
      }
    }));
  };

  // Preservar dados quando o tipo é alterado
  useEffect(() => {
    if (editandoRecurso) {
      const campoEditado = campos.find(c => c.id === editandoRecurso);
      if (campoEditado) {
        // Atualiza os dados do tipo sendo editado
        setDadosRecursos(prev => ({
          ...prev,
          [campoEditado.tipo]: {
            inicio: campoEditado.inicio,
            fim: campoEditado.fim,
            preco: campoEditado.tipo === 'BITS' ? '0' : campoEditado.preco
          }
        }));
      }
    }
  }, [editandoRecurso]);

  // Cálculos
  const calcularResultados = () => {
    const resultados = campos.map(campo => {
      const inicio = Number(campo.inicio) || 0;
      const fim = Number(campo.fim) || 0;
      const preco = Number(campo.preco) || 0;
      
      // Se o tipo for BITS, o resultado é a diferença entre fim e início
      if (campo.tipo === 'BITS') {
        const diferenca = fim - inicio;
        return {
          id: campo.id,
          tipo: campo.tipo,
          inicio,
          fim,
          preco: 0,
          diferenca,
          resultado: diferenca
        };
      } else {
        // Para outros tipos, multiplicamos a diferença pelo preço por unidade
        const diferenca = fim - inicio;
        const resultado = diferenca * preco;
        
        return {
          id: campo.id,
          tipo: campo.tipo,
          inicio,
          fim,
          preco,
          diferenca,
          resultado
        };
      }
    });
    
    return resultados;
  };

  const resultados = calcularResultados();
  const totalGanhos = resultados.reduce((acc, item) => item.resultado > 0 ? acc + item.resultado : acc, 0);
  const totalPerdas = resultados.reduce((acc, item) => item.resultado < 0 ? acc + item.resultado : acc, 0);
  const resultado = resultados.reduce((acc, item) => acc + item.resultado, 0);

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
  
  // Calcular taxa por minuto
  const taxaMinuto = resultado !== 0 && duracao > 0 ? Math.round(resultado / duracao) : 0;
  
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
    if (!horaInicio || !horaFim || campos.length === 0) {
      alert('Preencha os horários e ao menos um recurso para salvar no histórico.');
      return;
    }
    
    const novoRegistro = {
      id: Date.now(),
      horaInicio,
      horaFim,
      duracao,
      campos: campos.map(c => ({...c})), // Cópia dos campos
      resultados: calcularResultados(),
      resultado,
      taxaMinuto,
      timestamp: new Date().toLocaleString()
    };
    
    setHistorico(prev => [...prev, novoRegistro]);
  };
  
  // Preparar dados para o gráfico
  const dadosGrafico = {
    labels: historico.map(item => `${item.horaInicio}-${item.horaFim}`),
    datasets: [
      {
        label: 'Lucro/Perda por Sessão',
        data: historico.map(item => item.resultado),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Taxa por Minuto',
        data: historico.map(item => item.taxaMinuto),
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
          gap: 12px;
        }

        .add-field-section {
          background: white;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .add-field-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-blue);
        }

        .resource-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .resource-button {
          background: var(--color-light);
          border: 1px solid #e2e8f0;
          color: #4a5568;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .resource-button:hover {
          background: var(--color-blue);
          color: white;
          transform: translateY(-2px);
        }

        .dropdown-container {
          position: relative;
          width: 100%;
        }

        .dropdown-button {
          background: var(--color-light);
          border: 1px solid #e2e8f0;
          width: 100%;
          padding: 10px 16px;
          text-align: left;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
          margin-top: 4px;
          display: none;
        }

        .dropdown-menu.active {
          display: block;
        }

        .dropdown-item {
          padding: 10px 16px;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: #f0f7ff;
        }
        
        .field-container {
          border: none;
          background: white;
          border-radius: 14px;
          margin-bottom: 10px;
          padding: 18px;
          box-shadow: 0 4px 12px rgba(99, 66, 178, 0.1);
          border-left: 4px solid var(--color-blue);
          position: relative;
          cursor: pointer;
        }
        
        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .field-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-purple);
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .remove-button {
          background: #fff;
          color: #e53e3e;
          border: 1px solid #fed7d7;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.1rem;
          padding: 0;
        }
        
        .remove-button:hover {
          background: #e53e3e;
          color: white;
        }
        
        .field-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }
        
        .input-label {
          display: flex;
          flex-direction: column;
          margin-bottom: 14px;
          font-size: 0.95rem;
          color: #4a5568;
        }
        
        .input-field {
          height: 42px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          padding: 0 16px;
          font-size: 0.95rem;
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
          font-size: 1rem;
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
          font-size: 1.2rem;
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

        /* Estilos para o dropdown */
        .dropdown-toggle {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
        }

        .dropdown-toggle:hover {
          border-color: var(--color-blue);
        }

        .dropdown-content {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          width: 100%;
          max-height: 250px;
          overflow-y: auto;
          z-index: 10;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          display: none;
          margin-top: 5px;
        }

        .dropdown-content.show {
          display: block;
        }

        .dropdown-item {
          padding: 10px 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background-color: #f5f9ff;
        }

        .add-field-button {
          background: var(--gradient-digimon);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .add-field-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(99, 66, 178, 0.3);
        }

        /* Chip style for resources */
        .resource-chip {
          display: inline-flex;
          align-items: center;
          background: var(--color-light);
          padding: 6px 12px;
          border-radius: 16px;
          margin: 5px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
        }

        .resource-chip:hover {
          background: var(--gradient-digimon);
          color: white;
        }

        /* Responsive styles */
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
        }
        
        @media (max-width: 480px) {
          .history-details {
            grid-template-columns: 1fr;
          }
          
          .button {
            width: 100%;
          }
        }

        .empty-message {
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          margin: 10px 0;
          color: #718096;
        }

        /* Resultado item para exibir cada recurso */
        .resultado-item {
          display: flex;
          align-items: center;
          background: white;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 8px;
          transition: all 0.2s;
        }

        .resultado-item:hover {
          transform: translateX(3px);
          background: #f5f9ff;
        }

        .resultado-tipo {
          font-weight: 600;
          min-width: 100px;
          color: var(--color-purple);
        }

        .resultado-valores {
          flex: 1;
          display: flex;
          justify-content: space-between;
        }

        .resultado-diferenca {
          font-weight: 500;
          margin-right: 10px;
        }

        .resultado-valor {
          font-weight: 700;
          font-family: 'Orbitron', sans-serif;
        }

        /* Estilo para o modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.3s ease-out;
          position: relative;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--color-light);
        }
        
        .modal-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--color-dark);
        }
        
        .modal-close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          color: #718096;
          cursor: pointer;
          padding: 0;
        }
        
        .modal-close-button:hover {
          color: var(--color-red);
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        
        .modal-button {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }
        
        .modal-button-primary {
          background: var(--gradient-energy);
          color: white;
        }
        
        .modal-button-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }
        
        .modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .resource-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .resource-option {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        
        .resource-option.active {
          background: var(--color-blue);
          color: white;
          border-color: var(--color-blue);
        }
        
        .resource-option:hover:not(.active) {
          background: #f7fafc;
          border-color: #cbd5e0;
        }
        
        .edit-button {
          background: var(--color-light);
          border: none;
          color: var(--color-blue);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 5px;
          transition: all 0.2s;
        }
        
        .edit-button:hover {
          background: var(--color-blue);
          color: white;
        }
        
        .button-row-spaced {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        
        .add-button {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Combobox styles */
        .combobox {
          position: relative;
          width: 100%;
          margin-bottom: 20px;
        }
        
        .combobox-button {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background-color: white;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .combobox-button:hover {
          border-color: var(--color-blue);
        }
        
        .combobox-arrow {
          transform: ${comboboxAberto ? 'rotate(180deg)' : 'rotate(0)'};
          transition: transform 0.2s;
          color: #718096;
          font-size: 1.2rem;
        }
        
        .combobox-options {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 250px;
          overflow-y: auto;
          background-color: white;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          margin-top: 5px;
          z-index: 10;
          border: 1px solid #e2e8f0;
          display: ${comboboxAberto ? 'block' : 'none'};
        }
        
        .combobox-option {
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .combobox-option:hover {
          background-color: #f0f7ff;
        }
        
        /* Make resource item clickable */
        .field-container {
          cursor: pointer;
        }
        
        /* Remove buttons from resource items that are no longer needed */
        .compact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>

      <div className="digimon-container">
        <h1 className="digimon-title">
          Calculadora de Farm Digimon
        </h1>
        
        <div className="layout-container">
          {/* Seção 1: Calculadora (Inputs) */}
          <section className="section calculator-section">
            <div className="calculator-content">
              <h2 className="section-title">
                <span className="section-icon">🧮</span> Calculadora
              </h2>
              
              <div className="add-field-section">
                <div className="button-row-spaced">
                  <div className="add-field-title">Recursos</div>
                  <button 
                    type="button"
                    className="button add-button"
                    onClick={() => abrirModal()}
                  >
                    <span>➕</span> Adicionar Recurso
                  </button>
                </div>
              </div>
              
              <form>
                <div className="fields-grid">
                  {campos.length > 0 ? (
                    campos.map(campo => (
                      <div 
                        key={campo.id} 
                        className="field-container"
                        onClick={() => editarCampo(campo)}
                      >
                        <div className="compact-header">
                          <div className="field-title">{campo.tipo}</div>
                          <button 
                            type="button" 
                            className="remove-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removerCampo(campo.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                        
                        <div className="field-row">
                          <div className="input-label">Início:
                            <div className="input-field">{campo.inicio}</div>
                          </div>
                          <div className="input-label">Fim:
                            <div className="input-field">{campo.fim}</div>
                          </div>
                        </div>
                        {campo.tipo !== 'BITS' && (
                          <div className="input-label">Preço por unidade:
                            <div className="input-field">{campo.preco}</div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-message">
                      Clique no botão "Adicionar Recurso" para começar
                    </div>
                  )}
                  
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
                        <span className="result-value">{taxaMinuto} por min</span>
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
                    disabled={campos.length === 0}
                  >
                    💾 Salvar no Histórico
                  </button>
                  <button
                    type="button"
                    className="button button-clear"
                    onClick={() => {
                      setCampos([]);
                      setHoraInicio('');
                      setHoraFim('');
                    }}
                  >
                    🗑️ Limpar Campos
                  </button>
                </div>
              </form>
            </div>
          </section>
          
          {/* Seção 2: Resultados */}
          <section className="section results-section">
            <div className="results-content">
              <h2 className="section-title">
                <span className="section-icon">📊</span> Resultados
              </h2>
              
              {resultados.length > 0 ? (
                <div className="resultado-lista">
                  {resultados.map(res => (
                    <div key={res.id} className="resultado-item">
                      <div className="resultado-tipo">{res.tipo}</div>
                      <div className="resultado-valores">
                        <div className="resultado-diferenca">
                          {res.inicio} → {res.fim} ({res.diferenca > 0 ? `+${res.diferenca}` : res.diferenca})
                        </div>
                        <div className={`resultado-valor ${res.resultado >= 0 ? 'result-positive' : 'result-negative'}`}>
                          {res.resultado >= 0 ? `+${res.resultado}` : res.resultado}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-message">
                  Adicione recursos para ver os resultados
                </div>
              )}
              
              <div style={{ marginTop: '20px' }}>
                <div className="result-row">
                  <span className="icon" role="img" aria-label="ganhos">💰</span>
                  <span className="result-label">Ganhos totais:</span>
                  <span className="result-value result-positive">+{totalGanhos}</span>
                </div>
                <div className="result-row">
                  <span className="icon" role="img" aria-label="perdas">📉</span>
                  <span className="result-label">Perdas totais:</span>
                  <span className="result-value result-negative">{totalPerdas}</span>
                </div>
              </div>
              
              <div className="result-highlight">
                <span className="icon" role="img" aria-label="resultado" style={{ fontSize: '1.4rem', marginRight: '10px' }}>🏆</span>
                <span className="result-label">Resultado final:</span>
                <span className={resultado >= 0 ? "result-positive" : "result-negative"}>
                  {resultado >= 0 ? `+${resultado}` : resultado}
                </span>
              </div>
              
              {/* Estatísticas gerais quando há histórico */}
              {historico.length > 0 && (
                <div className="summary-stats" style={{ marginTop: '24px' }}>
                  <div className="stat-card">
                    <div className="stat-label">Sessões Totais</div>
                    <div className="stat-value">
                      {historico.length}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Melhor Taxa</div>
                    <div className="stat-value">
                      {Math.max(...historico.map(item => item.taxaMinuto))} /min
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
                            <div className="history-stat">📊 Recursos: {item.campos.length}</div>
                            <div className="history-stat">⚡ Taxa/min: {item.taxaMinuto}</div>
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
                    <p>Adicione recursos, preencha os dados e clique em "Salvar no Histórico".</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Modal para adição de recursos */}
      {modalAberto && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            fecharModal();
          }
        }}>
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title">
                {editandoRecurso ? 'Editar Recurso' : 'Adicionar Recurso'}
              </div>
              <button 
                type="button" 
                className="modal-close-button"
                onClick={fecharModal}
              >
                ×
              </button>
            </div>
            
            <div>
              {/* Combobox para selecionar tipo de recurso */}
              <div style={{marginBottom: '16px'}}>
                <label className="input-label" style={{fontWeight: 'bold'}}>
                  Tipo de Recurso:
                </label>
                <div className="combobox">
                  <button
                    type="button"
                    className="combobox-button"
                    onClick={() => setComboboxAberto(!comboboxAberto)}
                  >
                    <span>{tipoSelecionado}</span>
                    <span className="combobox-arrow">▼</span>
                  </button>
                  <div className="combobox-options">
                    {tiposRecursos.map(tipo => (
                      <div
                        key={tipo}
                        className="combobox-option"
                        onClick={() => {
                          setTipoSelecionado(tipo);
                          setComboboxAberto(false);
                        }}
                      >
                        {tipo}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Campos de entrada para o recurso selecionado */}
              <div className="field-row">
                <label className="input-label">Início:
                  <input 
                    className="input-field" 
                    type="number" 
                    value={dadosRecursos[tipoSelecionado].inicio} 
                    onChange={e => atualizarDadosRecurso(tipoSelecionado, 'inicio', e.target.value)} 
                  />
                </label>
                <label className="input-label">Fim:
                  <input 
                    className="input-field" 
                    type="number" 
                    value={dadosRecursos[tipoSelecionado].fim} 
                    onChange={e => atualizarDadosRecurso(tipoSelecionado, 'fim', e.target.value)} 
                  />
                </label>
              </div>
              
              {tipoSelecionado !== 'BITS' && (
                <label className="input-label">Preço por unidade:
                  <input 
                    className="input-field" 
                    type="number" 
                    value={dadosRecursos[tipoSelecionado].preco} 
                    onChange={e => atualizarDadosRecurso(tipoSelecionado, 'preco', e.target.value)} 
                  />
                </label>
              )}
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="modal-button modal-button-secondary"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="modal-button modal-button-primary"
                  onClick={adicionarCampo}
                >
                  {editandoRecurso ? 'Salvar Alterações' : 'Adicionar Recurso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
