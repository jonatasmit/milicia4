import { useState, useEffect, useCallback, useRef } from "react";
import "@/App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { MapPin, Shield, Skull, Route, CircleDashed, Trash2, Menu, X, Target, Crosshair } from "lucide-react";
import ReactDOMServer from "react-dom/server";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Assets
const LOGO_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/1wasgcls_72bc90c6-d374-4fd6-bbae-b07bd26cd19b.jpeg";
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_6fa49454-f216-41c4-ad6c-e1d8bfe3a11e/artifacts/nfwqyisr_ae0cd023-034e-4d51-b06f-2e3454bac50f.jpeg";

// Map center (Cidade de Deus / Gardênia Azul area)
const MAP_CENTER = [-22.945, -43.365];
const HQ_POSITION = [-22.9435, -43.3580]; // Motel Amarelinho approximate position

// Create custom icons
const createIcon = (type) => {
  const colors = {
    hq: { bg: "#FFCC00", text: "#000" },
    ally: { bg: "#007AFF", text: "#fff" },
    enemy: { bg: "#FF3B30", text: "#fff" },
  };
  
  const icons = {
    hq: Target,
    ally: Shield,
    enemy: Skull,
  };
  
  const IconComponent = icons[type];
  const color = colors[type];
  
  const iconHtml = ReactDOMServer.renderToString(
    <div style={{
      width: "40px",
      height: "40px",
      background: color.bg,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `3px solid ${color.bg}`,
      boxShadow: `0 0 20px ${color.bg}`,
    }}>
      <IconComponent size={20} color={color.text} />
    </div>
  );
  
  return L.divIcon({
    html: iconHtml,
    className: `custom-marker marker-${type}`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Map click handler component
const MapClickHandler = ({ activeTool, onMapClick, setMousePosition }) => {
  useMapEvents({
    click: (e) => {
      if (activeTool) {
        onMapClick(e.latlng);
      }
    },
    mousemove: (e) => {
      setMousePosition(e.latlng);
    },
  });
  return null;
};

// Draggable marker component
const DraggableMarker = ({ position, icon, pinId, onDragEnd, label }) => {
  const markerRef = useRef(null);
  
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        onDragEnd(pinId, newPos);
      }
    },
  };
  
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icon}
    />
  );
};

// Command Sidebar Component
const CommandSidebar = ({
  isOpen,
  setIsOpen,
  activeTool,
  setActiveTool,
  pins,
  routes,
  zones,
  onDeletePin,
  onDeleteRoute,
  onDeleteZone,
  onClearAll,
  mousePosition,
  routePoints,
}) => {
  const pinStats = {
    hq: pins.filter(p => p.pin_type === "hq").length,
    ally: pins.filter(p => p.pin_type === "ally").length,
    enemy: pins.filter(p => p.pin_type === "enemy").length,
  };

  return (
    <aside className={`command-sidebar command-panel ${isOpen ? "open" : ""}`} data-testid="command-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={LOGO_URL} alt="Suplementos Mais Baratos" />
        </div>
        <div className="header-info">
          <h1>Milícia Digital</h1>
          <div className="status">
            <div className="status-online"></div>
            <span>Sistema Operacional</span>
          </div>
        </div>
        <button className="mobile-close md:hidden" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* General Section */}
      <div className="general-section">
        <div className="mascot-container">
          <img src={MASCOT_URL} alt="General" />
        </div>
        <div className="general-info">
          <div className="label">Comandante</div>
          <div className="name">O General</div>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="section">
        <div className="coords-display">
          <div className="label">Coordenadas do Cursor</div>
          <div>
            LAT: {mousePosition ? mousePosition.lat.toFixed(6) : "---"}
            <br />
            LNG: {mousePosition ? mousePosition.lng.toFixed(6) : "---"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="section">
        <div className="section-title">Status da Operação</div>
        <div className="stats-grid">
          <div className="stat-item hq">
            <div className="value">{pinStats.hq}</div>
            <div className="label">QG</div>
          </div>
          <div className="stat-item ally">
            <div className="value">{pinStats.ally}</div>
            <div className="label">Aliados</div>
          </div>
          <div className="stat-item enemy">
            <div className="value">{pinStats.enemy}</div>
            <div className="label">Inimigos</div>
          </div>
        </div>
      </div>

      {/* Pin Tools */}
      <div className="section">
        <div className="section-title">Adicionar Pinos</div>
        <div className="tools-grid">
          <button
            className={`btn-brutalist btn-hq ${activeTool === "pin-hq" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "pin-hq" ? null : "pin-hq")}
            data-testid="add-hq-button"
          >
            <Target size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            QG
          </button>
          <button
            className={`btn-brutalist btn-ally ${activeTool === "pin-ally" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "pin-ally" ? null : "pin-ally")}
            data-testid="add-ally-button"
          >
            <Shield size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            Aliado
          </button>
          <button
            className={`btn-brutalist btn-enemy ${activeTool === "pin-enemy" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "pin-enemy" ? null : "pin-enemy")}
            data-testid="add-enemy-button"
          >
            <Skull size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            Inimigo
          </button>
        </div>
      </div>

      {/* Route Tools */}
      <div className="section">
        <div className="section-title">Desenhar Rotas</div>
        <div className="tools-grid">
          <button
            className={`btn-brutalist btn-attack ${activeTool === "route-attack" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "route-attack" ? null : "route-attack")}
            data-testid="draw-attack-route"
          >
            <Route size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            Ataque
          </button>
          <button
            className={`btn-brutalist btn-defense ${activeTool === "route-defense" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "route-defense" ? null : "route-defense")}
            data-testid="draw-defense-route"
          >
            <Route size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            Defesa
          </button>
          <button
            className={`btn-brutalist btn-patrol ${activeTool === "route-patrol" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "route-patrol" ? null : "route-patrol")}
            data-testid="draw-patrol-route"
          >
            <Route size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            Patrulha
          </button>
        </div>
        {routePoints.length > 0 && (
          <div className="mt-2 text-xs font-mono text-gray-500">
            Pontos: {routePoints.length} (duplo-clique para finalizar)
          </div>
        )}
      </div>

      {/* Zone Tools */}
      <div className="section">
        <div className="section-title">Criar Zonas</div>
        <div className="tools-grid">
          <button
            className={`btn-brutalist btn-danger ${activeTool === "zone-danger" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "zone-danger" ? null : "zone-danger")}
            data-testid="create-danger-zone"
          >
            <CircleDashed size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            Perigo
          </button>
          <button
            className={`btn-brutalist btn-protection ${activeTool === "zone-protection" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "zone-protection" ? null : "zone-protection")}
            data-testid="create-protection-zone"
          >
            <CircleDashed size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
            Proteção
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="section">
        <div className="section-title">Legenda</div>
        <div className="legend-list">
          <div className="legend-item">
            <div className="legend-dot hq"></div>
            <span>Quartel General</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot ally"></div>
            <span>Tropas Aliadas</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot enemy"></div>
            <span>Posição Inimiga</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot attack"></div>
            <span>Rota de Ataque</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot defense"></div>
            <span>Rota de Defesa</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot patrol"></div>
            <span>Rota de Patrulha</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot danger"></div>
            <span>Zona de Perigo</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot protection"></div>
            <span>Zona de Proteção</span>
          </div>
        </div>
      </div>

      {/* Clear All */}
      <div className="section">
        <button
          className="btn-brutalist full-width"
          onClick={onClearAll}
          data-testid="clear-all-button"
          style={{ width: "100%", background: "#FF3B30", color: "#fff", borderColor: "#FF3B30" }}
        >
          <Trash2 size={14} style={{ marginRight: "0.5rem", display: "inline" }} />
          Limpar Tudo
        </button>
      </div>
    </aside>
  );
};

// Main App Component
function App() {
  const [pins, setPins] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [zones, setZones] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [mousePosition, setMousePosition] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/map-state`);
        setPins(response.data.pins || []);
        setRoutes(response.data.routes || []);
        setZones(response.data.zones || []);
      } catch (error) {
        console.error("Error fetching map state:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle map click based on active tool
  const handleMapClick = useCallback(async (latlng) => {
    if (!activeTool) return;

    try {
      // Pin tools
      if (activeTool.startsWith("pin-")) {
        const pinType = activeTool.replace("pin-", "");
        const response = await axios.post(`${API}/pins`, {
          lat: latlng.lat,
          lng: latlng.lng,
          pin_type: pinType,
          label: pinType === "hq" ? "Quartel General" : null,
        });
        setPins(prev => [...prev, response.data]);
        setActiveTool(null);
      }
      
      // Route tools
      if (activeTool.startsWith("route-")) {
        setRoutePoints(prev => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
      }
      
      // Zone tools
      if (activeTool.startsWith("zone-")) {
        const zoneType = activeTool.replace("zone-", "");
        const response = await axios.post(`${API}/zones`, {
          lat: latlng.lat,
          lng: latlng.lng,
          radius: 200,
          zone_type: zoneType,
        });
        setZones(prev => [...prev, response.data]);
        setActiveTool(null);
      }
    } catch (error) {
      console.error("Error creating element:", error);
    }
  }, [activeTool]);

  // Handle double click to finish route
  const handleMapDoubleClick = useCallback(async () => {
    if (activeTool?.startsWith("route-") && routePoints.length >= 2) {
      const routeType = activeTool.replace("route-", "");
      try {
        const response = await axios.post(`${API}/routes`, {
          points: routePoints,
          route_type: routeType,
        });
        setRoutes(prev => [...prev, response.data]);
        setRoutePoints([]);
        setActiveTool(null);
      } catch (error) {
        console.error("Error creating route:", error);
      }
    }
  }, [activeTool, routePoints]);

  // Handle pin drag
  const handlePinDrag = async (pinId, newPos) => {
    try {
      const response = await axios.put(`${API}/pins/${pinId}`, {
        lat: newPos.lat,
        lng: newPos.lng,
      });
      setPins(prev => prev.map(p => p.id === pinId ? response.data : p));
    } catch (error) {
      console.error("Error updating pin:", error);
    }
  };

  // Delete handlers
  const handleDeletePin = async (pinId) => {
    try {
      await axios.delete(`${API}/pins/${pinId}`);
      setPins(prev => prev.filter(p => p.id !== pinId));
    } catch (error) {
      console.error("Error deleting pin:", error);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      await axios.delete(`${API}/routes/${routeId}`);
      setRoutes(prev => prev.filter(r => r.id !== routeId));
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    try {
      await axios.delete(`${API}/zones/${zoneId}`);
      setZones(prev => prev.filter(z => z.id !== zoneId));
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Tem certeza que deseja limpar todos os elementos do mapa?")) {
      try {
        await axios.delete(`${API}/clear-all`);
        setPins([]);
        setRoutes([]);
        setZones([]);
      } catch (error) {
        console.error("Error clearing map:", error);
      }
    }
  };

  // Get route color based on type
  const getRouteColor = (type) => {
    const colors = {
      attack: "#FF3B30",
      defense: "#007AFF",
      patrol: "#FFCC00",
    };
    return colors[type] || "#fff";
  };

  // Get zone style based on type
  const getZoneStyle = (type) => {
    if (type === "danger") {
      return {
        fillColor: "#FF3B30",
        fillOpacity: 0.25,
        color: "#FF3B30",
        weight: 2,
      };
    }
    return {
      fillColor: "#007AFF",
      fillOpacity: 0.25,
      color: "#007AFF",
      weight: 2,
    };
  };

  if (loading) {
    return (
      <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#00FF41", fontFamily: "JetBrains Mono" }}>
          <Crosshair size={48} className="animate-spin" />
          <p style={{ marginTop: "1rem" }}>CARREGANDO SISTEMA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" data-testid="app-container">
      {/* Mobile Toggle */}
      <button 
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        data-testid="mobile-menu-toggle"
      >
        <Menu size={24} />
      </button>

      {/* Command Sidebar */}
      <CommandSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        pins={pins}
        routes={routes}
        zones={zones}
        onDeletePin={handleDeletePin}
        onDeleteRoute={handleDeleteRoute}
        onDeleteZone={handleDeleteZone}
        onClearAll={handleClearAll}
        mousePosition={mousePosition}
        routePoints={routePoints}
      />

      {/* Map Container */}
      <div className="map-container" data-testid="map-container">
        {/* Radar Grid Overlay */}
        <div className="radar-grid"></div>
        
        {/* Radar Sweep Overlay */}
        <div className="radar-sweep"></div>

        <MapContainer
          center={MAP_CENTER}
          zoom={15}
          style={{ width: "100%", height: "100vh" }}
          doubleClickZoom={false}
          ondblclick={handleMapDoubleClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MapClickHandler
            activeTool={activeTool}
            onMapClick={handleMapClick}
            setMousePosition={setMousePosition}
          />

          {/* Render Zones */}
          {zones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={getZoneStyle(zone.zone_type)}
            />
          ))}

          {/* Render Routes */}
          {routes.map((route) => (
            <Polyline
              key={route.id}
              positions={route.points.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: getRouteColor(route.route_type),
                weight: 4,
                opacity: 0.8,
                dashArray: route.route_type === "patrol" ? "10, 10" : null,
              }}
            />
          ))}

          {/* Render current drawing route */}
          {routePoints.length > 0 && (
            <Polyline
              positions={routePoints.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: "#00FF41",
                weight: 3,
                opacity: 0.5,
                dashArray: "5, 5",
              }}
            />
          )}

          {/* Render Pins */}
          {pins.map((pin) => (
            <DraggableMarker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={createIcon(pin.pin_type)}
              pinId={pin.id}
              onDragEnd={handlePinDrag}
              label={pin.label}
            />
          ))}
        </MapContainer>
      </div>

      {/* Active Tool Indicator */}
      {activeTool && (
        <div 
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            color: "#000",
            padding: "0.75rem 1.5rem",
            fontFamily: "JetBrains Mono",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            border: "2px solid #000",
            zIndex: 1000,
          }}
          data-testid="active-tool-indicator"
        >
          Ferramenta Ativa: {activeTool.replace("-", " ").toUpperCase()}
          {activeTool.startsWith("route-") && " (clique para adicionar pontos, duplo-clique para finalizar)"}
        </div>
      )}
    </div>
  );
}

export default App;
