# Milícia Digital - PRD

## Problema Original
Criar um simulador de estratégia militar interativo para proteção da zona verde entre Cidade de Deus e Gardênia Azul no Rio de Janeiro. O usuário é o "General" e precisa defender seus terrenos de invasões.

## Requisitos do Usuário
- Tipo: Simulador estilo jogo interativo (opção a)
- Funcionalidades: Permitir adicionar/mover pinos e desenhar rotas manualmente (opção b)
- Elementos: Todos - pinos de posição (QG, aliados, inimigos), rotas de ataque/defesa, zonas de proteção/perigo (opção d)
- QG: Motel Amarelinho - Av Vice Presidente José de Alencar n 1400
- Tema: Militar tático escuro estilo radar/comando (opção a)
- Domínio: miliciadigital.suplementosmaisbaratos.com.br
- Usar logo "Suplementos Mais Baratos" e mascote musculoso

## Arquitetura

### Backend (FastAPI + MongoDB)
- `/api/pins` - CRUD de pinos (HQ, aliados, inimigos)
- `/api/routes` - CRUD de rotas (ataque, defesa, patrulha)
- `/api/zones` - CRUD de zonas (perigo, proteção)
- `/api/map-state` - Estado completo do mapa
- `/api/clear-all` - Limpar todos os elementos

### Frontend (React + Leaflet)
- Mapa interativo com tema escuro CartoDB Dark Matter
- Sidebar branca estilo brutalist com ferramentas
- Marcadores customizados com ícones Lucide
- Suporte a drag-and-drop de pinos
- Overlay de radar com animação de varredura

## O que foi implementado (23/03/2026)
- ✅ Backend completo com FastAPI e MongoDB
- ✅ Frontend com React e Leaflet
- ✅ Adicionar/mover pinos (QG, aliados, inimigos)
- ✅ Desenhar rotas (ataque, defesa, patrulha)
- ✅ Criar zonas (perigo, proteção)
- ✅ Drag-and-drop de pinos
- ✅ Botão "Finalizar Rota" para facilitar UX
- ✅ Efeito radar sweep animado
- ✅ Grid de coordenadas
- ✅ Contador de status da operação
- ✅ Logo e mascote integrados
- ✅ Tema militar tático escuro

## User Personas
- **O General**: Comandante que precisa visualizar e gerenciar estratégias de defesa territorial

## Próximas Tarefas (P1/P2)
- P1: Adicionar labels editáveis aos pinos
- P1: Salvar/carregar múltiplas operações
- P2: Histórico de movimentações
- P2: Exportar mapa como imagem
- P2: Modo de replay de operações
