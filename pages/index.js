import { useState } from 'react';

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

  // Cálculos
  const gastoHP = Math.max(0, (Number(hpInicio) - Number(hpFim))) * Number(hpPreco || 0);
  const gastoSP = Math.max(0, (Number(spInicio) - Number(spFim))) * Number(spPreco || 0);
  const gastoEVP = Math.max(0, (Number(evpInicio) - Number(evpFim))) * Number(evpPreco || 0);
  const bitsAcumulados = Math.max(0, Number(bitsFim) - Number(bitsInicio));
  const totalGasto = gastoHP + gastoSP + gastoEVP;
  const resultado = bitsAcumulados - totalGasto;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Montserrat', Arial, sans-serif",
      transition: 'background 1s'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap');
        .calc-container {
          background: rgba(255,255,255,0.97);
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          border-radius: 20px;
          padding: 32px 24px 24px 24px;
          max-width: 700px;
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
          display: block;
          font-size: 0.97rem;
          color: #3b4a5a;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .input-field {
          width: 100%;
          padding: 8px 10px;
          font-size: 1rem;
          border: 1.5px solid #b6c6d6;
          border-radius: 8px;
          margin-bottom: 10px;
          background: #fafdff;
          transition: border 0.2s;
          outline: none;
        }
        .input-field:focus {
          border: 1.5px solid #2c5364;
          background: #f0f7fa;
        }
        .results {
          margin-top: 28px;
          border-top: 2px solid #e3e9f7;
          padding-top: 18px;
          animation: fadeIn 1.2s 0.2s cubic-bezier(.4,0,.2,1) backwards;
        }
        .results-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a365d;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .result-row {
          font-size: 1.05rem;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .result-label {
          min-width: 140px;
          color: #2c5364;
        }
        .result-value {
          font-weight: 700;
          color: #1a365d;
        }
        .result-positive {
          color: #1bbf5c;
          font-weight: 700;
        }
        .result-negative {
          color: #e74c3c;
          font-weight: 700;
        }
        .icon {
          font-size: 1.2em;
          vertical-align: middle;
        }
        @media (max-width: 900px) {
          .calc-container {
            max-width: 98vw;
          }
          .fields-grid {
            grid-template-columns: 1fr;
            gap: 14px 0;
          }
        }
        @media (max-width: 600px) {
          .calc-container {
            padding: 12px 2vw 12px 2vw;
          }
        }
      `}</style>
      <div className="calc-container">
        <div className="calc-title">
          <span role="img" aria-label="digimon">🐾</span> Calculadora de Farm de Digimon
        </div>
        <form autoComplete="off">
          <div className="fields-grid">
            <fieldset className="fieldset">
              <legend className="legend">Food de HP</legend>
              <label className="input-label">Início:
                <input className="input-field" type="number" value={hpInicio} onChange={e => setHpInicio(e.target.value)} />
              </label>
              <label className="input-label">Fim:
                <input className="input-field" type="number" value={hpFim} onChange={e => setHpFim(e.target.value)} />
              </label>
              <label className="input-label">Preço:
                <input className="input-field" type="number" value={hpPreco} onChange={e => setHpPreco(e.target.value)} />
              </label>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="legend">Food de SP</legend>
              <label className="input-label">Início:
                <input className="input-field" type="number" value={spInicio} onChange={e => setSpInicio(e.target.value)} />
              </label>
              <label className="input-label">Fim:
                <input className="input-field" type="number" value={spFim} onChange={e => setSpFim(e.target.value)} />
              </label>
              <label className="input-label">Preço:
                <input className="input-field" type="number" value={spPreco} onChange={e => setSpPreco(e.target.value)} />
              </label>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="legend">Food de EVP</legend>
              <label className="input-label">Início:
                <input className="input-field" type="number" value={evpInicio} onChange={e => setEvpInicio(e.target.value)} />
              </label>
              <label className="input-label">Fim:
                <input className="input-field" type="number" value={evpFim} onChange={e => setEvpFim(e.target.value)} />
              </label>
              <label className="input-label">Preço:
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
      </div>
    </div>
  );
}
