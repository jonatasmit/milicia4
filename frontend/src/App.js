import { useState, useEffect, useRef } from "react";
import "@/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Assets
const LOGO_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/1wasgcls_72bc90c6-d374-4fd6-bbae-b07bd26cd19b.jpeg";
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/nfwqyisr_ae0cd023-034e-4d51-b06f-2e3454bac50f.jpeg";
const MAP_BG = "https://customer-assets.emergentagent.com/job_general-command-ops/artifacts/y7is9dmg_IMG_3432.png";

// WhatsApp
const WHATSAPP = "5521972232170";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}`;
const LOJA_URL = "https://www.suplementosmaisbaratos.com.br";
const CUPOM = "SMB10OFF";

// Session ID
const getSessionId = () => {
  let sid = sessionStorage.getItem('milicia_session');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
    sessionStorage.setItem('milicia_session', sid);
  }
  return sid;
};

// Track Event
const trackEvent = async (eventType, extraData = {}) => {
  try {
    await fetch(`${API}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        ...extraData
      })
    });
  } catch (e) { console.log('Track error:', e); }
};

// Produtos
const PRODUTOS = {
  injetaveis: [
    { nome: "Testosterona Cipionato", preco: "R$ 89,90" },
    { nome: "Testosterona Enantato", preco: "R$ 79,90" },
    { nome: "Deca-Durabolin", preco: "R$ 129,90" },
    { nome: "Trembolona", preco: "R$ 249,90" },
    { nome: "Boldenona", preco: "R$ 149,90" },
    { nome: "Primobolan", preco: "R$ 199,90" }
  ],
  orais: [
    { nome: "Oxandrolona", preco: "R$ 159,90" },
    { nome: "Stanozolol", preco: "R$ 99,90" },
    { nome: "Dianabol", preco: "R$ 89,90" }
  ]
};

// XP System
const XP_PASSO = 25;
const XP_MISSAO = 100;
const LEVELS = [
  { nivel: 1, nome: "Noob", xpMax: 99 },
  { nivel: 2, nome: "Script Kiddie", xpMax: 249 },
  { nivel: 3, nome: "Hacker Jr", xpMax: 499 },
  { nivel: 4, nome: "Engenheiro Social", xpMax: 799 },
  { nivel: 5, nome: "Maromba Hacker", xpMax: 1199 },
  { nivel: 6, nome: "Mestre", xpMax: Infinity }
];

const getLevel = (xp) => {
  let total = 0;
  for (let l of LEVELS) {
    if (xp <= l.xpMax) return l;
    total = l.xpMax;
  }
  return LEVELS[LEVELS.length - 1];
};

// Equipamentos
const EQUIPS = {
  pendrive: { nome: "Pen Drive", icon: "💾" },
  jammer: { nome: "Jammer", icon: "📡" },
  arduino: { nome: "Arduino", icon: "🔌" },
  keylogger: { nome: "Keylogger", icon: "⌨️" },
  nip: { nome: "NIP", icon: "🔍" },
  transmissor: { nome: "Transmissor", icon: "📻" },
  nootropico: { nome: "Nootrópico", icon: "💊" }
};

// Missões simplificadas
const MISSOES = [
  {
    id: 1, titulo: "PRESENTE GREGO", local: "Cidade de Deus", zona: "verde",
    passos: [
      { texto: "Hackear iPhone", equip: "arduino", acao: "🔌 Conectar" },
      { texto: "Instalar vírus", equip: "pendrive", acao: "💾 Infectar" },
      { texto: "Entregar", equip: null, acao: "🎁 Presente!" }
    ]
  },
  {
    id: 2, titulo: "INTERNET POPULAR", local: "Antena", zona: "verde",
    passos: [
      { texto: "Subir na torre", equip: "jammer", acao: "📡 Instalar" },
      { texto: "Configurar", equip: "arduino", acao: "🔌 Programar" },
      { texto: "Ativar WiFi", equip: "transmissor", acao: "📶 Online!" }
    ]
  },
  {
    id: 3, titulo: "TV HACKEADA", local: "Central TV", zona: "verde",
    passos: [
      { texto: "Interceptar rede", equip: "nip", acao: "🔍 Sniffar" },
      { texto: "Capturar senha", equip: "keylogger", acao: "⌨️ Gravar" },
      { texto: "Transmitir", equip: "transmissor", acao: "📺 No ar!" }
    ]
  },
  {
    id: 4, titulo: "CAFÉZINHO", local: "DETRAN", zona: "amarela",
    passos: [
      { texto: "Preparar café", equip: "nootropico", acao: "☕ Servir" },
      { texto: "Acessar sistema", equip: "pendrive", acao: "💾 Baixar" },
      { texto: "Escapar", equip: null, acao: "🚪 Fugir!" }
    ]
  },
  {
    id: 5, titulo: "JUSTIÇA DIGITAL", local: "Casa do Alvo", zona: "vermelha",
    passos: [
      { texto: "Instalar spy", equip: "keylogger", acao: "⌨️ Espionar" },
      { texto: "Gravar tela", equip: "pendrive", acao: "📸 Capturar" },
      { texto: "Expor", equip: null, acao: "⚖️ Justiça!" }
    ]
  }
];

// Audio Hook
const useAudio = () => {
  const audio1 = useRef(null);
  const audio2 = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    audio1.current = new Audio('/music1.mp3');
    audio2.current = new Audio('/music2.mp3');
    audio1.current.loop = false;
    audio2.current.loop = true;
    audio1.current.addEventListener('ended', () => audio2.current?.play().catch(() => {}));
    return () => { audio1.current?.pause(); audio2.current?.pause(); };
  }, []);

  const start = () => {
    if (!started && audio1.current) {
      audio1.current.play().then(() => { setPlaying(true); setStarted(true); }).catch(() => {});
    }
  };

  const toggle = () => {
    if (playing) {
      audio1.current?.pause();
      audio2.current?.pause();
      setPlaying(false);
    } else {
      (audio1.current?.ended ? audio2.current : audio1.current)?.play().catch(() => {});
      setPlaying(true);
    }
  };

  return { start, toggle, playing, started };
};

// WhatsApp Button
const WhatsAppBtn = ({ creditos, onClick }) => (
  <a
    href={`${WHATSAPP_URL}?text=${encodeURIComponent(creditos > 0 
      ? `Oi! Tenho R$${creditos} de desconto do Milícia Digital! 🎮💪` 
      : `Oi! Vim do jogo Milícia Digital! 💪`)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="whatsapp-float"
    onClick={onClick}
    data-testid="whatsapp-btn"
  >
    <span className="wa-icon">💬</span>
    {creditos > 0 && <span className="wa-badge">R${creditos}</span>}
  </a>
);

// XP Bar
const XPBar = ({ xp }) => {
  const level = getLevel(xp);
  const prevMax = LEVELS[level.nivel - 2]?.xpMax || 0;
  const progress = ((xp - prevMax) / (level.xpMax - prevMax)) * 100;
  
  return (
    <div className="xp-container">
      <div className="xp-header">
        <span className="level-badge">Lv.{level.nivel}</span>
        <span className="level-name">{level.nome}</span>
        <span className="xp-num">{xp} XP</span>
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  );
};

// Cupom Modal
const CupomModal = ({ onClose }) => {
  useEffect(() => { trackEvent('cupom_view'); }, []);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cupom-modal" onClick={e => e.stopPropagation()}>
        <h2 className="titulo-glow">🎉 PARABÉNS!</h2>
        <p>Você desbloqueou o cupom máximo!</p>
        <div className="cupom-box">
          <span className="cupom-code">{CUPOM}</span>
          <p>R$10 OFF na sua compra!</p>
        </div>
        <a href={LOJA_URL} target="_blank" rel="noopener noreferrer" className="btn-loja glow-btn">
          🛒 IR PARA A LOJA
        </a>
        <button className="btn-fechar" onClick={onClose}>Continuar Jogando</button>
      </div>
    </div>
  );
};

// Tela Inicial
const TelaInicial = ({ onPlay, xp, creditos }) => {
  useEffect(() => { trackEvent('page_view', { xp, creditos }); }, []);
  
  return (
    <div className="tela-inicial">
      <img src={LOGO_URL} alt="Logo" className="logo-pulse" />
      <h1 className="titulo-glow animate-glow">MILÍCIA DIGITAL</h1>
      <p className="sub">O Jogo do Maromba Hacker</p>
      
      <div className="hero-card animate-float">
        <img src={MASCOT_URL} alt="Maromba" className="hero-img" />
        <div>
          <span className="tag-yellow">PROTAGONISTA</span>
          <h2>O MAROMBA</h2>
          <p>📍 Motel Amarelinho</p>
        </div>
      </div>

      <XPBar xp={xp} />

      <div className="promo animate-pulse-border">
        <h3>🎁 GANHE R$1 POR FASE!</h3>
        <p>Máximo R$10 • Use na loja</p>
        <p className="credito">Seu crédito: <b>R${creditos},00</b></p>
      </div>

      <button className="btn-play glow-btn animate-bounce" onClick={onPlay} data-testid="btn-jogar">
        <span className="play-icon">▶</span> JOGAR GRÁTIS
      </button>

      <div className="produtos-preview">
        <p>💉 Testosterona • Deca • Trembolona</p>
        <p>💊 Oxandrolona • Stanozolol • Dianabol</p>
      </div>
    </div>
  );
};

// Tela Missões
const TelaMissoes = ({ onSelect, completas }) => (
  <div className="tela-missoes">
    <h2 className="titulo-secao">ESCOLHA A OPERAÇÃO</h2>
    <p className="instrucao">Toque em uma missão para começar</p>
    <div className="missoes-grid">
      {MISSOES.map(m => (
        <button
          key={m.id}
          className={`missao-card zona-${m.zona} ${completas.includes(m.id) ? 'done' : ''} animate-slide-in`}
          onClick={() => onSelect(m)}
          style={{ animationDelay: `${m.id * 0.1}s` }}
        >
          <div className="missao-top">
            <span className="op-id">OP-{m.id}</span>
            <span className={`zona ${m.zona}`}>{m.zona === 'verde' ? '🟢' : m.zona === 'amarela' ? '🟡' : '🔴'}</span>
            {completas.includes(m.id) && <span className="check">✓</span>}
          </div>
          <h3>{m.titulo}</h3>
          <p>📍 {m.local}</p>
          <div className="reward-preview">+R$1,00 💰</div>
        </button>
      ))}
    </div>
  </div>
);

// Tela Jogo
const TelaJogo = ({ missao, onVoltar, onConcluir, addXP, creditos }) => {
  const [passo, setPasso] = useState(0);
  const [feitos, setFeitos] = useState([]);
  const [equip, setEquip] = useState(null);
  const [msg, setMsg] = useState(null);
  const [fim, setFim] = useState(false);

  useEffect(() => {
    trackEvent('mission_start', { mission_id: missao.id });
  }, [missao.id]);

  const completar = () => {
    const p = missao.passos[passo];
    if (p.equip && equip !== p.equip) {
      setMsg({ tipo: 'erro', txt: `Selecione: ${EQUIPS[p.equip].nome}` });
      setTimeout(() => setMsg(null), 1500);
      return;
    }

    setFeitos([...feitos, passo]);
    addXP(XP_PASSO);
    trackEvent('step_complete', { mission_id: missao.id, step: passo + 1 });
    setMsg({ tipo: 'ok', txt: `+${XP_PASSO} XP!` });

    setTimeout(() => {
      setMsg(null);
      if (passo < missao.passos.length - 1) {
        setPasso(passo + 1);
        setEquip(null);
      } else {
        addXP(XP_MISSAO);
        trackEvent('mission_complete', { mission_id: missao.id, creditos: creditos + 1 });
        setFim(true);
      }
    }, 800);
  };

  if (fim) {
    const prod = [...PRODUTOS.injetaveis, ...PRODUTOS.orais][Math.floor(Math.random() * 9)];
    const novoCredito = Math.min(creditos + 1, 10);
    const msgWpp = `Completei ${missao.titulo} e ganhei R$${novoCredito}! Quero ${prod.nome} 💪`;
    
    return (
      <div className="tela-fim">
        <div className="fim-content animate-pop">
          <span className="fim-icon">🎯</span>
          <h2 className="titulo-glow">MISSÃO COMPLETA!</h2>
          <div className="reward-box">
            <p className="xp-gain">+{XP_MISSAO} XP</p>
            <p className="cred-gain">+R$1,00 de crédito!</p>
          </div>
          
          <div className="produto-card">
            <span className="tag-yellow">💉 DESCONTO LIBERADO</span>
            <p className="prod-nome">{prod.nome}</p>
            <p className="prod-preco">{prod.preco}</p>
          </div>

          <a
            href={`${WHATSAPP_URL}?text=${encodeURIComponent(msgWpp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wpp-cta"
            onClick={() => trackEvent('whatsapp_click', { mission_id: missao.id, from: 'completion' })}
          >
            💬 USAR DESCONTO AGORA
          </a>

          <div className="fim-btns">
            <button className="btn-sec" onClick={onVoltar}>← Missões</button>
            <button 
              className="btn-play glow-btn" 
              onClick={() => onConcluir(missao.id)}
              data-testid="btn-proxima"
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const atual = missao.passos[passo];

  return (
    <div className="tela-jogo">
      <div className="jogo-header">
        <button className="btn-back" onClick={onVoltar}>←</button>
        <h2>{missao.titulo}</h2>
        <span className={`zona ${missao.zona}`}>{missao.zona === 'verde' ? '🟢' : missao.zona === 'amarela' ? '🟡' : '🔴'}</span>
      </div>

      <div className="progresso">
        {missao.passos.map((_, i) => (
          <div key={i} className={`prog-dot ${feitos.includes(i) ? 'done' : i === passo ? 'atual' : ''}`}>
            {feitos.includes(i) ? '✓' : i + 1}
          </div>
        ))}
      </div>

      <div className="passo-atual animate-fade">
        <h3>PASSO {passo + 1}: {atual.texto}</h3>
        {atual.equip && (
          <p className="dica-equip">
            👆 Selecione <b>{EQUIPS[atual.equip].nome}</b> abaixo
          </p>
        )}
      </div>

      <div className="equips">
        {Object.entries(EQUIPS).map(([k, v]) => (
          <button
            key={k}
            className={`equip ${equip === k ? 'sel' : ''} ${atual.equip === k ? 'hint' : ''}`}
            onClick={() => setEquip(k)}
          >
            <span className="eq-icon">{v.icon}</span>
            <span className="eq-nome">{v.nome}</span>
          </button>
        ))}
      </div>

      <button 
        className={`btn-acao glow-btn ${!atual.equip || equip === atual.equip ? 'ready' : ''}`}
        onClick={completar}
        data-testid={`passo-${passo + 1}`}
      >
        {atual.acao}
      </button>

      {msg && <div className={`toast ${msg.tipo}`}>{msg.txt}</div>}
    </div>
  );
};

// App
function App() {
  const [tela, setTela] = useState('inicial');
  const [missao, setMissao] = useState(null);
  const [xp, setXP] = useState(() => parseInt(localStorage.getItem('md_xp') || '0'));
  const [creditos, setCreditos] = useState(() => parseInt(localStorage.getItem('md_cred') || '0'));
  const [completas, setCompletas] = useState(() => JSON.parse(localStorage.getItem('md_done') || '[]'));
  const [showCupom, setShowCupom] = useState(false);
  
  const audio = useAudio();

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('md_xp', xp.toString());
    localStorage.setItem('md_cred', creditos.toString());
    localStorage.setItem('md_done', JSON.stringify(completas));
  }, [xp, creditos, completas]);

  // Verificar cupom máximo
  useEffect(() => {
    if (creditos >= 10 && !localStorage.getItem('md_cupom_shown')) {
      setShowCupom(true);
      localStorage.setItem('md_cupom_shown', 'true');
    }
  }, [creditos]);

  const handleFirst = () => { if (!audio.started) audio.start(); };

  const handlePlay = () => {
    trackEvent('click_play', { xp, creditos });
    setTela('missoes');
  };

  const handleSelect = (m) => {
    setMissao(m);
    setTela('jogo');
  };

  const handleConcluir = (id) => {
    // Adicionar crédito
    if (!completas.includes(id)) {
      setCompletas([...completas, id]);
      setCreditos(prev => Math.min(prev + 1, 10));
    }
    
    // Ir para próxima missão
    const idx = MISSOES.findIndex(m => m.id === id);
    if (idx < MISSOES.length - 1) {
      setMissao(MISSOES[idx + 1]);
    } else {
      // Voltou ao início, ir para primeira missão não completa ou missões
      const proxima = MISSOES.find(m => !completas.includes(m.id) && m.id !== id);
      if (proxima) {
        setMissao(proxima);
      } else {
        setTela('missoes');
      }
    }
  };

  const addXP = (n) => setXP(prev => prev + n);

  const handleWppClick = () => {
    trackEvent('whatsapp_click', { from: 'float', xp, creditos });
  };

  return (
    <div className="app" onClick={handleFirst}>
      <div className="bg" style={{ backgroundImage: `url(${MAP_BG})` }} />
      <div className="overlay" />
      <div className="scanlines" />

      <button className="audio-btn" onClick={audio.toggle}>
        {audio.playing ? '🔊' : '🔇'}
      </button>

      <div className="content">
        {tela === 'inicial' && <TelaInicial onPlay={handlePlay} xp={xp} creditos={creditos} />}
        {tela === 'missoes' && <TelaMissoes onSelect={handleSelect} completas={completas} />}
        {tela === 'jogo' && missao && (
          <TelaJogo
            key={missao.id}
            missao={missao}
            onVoltar={() => setTela('missoes')}
            onConcluir={handleConcluir}
            addXP={addXP}
            creditos={creditos}
          />
        )}
      </div>

      <WhatsAppBtn creditos={creditos} onClick={handleWppClick} />
      
      {showCupom && <CupomModal onClose={() => setShowCupom(false)} />}
    </div>
  );
}

export default App;
