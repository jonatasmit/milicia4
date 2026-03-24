import { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [insights, setInsights] = useState(null);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('overview');

  const headers = { 'Authorization': 'Basic ' + btoa(`${user}:${pass}`) };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/analytics`, { headers });
      if (res.ok) {
        setAuth(true);
        fetchData();
      } else {
        setError('Credenciais inválidas');
      }
    } catch (e) {
      setError('Erro de conexão');
    }
    setLoading(false);
  };

  const fetchData = async () => {
    try {
      const [analyticsRes, funnelRes, insightsRes, eventsRes] = await Promise.all([
        fetch(`${API}/admin/analytics`, { headers }),
        fetch(`${API}/admin/funnel`, { headers }),
        fetch(`${API}/admin/insights`, { headers }),
        fetch(`${API}/admin/events?limit=50`, { headers })
      ]);
      
      setAnalytics(await analyticsRes.json());
      setFunnel(await funnelRes.json());
      setInsights(await insightsRes.json());
      setEvents(await eventsRes.json());
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  useEffect(() => {
    if (auth) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [auth]);

  if (!auth) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBox}>
          <h1 style={styles.loginTitle}>🔐 ADMIN</h1>
          <p style={styles.loginSub}>Milícia Digital Analytics</p>
          <form onSubmit={login}>
            <input
              type="text"
              placeholder="Usuário"
              value={user}
              onChange={e => setUser(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Senha"
              value={pass}
              onChange={e => setPass(e.target.value)}
              style={styles.input}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.loginBtn} disabled={loading}>
              {loading ? 'Entrando...' : 'ENTRAR'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1>📊 Milícia Digital - Dashboard</h1>
        <button onClick={fetchData} style={styles.refreshBtn}>🔄 Atualizar</button>
      </header>

      <nav style={styles.tabs}>
        {['overview', 'funnel', 'insights', 'events'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
          >
            {t === 'overview' ? '📈 Visão Geral' : 
             t === 'funnel' ? '🎯 Funil' : 
             t === 'insights' ? '💡 Insights' : '📋 Eventos'}
          </button>
        ))}
      </nav>

      <main style={styles.content}>
        {tab === 'overview' && analytics && (
          <div>
            <div style={styles.statsGrid}>
              <StatCard title="Visitas" value={analytics.total_visits} icon="👁️" color="#00d4ff" />
              <StatCard title="Sessões Únicas" value={analytics.unique_sessions} icon="👤" color="#00ff41" />
              <StatCard title="Clicou Jogar" value={analytics.play_clicks} icon="▶️" color="#ffcc00" />
              <StatCard title="Missões Iniciadas" value={analytics.missions_started} icon="🎮" color="#ff9500" />
              <StatCard title="Missões Completas" value={analytics.missions_completed} icon="✅" color="#34c759" />
              <StatCard title="Cliques WhatsApp" value={analytics.whatsapp_clicks} icon="💬" color="#25d366" />
              <StatCard title="Taxa Conversão" value={`${analytics.conversion_rate}%`} icon="📊" color="#ff3b30" />
              <StatCard title="XP Médio" value={analytics.avg_xp} icon="⭐" color="#af52de" />
            </div>

            <div style={styles.alertBox}>
              <h3>⚠️ Problema Identificado</h3>
              <p>Muitos acessos ({analytics.total_visits}) mas poucos cliques no WhatsApp ({analytics.whatsapp_clicks}).</p>
              <p><strong>Taxa de conversão: {analytics.conversion_rate}%</strong></p>
              <p style={{marginTop: '10px', color: '#ffcc00'}}>
                Sugestões: Botão WhatsApp maior, CTA mais urgente, mostrar produto específico na tela inicial.
              </p>
            </div>
          </div>
        )}

        {tab === 'funnel' && funnel && (
          <div>
            <h2 style={styles.sectionTitle}>Funil de Conversão</h2>
            <div style={styles.funnelContainer}>
              {funnel.funnel.map((step, i) => (
                <div key={i} style={{...styles.funnelStep, width: `${Math.max(20, step.rate)}%`}}>
                  <div style={styles.funnelBar}>
                    <span style={styles.funnelLabel}>{step.step}</span>
                    <span style={styles.funnelCount}>{step.count}</span>
                    <span style={styles.funnelRate}>{step.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'insights' && insights && (
          <div>
            <h2 style={styles.sectionTitle}>💡 Insights de IA</h2>
            {insights.insights.length === 0 ? (
              <p style={{color: '#888'}}>Sem insights disponíveis ainda.</p>
            ) : (
              insights.insights.map((insight, i) => (
                <div key={i} style={{
                  ...styles.insightCard,
                  borderColor: insight.type === 'critical' ? '#ff3b30' : 
                               insight.type === 'warning' ? '#ffcc00' : 
                               insight.type === 'success' ? '#34c759' : '#666'
                }}>
                  <div style={styles.insightHeader}>
                    <span style={{
                      ...styles.insightType,
                      background: insight.type === 'critical' ? '#ff3b30' : 
                                  insight.type === 'warning' ? '#ffcc00' : 
                                  insight.type === 'success' ? '#34c759' : '#666'
                    }}>
                      {insight.type === 'critical' ? '🚨' : 
                       insight.type === 'warning' ? '⚠️' : 
                       insight.type === 'success' ? '✅' : 'ℹ️'}
                    </span>
                    <h3>{insight.title}</h3>
                    <span style={styles.insightMetric}>{insight.metric}</span>
                  </div>
                  <p>{insight.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'events' && (
          <div>
            <h2 style={styles.sectionTitle}>📋 Últimos Eventos</h2>
            <div style={styles.eventsTable}>
              <div style={styles.eventHeader}>
                <span>Tipo</span>
                <span>Sessão</span>
                <span>Data</span>
                <span>Dados</span>
              </div>
              {events.map((event, i) => (
                <div key={i} style={styles.eventRow}>
                  <span style={{...styles.eventType, background: getEventColor(event.event_type)}}>
                    {event.event_type}
                  </span>
                  <span style={styles.eventSession}>{event.session_id?.slice(-8)}</span>
                  <span style={styles.eventDate}>
                    {new Date(event.created_at).toLocaleString('pt-BR')}
                  </span>
                  <span style={styles.eventData}>
                    {event.mission_id ? `Missão ${event.mission_id}` : ''}
                    {event.xp ? ` XP:${event.xp}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => (
  <div style={{...styles.statCard, borderColor: color}}>
    <span style={styles.statIcon}>{icon}</span>
    <div>
      <p style={{...styles.statValue, color}}>{value}</p>
      <p style={styles.statTitle}>{title}</p>
    </div>
  </div>
);

const getEventColor = (type) => {
  const colors = {
    page_view: '#00d4ff',
    click_play: '#ffcc00',
    mission_start: '#ff9500',
    step_complete: '#af52de',
    mission_complete: '#34c759',
    whatsapp_click: '#25d366',
    cupom_view: '#ff3b30'
  };
  return colors[type] || '#666';
};

const styles = {
  loginPage: {
    minHeight: '100vh', background: '#0a0a0f', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace'
  },
  loginBox: {
    background: '#111', border: '1px solid #333', borderRadius: '12px',
    padding: '2rem', maxWidth: '320px', width: '100%', textAlign: 'center'
  },
  loginTitle: { color: '#00ff41', fontSize: '1.5rem', marginBottom: '0.5rem' },
  loginSub: { color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' },
  input: {
    width: '100%', padding: '0.75rem', marginBottom: '0.75rem',
    background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
    color: '#fff', fontSize: '0.9rem'
  },
  loginBtn: {
    width: '100%', padding: '0.75rem', background: '#00ff41', color: '#000',
    border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold',
    cursor: 'pointer'
  },
  error: { color: '#ff3b30', fontSize: '0.8rem', marginBottom: '0.75rem' },
  
  dashboard: { minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'monospace' },
  header: {
    background: '#111', borderBottom: '1px solid #333', padding: '1rem 1.5rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  refreshBtn: { background: '#333', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  
  tabs: { display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', background: '#111', borderBottom: '1px solid #222' },
  tab: { background: 'none', border: 'none', color: '#888', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '6px' },
  tabActive: { background: '#00ff41', color: '#000' },
  
  content: { padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: {
    background: '#111', border: '2px solid', borderRadius: '10px', padding: '1rem',
    display: 'flex', alignItems: 'center', gap: '1rem'
  },
  statIcon: { fontSize: '2rem' },
  statValue: { fontSize: '1.5rem', fontWeight: 'bold' },
  statTitle: { fontSize: '0.75rem', color: '#888' },
  
  alertBox: {
    background: 'rgba(255,59,48,0.1)', border: '1px solid #ff3b30', borderRadius: '10px',
    padding: '1rem', marginTop: '1rem'
  },
  
  sectionTitle: { color: '#00ff41', marginBottom: '1rem' },
  
  funnelContainer: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  funnelStep: { transition: 'width 0.3s' },
  funnelBar: {
    background: 'linear-gradient(90deg, #00ff41, #00d4ff)', borderRadius: '6px',
    padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', color: '#000'
  },
  funnelLabel: { fontWeight: 'bold', fontSize: '0.8rem' },
  funnelCount: { fontSize: '1.2rem', fontWeight: 'bold' },
  funnelRate: { fontSize: '0.8rem' },
  
  insightCard: { background: '#111', border: '2px solid', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' },
  insightHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' },
  insightType: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' },
  insightMetric: { marginLeft: 'auto', color: '#00ff41', fontWeight: 'bold' },
  
  eventsTable: { background: '#111', borderRadius: '10px', overflow: 'hidden' },
  eventHeader: {
    display: 'grid', gridTemplateColumns: '120px 100px 150px 1fr', gap: '1rem',
    padding: '0.75rem 1rem', background: '#1a1a1a', fontWeight: 'bold', fontSize: '0.75rem'
  },
  eventRow: {
    display: 'grid', gridTemplateColumns: '120px 100px 150px 1fr', gap: '1rem',
    padding: '0.5rem 1rem', borderBottom: '1px solid #222', fontSize: '0.75rem'
  },
  eventType: { padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff', textAlign: 'center' },
  eventSession: { color: '#888' },
  eventDate: { color: '#666' },
  eventData: { color: '#00d4ff' }
};
