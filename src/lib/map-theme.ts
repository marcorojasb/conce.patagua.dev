// Colores fijos del canvas del mapa por tema. `land` es la tierra de las
// teselas Esri Light/Dark Gray Base (medida); `live`, `stale` y `land`
// repiten --live, --stale y --map-land de src/index.css, porque el canvas no
// lee variables CSS (map-theme.test.ts comprueba que sigan iguales). En
// oscuro son el color exacto de las tripletas enteras de index.css
// (≈ emerald-400 y amber-400 de Tailwind, a 2 unidades por canal).

import type { PoiCategory, Theme } from '@/types/transport';

export interface MapThemeColors {
  /** Fondo de las muestras de la leyenda; hacia él se destiñe el GPS viejo. */
  land: string;
  /** Borde de las líneas. */
  casing: string;
  /** Opacidad del borde en estado normal. */
  casingAlpha: number;
  /** Relleno de paradas y del nivel `dot`. */
  stopFill: string;
  /** Paraderos GTFS sin línea visible; respaldo. */
  neutralStop: string;
  /** Anillo GPS y punto en vivo. */
  live: string;
  /** Anillo del GPS viejo. */
  stale: string;
  /** Lengüeta de las micros. */
  surface: string;
  tabBorder: string;
  /** Texto de la lengüeta. */
  text: string;
  /** Texto de la lengüeta con dato viejo. */
  muted: string;
  /** Paradero elegido en el canvas. */
  selection: string;
  /** Línea de ejemplo de la leyenda ("Recorrido"). */
  sample: string;
  /** Ciclovías: 6,63:1 y 6,22:1 contra la tierra. */
  cycleway: string;
}

export const MAP_THEME: Record<Theme, MapThemeColors> = {
  light: {
    land: '#efefef',
    casing: '#ffffff',
    casingAlpha: 0.35,
    stopFill: '#ffffff',
    neutralStop: '#71717a',
    live: '#047857',
    stale: '#b45309',
    surface: '#ffffff',
    tabBorder: '#d4d4d8',
    text: '#09090b',
    muted: '#71717a',
    selection: '#09090b',
    sample: '#52525b',
    cycleway: '#57534e',
  },
  dark: {
    land: '#474749',
    casing: '#020617',
    casingAlpha: 0.5,
    stopFill: '#09090b',
    neutralStop: '#a1a1aa',
    live: '#36d399',
    stale: '#fbbd23',
    surface: '#18181b',
    tabBorder: '#52525b',
    text: '#fafafa',
    muted: '#a1a1aa',
    selection: '#fafafa',
    sample: '#a1a1aa',
    cycleway: '#d6d3d1',
  },
};

/** Tinta de las insignias de ejemplo de la leyenda, igual en ambos temas. */
export const MAP_SAMPLE_INK = '#52525b';

// Lugares (capa Centros de atracción) y educación: un color por categoría para
// el mapa, la leyenda y el fondo de pantalla (antes cada uno tenía los suyos).
// Son los Tailwind 600 de siempre (#dc2626, #2563eb, #7c3aed, #ea580c,
// #f59e0b) pasados por displayRouteColor en claro: mismo tono con el croma
// acotado, para que no compitan con las líneas, y el ícono o el borde blanco
// se lee encima (map-theme.test.ts lo comprueba).
export const POI_COLOR: Record<PoiCategory, string> = {
  hospital: '#a23a32',
  university: '#335bad',
  college: '#644ba5',
  mall: '#a7451b',
};

export type SchoolKindColor = 'kindergarten' | 'school' | 'college' | 'university';

export const SCHOOL_COLOR: Record<SchoolKindColor, string> = {
  kindergarten: '#9d6304',
  school: '#a23a32',
  college: '#644ba5',
  university: '#335bad',
};
