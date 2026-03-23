import { useState, useEffect, useRef } from "react";
import "@/App.css";

// Assets
const LOGO_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/1wasgcls_72bc90c6-d374-4fd6-bbae-b07bd26cd19b.jpeg";
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/nfwqyisr_ae0cd023-034e-4d51-b06f-2e3454bac50f.jpeg";
const MAP_BG = "https://customer-assets.emergentagent.com/job_general-command-ops/artifacts/y7is9dmg_IMG_3432.png";

// WhatsApp
const WHATSAPP_NUMBER = "5521972232170";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// Produtos da campanha
const PRODUTOS = {
  injetaveis: [
    { nome: "Testosterona Cipionato", preco: "R$ 89,90" },
    { nome: "Testosterona Enantato", preco: "R$ 79,90" },
    { nome: "Testosterona Propionato", preco: "R$ 69,90" },
    { nome: "Deca-Durabolin", preco: "R$ 129,90" },
    { nome: "Durateston", preco: "R$ 99,90" },
    { nome: "Primobolan", preco: "R$ 199,90" },
    { nome: "Boldenona", preco: "R$ 149,90" },
    { nome: "Trembolona", preco: "R$ 249,90" }
  ],
  orais: [
    { nome: "Dianabol", preco: "R$ 89,90" },
    { nome: "Oxandrolona", preco: "R$ 159,90" },
    { nome: "Stanozolol", preco: "R$ 99,90" },
    { nome: "Hemogenin", preco: "R$ 119,90" },
    { nome: "Halotestin", preco: "R$ 179,90" }
  ]
};

// XP System
const XP_POR_PASSO = 25;
const XP_POR_MISSAO = 100;
const LEVELS = [
  { nivel: 1, nome: "Noob", xpMin: 0, xpMax: 99 },
  { nivel: 2, nome: "Script Kiddie", xpMin: 100, xpMax: 249 },
  { nivel: 3, nome: "Hacker Jr", xpMin: 250, xpMax: 499 },
  { nivel: 4, nome: "Engenheiro Social", xpMin: 500, xpMax: 799 },
  { nivel: 5, nome: "Maromba Hacker", xpMin: 800, xpMax: 1199 },
  { nivel: 6, nome: "Mestre da Zona Verde", xpMin: 1200, xpMax: Infinity }
];

// Equipamentos
const EQUIPAMENTOS = {
  pendrive: { nome: "Pen Drive", icon: "💾", desc: "Rootkit NetBus" },
  jammer: { nome: "Jammer", icon: "📡", desc: "Bloqueia sinais" },
  arduino: { nome: "Arduino", icon: "🔌", desc: "Microcontrolador" },
  keylogger: { nome: "Keylogger", icon: "⌨️", desc: "Captura teclas" },
  nip: { nome: "NIP", icon: "🔍", desc: "Intercepta rede" },
  transmissor: { nome: "Transmissor", icon: "📻", desc: "Hackeia TV" },
  nootropico: { nome: "Nootrópico", icon: "💊", desc: "Foco mental" }
};

// Missões
const MISSOES = [
  {
    id: 1,
    titulo: "PRESENTE GREGO",
    historia: "iPhone 6 hackeado com Cydia...",
    local: "Motel → Cidade de Deus",
    passos: [
      { texto: "Jailbreak no iPhone", equipamento: "arduino", acao: "Conectar Arduino" },
      { texto: "Instalar rootkit", equipamento: "pendrive", acao: "Transferir vírus" },
      { texto: "Entregar presente", equipamento: null, acao: "🎁 Entregar!" }
    ],
    recompensa: "📱 iPhone entregue",
    zona: "verde"
  },
  {
    id: 2,
    titulo: "INTERNET POPULAR",
    historia: "WiFi comunitário na torre...",
    local: "Antena da Comunidade",
    passos: [
      { texto: "Subir na antena", equipamento: "jammer", acao: "Instalar Jammer" },
      { texto: "Conectar repetidor", equipamento: "arduino", acao: "Configurar roteador" },
      { texto: "Ativar rede", equipamento: "transmissor", acao: "📶 R$20/mês!" }
    ],
    recompensa: "🌐 500 casas online",
    zona: "verde"
  },
  {
    id: 3,
    titulo: "TV HACKEADA",
    historia: "Central de TV exposta...",
    local: "Central de TV",
    passos: [
      { texto: "Localizar servidor", equipamento: "nip", acao: "Instalar NIP" },
      { texto: "Capturar senha", equipamento: "keylogger", acao: "⌨️ Senha obtida" },
      { texto: "Inserir comerciais", equipamento: "transmissor", acao: "📺 No ar!" }
    ],
    recompensa: "📢 Propaganda grátis",
    zona: "verde"
  },
  {
    id: 4,
    titulo: "CAFÉZINHO ESPECIAL",
    historia: "Infiltração no DETRAN...",
    local: "DETRAN - Setor TI",
    passos: [
      { texto: "Preparar café", equipamento: "nootropico", acao: "☕ Relaxou geral" },
      { texto: "Acessar sistema", equipamento: "pendrive", acao: "💾 Baixando..." },
      { texto: "Sair tranquilo", equipamento: null, acao: "🚪 Missão cumprida!" }
    ],
    recompensa: "🗃️ Banco baixado",
    zona: "amarela"
  },
  {
    id: 5,
    titulo: "JUSTIÇA DIGITAL",
    historia: "Investigação particular...",
    local: "Residência Alvo",
    passos: [
      { texto: "Instalar keylogger", equipamento: "keylogger", acao: "⌨️ Monitorando" },
      { texto: "Esconder pen drive", equipamento: "pendrive", acao: "📸 Capturando" },
      { texto: "Coletar provas", equipamento: null, acao: "⚖️ Justiça!" }
    ],
    recompensa: "🔒 Criminoso exposto",
    zona: "vermelha"
  }
];

// Audio Manager Hook
const useAudioManager = () => {
  const audio1Ref = useRef(null);
  const audio2Ref = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    audio1Ref.current = new Audio('/music1.mp3');
    audio2Ref.current = new Audio('/music2.mp3');
    
    audio1Ref.current.loop = false;
    audio2Ref.current.loop = true;
    
    audio1Ref.current.addEventListener('ended', () => {
      audio2Ref.current.play().catch(() => {});
    });

    return () => {
      audio1Ref.current?.pause();
      audio2Ref.current?.pause();
    };
  }, []);

  const startAudio = () => {
    if (!audioStarted && audio1Ref.current) {
      audio1Ref.current.play().then(() => {
        setIsPlaying(true);
        setAudioStarted(true);
      }).catch(() => {});
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audio1Ref.current?.pause();
      audio2Ref.current?.pause();
      setIsPlaying(false);
    } else {
      if (audio1Ref.current?.ended || audio1Ref.current?.currentTime === 0) {
        audio2Ref.current?.play().catch(() => {});
      } else {
        audio1Ref.current?.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  return { startAudio, toggleAudio, isPlaying, audioStarted };
};

// WhatsApp Button
const WhatsAppButton = ({ creditos }) => {
  const msg = creditos > 0 
    ? `Oi! Completei missões na Milícia Digital e ganhei R$${creditos},00 de desconto! Quero usar na minha compra 💪`
    : `Oi! Vim do jogo Milícia Digital! Quero saber dos suplementos 💪`;
  
  return (
    <a
      href={`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      data-testid="whatsapp-btn"
    >
      <span className="whatsapp-icon">💬</span>
      {creditos > 0 && <span className="whatsapp-badge">R${creditos}</span>}
    </a>
  );
};

// XP Bar Component
const XPBar = ({ xp, level }) => {
  const currentLevel = LEVELS.find(l => xp >= l.xpMin && xp <= l.xpMax) || LEVELS[0];
  const nextLevel = LEVELS[currentLevel.nivel] || currentLevel;
  const progress = ((xp - currentLevel.xpMin) / (currentLevel.xpMax - currentLevel.xpMin)) * 100;

  return (
    <div className="xp-bar-container">
      <div className="xp-info">
        <span className="level-badge">Lv.{currentLevel.nivel}</span>
        <span className="level-name">{currentLevel.nome}</span>
        <span className="xp-text">{xp} XP</span>
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  );
};

// Equip Card
const EquipCard = ({ equip, selecionado, onClick }) => (
  <button
    onClick={onClick}
    className={`equip-card ${selecionado ? 'selecionado' : ''}`}
    data-testid={`equip-${equip}`}
  >
    <span className="equip-icon">{EQUIPAMENTOS[equip].icon}</span>
    <span className="equip-nome">{EQUIPAMENTOS[equip].nome}</span>
  </button>
);

// Passo Component
const Passo = ({ passo, numero, completo, atual, onCompletar }) => (
  <div className={`passo ${completo ? 'completo' : ''} ${atual ? 'atual' : ''}`}>
    <div className="passo-numero">{completo ? '✓' : numero}</div>
    <div className="passo-content">
      <p className="passo-texto">{passo.texto}</p>
      {atual && (
        <button className="btn-acao glow-btn" onClick={onCompletar} data-testid={`passo-${numero}`}>
          {passo.acao}
        </button>
      )}
    </div>
  </div>
);

// Tela Inicial
const TelaInicial = ({ onIniciar, xp, creditos }) => (
  <div className="tela-inicial" data-testid="tela-inicial">
    <div className="logo-main-container">
      <img src={LOGO_URL} alt="Logo" className="logo-main" />
    </div>
    
    <h1 className="titulo-glow">MILÍCIA DIGITAL</h1>
    <p className="subtitulo">O Jogo do Maromba Hacker</p>
    
    <div className="mascot-hero">
      <img src={MASCOT_URL} alt="Maromba" className="mascot-img" />
      <div className="mascot-info">
        <span className="label-glow">PROTAGONISTA</span>
        <h2>O MAROMBA</h2>
        <p>📍 Motel Amarelinho</p>
      </div>
    </div>

    <XPBar xp={xp} />

    <div className="promo-box">
      <h3>🎁 GANHE R$1 POR FASE!</h3>
      <p>Complete missões e use o desconto em suplementos</p>
      <p className="promo-credito">Seu crédito: <strong>R${creditos},00</strong></p>
    </div>

    <button className="btn-iniciar glow-btn" onClick={onIniciar} data-testid="btn-iniciar">
      ▶ JOGAR GRÁTIS
    </button>

    <p className="disclaimer">
      💊 Nootrópicos para foco | 💉 Anabolizantes com desconto
    </p>
  </div>
);

// Tela Missões
const TelaMissoes = ({ onSelect, missoesCompletas }) => (
  <div className="tela-missoes" data-testid="tela-missoes">
    <h2 className="titulo-secao">OPERAÇÕES</h2>
    <div className="missoes-grid">
      {MISSOES.map((m) => (
        <button
          key={m.id}
          className={`missao-card zona-${m.zona} ${missoesCompletas.includes(m.id) ? 'completa' : ''}`}
          onClick={() => onSelect(m)}
          data-testid={`missao-${m.id}`}
        >
          <div className="missao-header">
            <span className="missao-id">OP-{m.id.toString().padStart(2, '0')}</span>
            <span className={`zona-tag ${m.zona}`}>
              {m.zona === 'verde' ? '🟢' : m.zona === 'amarela' ? '🟡' : '🔴'}
            </span>
            {missoesCompletas.includes(m.id) && <span className="check-badge">✓</span>}
          </div>
          <h3>{m.titulo}</h3>
          <p className="missao-local">📍 {m.local}</p>
        </button>
      ))}
    </div>
  </div>
);

// Tela Jogo
const TelaMissao = ({ missao, onVoltar, onConcluir, onXP, creditos }) => {
  const [passoAtual, setPassoAtual] = useState(0);
  const [completos, setCompletos] = useState([]);
  const [equipSel, setEquipSel] = useState(null);
  const [msg, setMsg] = useState(null);
  const [concluida, setConcluida] = useState(false);

  const completar = () => {
    const passo = missao.passos[passoAtual];
    if (passo.equipamento && equipSel !== passo.equipamento) {
      setMsg({ tipo: 'erro', texto: `Use: ${EQUIPAMENTOS[passo.equipamento].nome}` });
      setTimeout(() => setMsg(null), 1500);
      return;
    }

    setCompletos([...completos, passoAtual]);
    onXP(XP_POR_PASSO);
    setMsg({ tipo: 'sucesso', texto: '+25 XP!' });
    
    setTimeout(() => {
      setMsg(null);
      if (passoAtual < missao.passos.length - 1) {
        setPassoAtual(passoAtual + 1);
        setEquipSel(null);
      } else {
        onXP(XP_POR_MISSAO);
        setConcluida(true);
      }
    }, 800);
  };

  if (concluida) {
    const produto = PRODUTOS.injetaveis[Math.floor(Math.random() * PRODUTOS.injetaveis.length)];
    const msgWpp = `Completei ${missao.titulo} e ganhei R$${Math.min(creditos + 1, 10)},00! Quero usar no ${produto.nome} 💪`;
    
    return (
      <div className="tela-conclusao" data-testid="tela-conclusao">
        <div className="conclusao-content">
          <div className="sucesso-icon">🎯</div>
          <h2 className="titulo-glow">COMPLETO!</h2>
          <div className="recompensa-box">
            <p className="recompensa-xp">+{XP_POR_MISSAO} XP</p>
            <p className="recompensa-credito">+R$1,00 de crédito!</p>
          </div>
          
          <div className="produto-destaque">
            <h4>💉 APROVEITE SEU DESCONTO:</h4>
            <p className="produto-nome">{produto.nome}</p>
            <p className="produto-preco">{produto.preco}</p>
          </div>

          <a
            href={`${WHATSAPP_URL}?text=${encodeURIComponent(msgWpp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-cta glow-btn"
          >
            💬 USAR DESCONTO NO WHATSAPP
          </a>

          <div className="btn-group">
            <button className="btn-secundario" onClick={onVoltar}>← MISSÕES</button>
            <button className="btn-iniciar glow-btn" onClick={() => onConcluir(missao.id)}>PRÓXIMA →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tela-missao" data-testid="tela-missao">
      <div className="missao-header-full">
        <button className="btn-voltar" onClick={onVoltar}>←</button>
        <h2>{missao.titulo}</h2>
        <span className={`zona-tag ${missao.zona}`}>
          {missao.zona === 'verde' ? '🟢' : missao.zona === 'amarela' ? '🟡' : '🔴'}
        </span>
      </div>

      <p className="historia">{missao.historia}</p>

      <div className="equips-section">
        <h3>🛠️ EQUIPAMENTOS</h3>
        <div className="equips-grid">
          {Object.keys(EQUIPAMENTOS).map(e => (
            <EquipCard key={e} equip={e} selecionado={equipSel === e} onClick={() => setEquipSel(e)} />
          ))}
        </div>
      </div>

      <div className="passos-section">
        <h3>📋 PASSOS</h3>
        {missao.passos.map((p, i) => (
          <Passo
            key={i}
            passo={p}
            numero={i + 1}
            completo={completos.includes(i)}
            atual={passoAtual === i && !completos.includes(i)}
            onCompletar={completar}
          />
        ))}
      </div>

      {missao.passos[passoAtual]?.equipamento && !completos.includes(passoAtual) && (
        <div className="dica-box">
          💡 Use: <strong>{EQUIPAMENTOS[missao.passos[passoAtual].equipamento].nome}</strong>
        </div>
      )}

      {msg && <div className={`mensagem ${msg.tipo}`}>{msg.texto}</div>}
    </div>
  );
};

// App Principal
function App() {
  const [tela, setTela] = useState('inicial');
  const [missaoAtual, setMissaoAtual] = useState(null);
  const [xp, setXP] = useState(() => parseInt(localStorage.getItem('milicia_xp') || '0'));
  const [creditos, setCreditos] = useState(() => parseInt(localStorage.getItem('milicia_creditos') || '0'));
  const [missoesCompletas, setMissoesCompletas] = useState(() => 
    JSON.parse(localStorage.getItem('milicia_missoes') || '[]')
  );
  
  const { startAudio, toggleAudio, isPlaying, audioStarted } = useAudioManager();

  useEffect(() => {
    localStorage.setItem('milicia_xp', xp.toString());
    localStorage.setItem('milicia_creditos', creditos.toString());
    localStorage.setItem('milicia_missoes', JSON.stringify(missoesCompletas));
  }, [xp, creditos, missoesCompletas]);

  const handleFirstInteraction = () => {
    if (!audioStarted) startAudio();
  };

  const addXP = (amount) => setXP(prev => prev + amount);
  
  const completarMissao = (missaoId) => {
    if (!missoesCompletas.includes(missaoId)) {
      setMissoesCompletas([...missoesCompletas, missaoId]);
      setCreditos(prev => Math.min(prev + 1, 10));
    }
    const idx = MISSOES.findIndex(m => m.id === missaoId);
    if (idx < MISSOES.length - 1) {
      setMissaoAtual(MISSOES[idx + 1]);
    } else {
      setTela('missoes');
    }
  };

  return (
    <div className="app-container" onClick={handleFirstInteraction} data-testid="app">
      <div className="map-bg" style={{ backgroundImage: `url(${MAP_BG})` }} />
      <div className="overlay" />
      <div className="scanlines" />

      {/* Audio Toggle */}
      <button className="audio-toggle" onClick={toggleAudio} data-testid="audio-toggle">
        {isPlaying ? '🔊' : '🔇'}
      </button>

      <div className="content">
        {tela === 'inicial' && (
          <TelaInicial 
            onIniciar={() => setTela('missoes')} 
            xp={xp}
            creditos={creditos}
          />
        )}
        {tela === 'missoes' && (
          <TelaMissoes 
            onSelect={(m) => { setMissaoAtual(m); setTela('jogo'); }}
            missoesCompletas={missoesCompletas}
          />
        )}
        {tela === 'jogo' && missaoAtual && (
          <TelaMissao
            missao={missaoAtual}
            onVoltar={() => setTela('missoes')}
            onConcluir={completarMissao}
            onXP={addXP}
            creditos={creditos}
          />
        )}
      </div>

      <WhatsAppButton creditos={creditos} />
    </div>
  );
}

export default App;
