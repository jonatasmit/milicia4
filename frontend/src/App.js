import { useState, useEffect } from "react";
import "@/App.css";

// Assets
const LOGO_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/1wasgcls_72bc90c6-d374-4fd6-bbae-b07bd26cd19b.jpeg";
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/nfwqyisr_ae0cd023-034e-4d51-b06f-2e3454bac50f.jpeg";
const MAP_BG = "https://customer-assets.emergentagent.com/job_general-command-ops/artifacts/y7is9dmg_IMG_3432.png";

// Equipamentos do Hacker
const EQUIPAMENTOS = {
  pendrive: { nome: "Pen Drive Infectado", icon: "💾", desc: "Contém rootkit NetBus" },
  jammer: { nome: "Jammer WiFi", icon: "📡", desc: "Bloqueia sinais na área" },
  arduino: { nome: "Arduino Hacker", icon: "🔌", desc: "Microcontrolador programável" },
  keylogger: { nome: "Keylogger USB", icon: "⌨️", desc: "Captura todas as teclas" },
  nip: { nome: "NIP Sniffer", icon: "🔍", desc: "Intercepta dados da rede" },
  transmissor: { nome: "Transmissor FM", icon: "📻", desc: "Hackeia sinal de TV/Rádio" },
  nootropico: { nome: "Nootrópico", icon: "💊", desc: "Foco mental extremo" }
};

// Missões/Cenários
const MISSOES = [
  {
    id: 1,
    titulo: "OPERAÇÃO PRESENTE GREGO",
    subtitulo: "Fase 1: Engenharia Social",
    historia: "O Maromba encontrou um iPhone 6 antigo. Hora de transformá-lo em uma arma digital...",
    local: "Motel Amarelinho → Cidade de Deus",
    passos: [
      { texto: "Fazer jailbreak no iPhone 6 com Cydia", equipamento: "arduino", acao: "Conectar Arduino ao iPhone" },
      { texto: "Instalar apps de monitoramento ocultos", equipamento: "pendrive", acao: "Transferir rootkit via USB" },
      { texto: "Embrulhar como presente e entregar", equipamento: null, acao: "🎁 Engenharia Social ativada!" }
    ],
    recompensa: "📱 iPhone Hackeado entregue ao chefe local",
    zona: "verde"
  },
  {
    id: 2,
    titulo: "OPERAÇÃO INTERNET POPULAR",
    subtitulo: "Fase 2: Infraestrutura Hacker",
    historia: "A comunidade precisa de internet barata. O Maromba tem um plano...",
    local: "Antena da Comunidade",
    passos: [
      { texto: "Subir na antena com equipamentos", equipamento: "jammer", acao: "Instalar Jammer na torre" },
      { texto: "Conectar repetidor de sinal", equipamento: "arduino", acao: "Configurar Arduino como roteador" },
      { texto: "Criar rede WiFi comunitária", equipamento: "transmissor", acao: "📶 Internet Popular: R$20/mês" }
    ],
    recompensa: "🌐 500 casas conectadas na Zona Verde",
    zona: "verde"
  },
  {
    id: 3,
    titulo: "OPERAÇÃO TV HACKEADA",
    subtitulo: "Fase 3: Controle de Mídia",
    historia: "A central de TV a cabo está vulnerável. Hora de controlar os comerciais...",
    local: "Central de TV → Zona Verde",
    passos: [
      { texto: "Localizar servidor OBS exposto", equipamento: "nip", acao: "Instalar NIP entre roteador e cabo" },
      { texto: "Acessar painel de controle remotamente", equipamento: "keylogger", acao: "Capturar senha do admin" },
      { texto: "Inserir comerciais próprios", equipamento: "transmissor", acao: "📺 SUPLEMENTOS MAIS BARATOS no ar!" }
    ],
    recompensa: "📢 Propaganda gratuita na TV local",
    zona: "verde"
  },
  {
    id: 4,
    titulo: "OPERAÇÃO CAFÉZINHO ESPECIAL",
    subtitulo: "Fase 4: Infiltração Corporativa",
    historia: "O Maromba conseguiu emprego no DETRAN como analista de sistemas...",
    local: "DETRAN - Setor de TI",
    passos: [
      { texto: "Adicionar ingrediente especial no café", equipamento: "nootropico", acao: "☕ Todo mundo relaxado..." },
      { texto: "Acessar banco de dados com privilégios", equipamento: "pendrive", acao: "💾 Backup completo iniciado" },
      { texto: "Extrair dados e sair pela porta da frente", equipamento: null, acao: "🚪 Missão cumprida!" }
    ],
    recompensa: "🗃️ Banco de dados completo baixado",
    zona: "amarela"
  },
  {
    id: 5,
    titulo: "OPERAÇÃO PEDÓFILO EXPOSTO",
    subtitulo: "Fase 5: Justiça Digital",
    historia: "Uma esposa desconfiada contratou o Maromba. O alvo: alto escalão da Petrobras...",
    local: "Residência do Alvo",
    passos: [
      { texto: "Instalar keylogger no computador", equipamento: "keylogger", acao: "⌨️ Monitoramento ativo" },
      { texto: "Esconder pen drive com timer de captura", equipamento: "pendrive", acao: "📸 Screenshots automáticos" },
      { texto: "Coletar evidências e entregar à esposa", equipamento: null, acao: "⚖️ Justiça será feita!" }
    ],
    recompensa: "🔒 Criminoso exposto, família protegida",
    zona: "vermelha"
  }
];

// Componente de Equipamento
const EquipamentoCard = ({ equip, selecionado, onClick }) => (
  <button
    onClick={onClick}
    className={`equip-card ${selecionado ? 'selecionado' : ''}`}
    data-testid={`equip-${equip}`}
  >
    <span className="equip-icon">{EQUIPAMENTOS[equip].icon}</span>
    <span className="equip-nome">{EQUIPAMENTOS[equip].nome}</span>
  </button>
);

// Componente de Passo da Missão
const PassoMissao = ({ passo, numero, completo, atual, onCompletar }) => (
  <div className={`passo ${completo ? 'completo' : ''} ${atual ? 'atual' : ''}`}>
    <div className="passo-numero">{completo ? '✓' : numero}</div>
    <div className="passo-content">
      <p className="passo-texto">{passo.texto}</p>
      {atual && (
        <button 
          className="btn-acao glow-btn"
          onClick={onCompletar}
          data-testid={`completar-passo-${numero}`}
        >
          {passo.acao}
        </button>
      )}
    </div>
  </div>
);

// Tela Inicial
const TelaInicial = ({ onIniciar }) => (
  <div className="tela-inicial" data-testid="tela-inicial">
    <div className="logo-container-main">
      <img src={LOGO_URL} alt="Logo" className="logo-main" />
    </div>
    
    <div className="titulo-container">
      <h1 className="titulo-glow">MILÍCIA DIGITAL</h1>
      <p className="subtitulo">O Jogo do Maromba Hacker</p>
    </div>
    
    <div className="mascot-hero">
      <img src={MASCOT_URL} alt="O Maromba" className="mascot-img pulse" />
      <div className="mascot-info">
        <span className="label-glow">PROTAGONISTA</span>
        <h2>O MAROMBA</h2>
        <p>Vendedor de Suplementos & Hacker Social</p>
        <p className="location">📍 Motel Amarelinho, Zona Verde</p>
      </div>
    </div>

    <div className="info-box">
      <h3>🎮 COMO JOGAR</h3>
      <ul>
        <li>Escolha missões de hacking social</li>
        <li>Use equipamentos certos em cada passo</li>
        <li>Defenda a <span className="text-green">ZONA VERDE</span> da invasão</li>
        <li>Jogo rápido de ~3 minutos</li>
      </ul>
    </div>

    <button 
      className="btn-iniciar glow-btn"
      onClick={onIniciar}
      data-testid="btn-iniciar"
    >
      ▶ INICIAR OPERAÇÃO
    </button>

    <p className="disclaimer">
      🧠 Use nootrópicos para manter o foco!<br/>
      💪 Suplementos Mais Baratos - Energia para hackear!
    </p>
  </div>
);

// Tela de Seleção de Missão
const TelaMissoes = ({ onSelectMissao }) => (
  <div className="tela-missoes" data-testid="tela-missoes">
    <h2 className="titulo-secao">SELECIONE A OPERAÇÃO</h2>
    
    <div className="missoes-grid">
      {MISSOES.map((missao) => (
        <button
          key={missao.id}
          className={`missao-card zona-${missao.zona}`}
          onClick={() => onSelectMissao(missao)}
          data-testid={`missao-${missao.id}`}
        >
          <div className="missao-header">
            <span className="missao-id">OP-{missao.id.toString().padStart(2, '0')}</span>
            <span className={`zona-tag ${missao.zona}`}>
              {missao.zona === 'verde' ? '🟢 ZONA VERDE' : 
               missao.zona === 'amarela' ? '🟡 ZONA AMARELA' : '🔴 ZONA VERMELHA'}
            </span>
          </div>
          <h3>{missao.titulo}</h3>
          <p className="missao-subtitulo">{missao.subtitulo}</p>
          <p className="missao-local">📍 {missao.local}</p>
        </button>
      ))}
    </div>
  </div>
);

// Tela de Jogo da Missão
const TelaMissao = ({ missao, onVoltar, onConcluir }) => {
  const [passoAtual, setPassoAtual] = useState(0);
  const [passosCompletos, setPassosCompletos] = useState([]);
  const [equipSelecionado, setEquipSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [concluida, setConcluida] = useState(false);

  const completarPasso = () => {
    const passo = missao.passos[passoAtual];
    
    // Verificar se precisa de equipamento
    if (passo.equipamento && equipSelecionado !== passo.equipamento) {
      setMensagem({ tipo: 'erro', texto: `❌ Use o equipamento correto: ${EQUIPAMENTOS[passo.equipamento].nome}` });
      setTimeout(() => setMensagem(null), 2000);
      return;
    }

    // Completar passo
    setPassosCompletos([...passosCompletos, passoAtual]);
    setMensagem({ tipo: 'sucesso', texto: '✓ Passo completado!' });
    
    setTimeout(() => {
      setMensagem(null);
      if (passoAtual < missao.passos.length - 1) {
        setPassoAtual(passoAtual + 1);
        setEquipSelecionado(null);
      } else {
        setConcluida(true);
      }
    }, 1000);
  };

  if (concluida) {
    return (
      <div className="tela-conclusao" data-testid="tela-conclusao">
        <div className="conclusao-content">
          <div className="sucesso-icon">🎯</div>
          <h2 className="titulo-glow">MISSÃO COMPLETA!</h2>
          <h3>{missao.titulo}</h3>
          <div className="recompensa-box">
            <span className="label-glow">RECOMPENSA</span>
            <p>{missao.recompensa}</p>
          </div>
          <div className="mascot-mini">
            <img src={MASCOT_URL} alt="Maromba" />
            <p>"Mais uma pro currículo hacker!"</p>
          </div>
          <div className="btn-group">
            <button className="btn-secundario" onClick={onVoltar} data-testid="btn-voltar-missoes">
              ← OUTRAS MISSÕES
            </button>
            <button className="btn-iniciar glow-btn" onClick={onConcluir} data-testid="btn-proxima">
              PRÓXIMA →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tela-missao" data-testid="tela-missao">
      {/* Header da Missão */}
      <div className="missao-header-full">
        <button className="btn-voltar" onClick={onVoltar} data-testid="btn-voltar">
          ← Voltar
        </button>
        <div className="missao-info">
          <span className={`zona-tag ${missao.zona}`}>
            {missao.zona === 'verde' ? '🟢 ZONA VERDE' : 
             missao.zona === 'amarela' ? '🟡 ZONA AMARELA' : '🔴 ZONA VERMELHA'}
          </span>
          <h2>{missao.titulo}</h2>
        </div>
      </div>

      {/* História */}
      <div className="historia-box">
        <p>{missao.historia}</p>
        <span className="local-tag">📍 {missao.local}</span>
      </div>

      {/* Equipamentos */}
      <div className="equipamentos-section">
        <h3>🛠️ EQUIPAMENTOS</h3>
        <div className="equips-grid">
          {Object.keys(EQUIPAMENTOS).map((equip) => (
            <EquipamentoCard
              key={equip}
              equip={equip}
              selecionado={equipSelecionado === equip}
              onClick={() => setEquipSelecionado(equip)}
            />
          ))}
        </div>
        {equipSelecionado && (
          <p className="equip-desc">
            {EQUIPAMENTOS[equipSelecionado].icon} {EQUIPAMENTOS[equipSelecionado].desc}
          </p>
        )}
      </div>

      {/* Passos da Missão */}
      <div className="passos-section">
        <h3>📋 PASSOS DA OPERAÇÃO</h3>
        <div className="passos-list">
          {missao.passos.map((passo, idx) => (
            <PassoMissao
              key={idx}
              passo={passo}
              numero={idx + 1}
              completo={passosCompletos.includes(idx)}
              atual={passoAtual === idx && !passosCompletos.includes(idx)}
              onCompletar={completarPasso}
            />
          ))}
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`} data-testid="mensagem">
          {mensagem.texto}
        </div>
      )}

      {/* Dica do Passo Atual */}
      {missao.passos[passoAtual]?.equipamento && !passosCompletos.includes(passoAtual) && (
        <div className="dica-box">
          💡 <strong>DICA:</strong> Selecione o <span className="highlight">{EQUIPAMENTOS[missao.passos[passoAtual].equipamento].nome}</span> para este passo
        </div>
      )}
    </div>
  );
};

// App Principal
function App() {
  const [tela, setTela] = useState('inicial'); // inicial, missoes, jogo
  const [missaoAtual, setMissaoAtual] = useState(null);
  const [missaoConcluida, setMissaoConcluida] = useState(0);

  const iniciarJogo = () => setTela('missoes');
  
  const selecionarMissao = (missao) => {
    setMissaoAtual(missao);
    setTela('jogo');
  };

  const voltarMissoes = () => {
    setMissaoAtual(null);
    setTela('missoes');
  };

  const proximaMissao = () => {
    const idx = MISSOES.findIndex(m => m.id === missaoAtual.id);
    if (idx < MISSOES.length - 1) {
      setMissaoAtual(MISSOES[idx + 1]);
      setMissaoConcluida(missaoConcluida + 1);
    } else {
      setTela('missoes');
      setMissaoConcluida(missaoConcluida + 1);
    }
  };

  return (
    <div className="app-container" data-testid="app-container">
      {/* Background do Mapa */}
      <div 
        className="map-background"
        style={{ backgroundImage: `url(${MAP_BG})` }}
      />
      
      {/* Overlay escuro */}
      <div className="overlay" />

      {/* Scanlines Effect */}
      <div className="scanlines" />

      {/* Conteúdo */}
      <div className="content">
        {tela === 'inicial' && <TelaInicial onIniciar={iniciarJogo} />}
        {tela === 'missoes' && <TelaMissoes onSelectMissao={selecionarMissao} />}
        {tela === 'jogo' && missaoAtual && (
          <TelaMissao 
            missao={missaoAtual} 
            onVoltar={voltarMissoes}
            onConcluir={proximaMissao}
          />
        )}
      </div>

      {/* Footer fixo */}
      <div className="footer-fixed">
        <img src={LOGO_URL} alt="Logo" className="footer-logo" />
        <span>Suplementos Mais Baratos</span>
        <span className="separator">|</span>
        <span>💪 Energia para Hackear</span>
      </div>
    </div>
  );
}

export default App;
