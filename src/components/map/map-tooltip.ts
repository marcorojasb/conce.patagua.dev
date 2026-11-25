// Un solo tooltip para todo el mapa: trazados, paradas, paraderos, capas
// temáticas, marcadores y micros. Antes cada parada y cada micro traía el suyo
// (miles de L.Tooltip y, al abrirse, un reflow por cada uno). El contenido se
// arma con textContent, nunca con HTML: los nombres vienen de datasets externos.
//
// Formato común: línea principal en negrita y una secundaria apagada.
// Una micro bajo el puntero tiene prioridad sobre el trazado de abajo; eligiendo
// un punto del planificador no se muestra nada (setMapTooltipEnabled).

import L from 'leaflet';

type TooltipSource = 'feature' | 'vehicle';

interface TooltipState {
  tooltip: L.Tooltip;
  primary: HTMLElement;
  secondary: HTMLElement;
  source: TooltipSource | null;
  enabled: boolean;
}

const states = new WeakMap<L.Map, TooltipState>();

function stateFor(map: L.Map): TooltipState {
  let state = states.get(map);
  if (state) return state;
  const content = document.createElement('div');
  content.className = 'map-tooltip';
  const primary = document.createElement('div');
  primary.className = 'map-tooltip-primary';
  const secondary = document.createElement('div');
  secondary.className = 'map-tooltip-secondary';
  content.append(primary, secondary);
  const tooltip = L.tooltip({ direction: 'top', offset: [0, -10], opacity: 1, className: 'map-tooltip-wrap' });
  tooltip.setContent(content);
  state = { tooltip, primary, secondary, source: null, enabled: true };
  states.set(map, state);
  return state;
}

export function showMapTooltip(
  map: L.Map,
  latlng: L.LatLngExpression,
  primary: string,
  secondary?: string,
  source: TooltipSource = 'feature',
): void {
  const state = stateFor(map);
  if (!state.enabled) return;
  if (state.source === 'vehicle' && source === 'feature') return;
  if (state.primary.textContent !== primary) state.primary.textContent = primary;
  const second = secondary ?? '';
  if (state.secondary.textContent !== second) state.secondary.textContent = second;
  state.secondary.hidden = second === '';
  state.source = source;
  state.tooltip.setLatLng(latlng);
  if (!map.hasLayer(state.tooltip)) state.tooltip.addTo(map);
}

/** Con `source`, solo lo cierra si lo abrió esa fuente (una micro no cierra el de un trazado y viceversa). */
export function hideMapTooltip(map: L.Map, source?: TooltipSource): void {
  const state = states.get(map);
  if (!state || state.source === null) return;
  if (source && state.source !== source) return;
  state.source = null;
  if (map.hasLayer(state.tooltip)) map.removeLayer(state.tooltip);
}

export function setMapTooltipEnabled(map: L.Map, enabled: boolean): void {
  const state = stateFor(map);
  state.enabled = enabled;
  if (!enabled) hideMapTooltip(map);
}

/** Enchufa el tooltip compartido a una capa de Leaflet (canvas o marcador). */
export function bindMapTooltip(
  layer: L.Layer,
  map: L.Map,
  text: (e: L.LeafletMouseEvent) => { primary: string; secondary?: string; at?: L.LatLngExpression },
  options: { sticky?: boolean } = {},
): void {
  const show = (e: L.LeafletMouseEvent) => {
    const { primary, secondary, at } = text(e);
    showMapTooltip(map, at ?? e.latlng, primary, secondary);
  };
  layer.on('mouseover', show);
  if (options.sticky) layer.on('mousemove', show);
  layer.on('mouseout', () => hideMapTooltip(map, 'feature'));
}
