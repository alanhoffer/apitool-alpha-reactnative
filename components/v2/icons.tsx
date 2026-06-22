/**
 * Iconos SVG del design system v2, copiados 1:1 de los paths usados en los
 * mockups HTML para que el render quede idéntico. Estilo "feather": stroke,
 * sin relleno salvo donde el mockup lo indica.
 */
import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

const base = (color: string, strokeWidth: number) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

export const ChevronLeft = ({ size = 22, color = '#fff', strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path {...base(color, strokeWidth)} d="M19 12H5M11 18l-6-6 6-6" /></Svg>
);

export const ChevronRight = ({ size = 18, color = '#C2C9D1', strokeWidth = 2.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path {...base(color, strokeWidth)} d="M9 6l6 6-6 6" /></Svg>
);

export const Layers = ({ size = 20, color = '#fff', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...base(color, strokeWidth)} d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
    <Path {...base(color, strokeWidth)} d="M9 3v15M15 6v15" />
  </Svg>
);

export const Plus = ({ size = 17, color = '#15263B', strokeWidth = 2.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path {...base(color, strokeWidth)} d="M12 5v14M5 12h14" /></Svg>
);

export const Search = ({ size = 18, color = '#8FA0B5', strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle {...base(color, strokeWidth)} cx={11} cy={11} r={7} />
    <Path {...base(color, strokeWidth)} d="M21 21l-4-4" />
  </Svg>
);

export const SortLines = ({ size = 15, color = '#C8881A', strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path {...base(color, strokeWidth)} d="M3 6h18M6 12h12M10 18h4" /></Svg>
);

export const Hexagon = ({ size = 15, color = '#15263B', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" d="M12 3l7 4v8l-7 4-7-4V7z" />
  </Svg>
);

export const Close = ({ size = 18, color = '#C2C9D1', strokeWidth = 2.4 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path {...base(color, strokeWidth)} d="M6 6l12 12M18 6L6 18" /></Svg>
);

export const Leaf = ({ size = 40, color = '#C2C9D1', strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...base(color, strokeWidth)} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <Path {...base(color, strokeWidth)} d="M2 21c0-3 1.85-5.36 5.08-6" />
  </Svg>
);

// ─── Bottom nav ───────────────────────────────────────────────────────────────
export const HomeIcon = ({ size = 22, color = '#9AA3AC', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...base(color, strokeWidth)} d="M3 11l9-8 9 8" />
    <Path {...base(color, strokeWidth)} d="M5 10v10h14V10" />
  </Svg>
);

export const ApiaryIcon = ({ size = 22, color = '#9AA3AC', strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" x={4} y={4} width={16} height={4} rx={1} />
    <Rect stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" x={4} y={10} width={16} height={4} rx={1} />
    <Rect stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" x={4} y={16} width={16} height={4} rx={1} />
  </Svg>
);

export const DataIcon = ({ size = 22, color = '#9AA3AC', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...base(color, strokeWidth)} d="M4 19V5M4 19h16" />
    <Path {...base(color, strokeWidth)} d="M8 15l3-4 3 2 4-6" />
  </Svg>
);

export const ProfileIcon = ({ size = 22, color = '#9AA3AC', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle {...base(color, strokeWidth)} cx={12} cy={8} r={4} />
    <Path {...base(color, strokeWidth)} d="M5 21c0-4 3-6 7-6s7 2 7 6" />
  </Svg>
);

export const ScanGrid = ({ size = 24, color = '#F2B233', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect {...base(color, strokeWidth)} x={3} y={3} width={7} height={7} rx={1} />
    <Rect {...base(color, strokeWidth)} x={14} y={3} width={7} height={7} rx={1} />
    <Rect {...base(color, strokeWidth)} x={3} y={14} width={7} height={7} rx={1} />
    <Path {...base(color, strokeWidth)} d="M14 14h3v3M21 14v.01M14 21h3.5M21 18v3" />
  </Svg>
);

// Patrón de hexágono decorativo (usado en cards / placeholders)
export const HexPattern = ({ size = 64, color = '#3C5E2F', opacity = 0.5 }: IconProps & { opacity?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" opacity={opacity}>
    <Path fill={color} d="M0 46 Q16 38 32 44 T64 40 V64 H0 Z" />
  </Svg>
);

export const ImagePlaceholder = ({ size = 26, color = '#B4BDC6', strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect {...base(color, strokeWidth)} x={3} y={4} width={18} height={16} rx={3} />
    <Circle {...base(color, strokeWidth)} cx={9} cy={10} r={2} />
    <Path {...base(color, strokeWidth)} d="m3 17 5-4 4 3 4-4 5 4" />
  </Svg>
);

export const Camera = ({ size = 28, color = '#9AA3AC', strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...base(color, strokeWidth)} d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Circle {...base(color, strokeWidth)} cx={12} cy={13} r={3.2} />
  </Svg>
);

export const Bell = ({ size = 20, color = '#fff', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...base(color, strokeWidth)} d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path {...base(color, strokeWidth)} d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const Book = ({ size = 22, color = '#15263B', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path {...base(color, strokeWidth)} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <Path {...base(color, strokeWidth)} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Svg>
);

export const Bee = ({ size = 24, color = '#F2B233' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M12 7c3 0 5 2.2 5 6s-2 7-5 7-5-3.2-5-7 2-6 5-6z" />
    <Path stroke="#15263B" strokeWidth={1.6} d="M7.5 12h9M7.5 15.5h9" />
    <Path fill={color} d="M6 5.5c1.6-1.2 3.4-.6 4 .8-1.6.4-3.2.2-4-.8zM18 5.5c-1.6-1.2-3.4-.6-4 .8 1.6.4 3.2.2 4-.8z" opacity={0.9} />
  </Svg>
);

// ─── Glifos data-driven (alimentos / tratamientos / cosecha / otros) ──────────
// Render del interior de un <Svg viewBox="0 0 24 24"> por nombre. Paths copiados
// 1:1 de los mockups de creación / configuración.
const glyphRender: Record<string, (s: any) => React.ReactNode> = {
  manageGroup: (s) => (<>
    <Path {...s} d="M7 8h10M6 12h12M5 16h14" />
    <Path {...s} d="M8 8a4 4 0 0 1 8 0M7 12a5 5 0 0 1 10 0M6 16a6 6 0 0 1 12 0" />
  </>),
  manageIndividual: (s) => (<>
    <Circle {...s} cx={8} cy={8} r={3} />
    <Circle {...s} cx={16.5} cy={10} r={2.2} />
    <Circle {...s} cx={10} cy={16.5} r={2.6} />
  </>),
  honey: (s) => (<>
    <Path {...s} d="M5 5l8 4M13 9l-2 4M11 13c-2 0-3 2-3 4M15 7l5-2" />
    <Path {...s} d="M11 13c2 .3 3 2 2.5 4" />
  </>),
  levudex: (s) => (<>
    <Rect {...s} x={7} y={8} width={10} height={13} rx={2} />
    <Path {...s} d="M9 8V5h6v3M9 12h6M9 16h6" />
  </>),
  sugar: (s) => (<>
    <Path {...s} d="M5 9c0-2 3-4 7-4s7 2 7 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
    <Path {...s} d="M9 9l2-2M12 11l2-2M11 14l2-2" />
  </>),
  oxalico: (s) => (<>
    <Rect {...s} x={7} y={4} width={4} height={16} rx={1.5} />
    <Rect {...s} x={13} y={4} width={4} height={16} rx={1.5} />
  </>),
  amitraz: (s) => (<>
    <Rect {...s} x={6} y={7} width={12} height={13} rx={2} />
    <Path {...s} d="M9 7V5h6v2M12 11v5M9.5 13.5h5" />
  </>),
  flumetrina: (s) => (<>
    <Rect {...s} x={5} y={5} width={14} height={14} rx={2} />
    <Path {...s} d="M9 5v14M5 9h14" opacity={0.5} />
    <Rect {...s} x={6.5} y={6.5} width={4} height={4} rx={1} />
  </>),
  disease: (s) => (<>
    <Circle {...s} cx={12} cy={12} r={8} />
    <Path {...s} d="M12 8v4M12 16h.01" />
  </>),
  alza: (s) => (<>
    <Rect {...s} x={5} y={11} width={14} height={9} rx={1.5} />
    <Path {...s} d="M8 11V8a4 4 0 0 1 8 0v3M5 15h14" />
  </>),
  alza34: (s) => (<>
    <Rect {...s} x={5} y={12} width={14} height={8} rx={1.5} />
    <Path {...s} d="M8 12V9a4 4 0 0 1 8 0v3M5 16h14" />
  </>),
  alza12: (s) => (<>
    <Rect {...s} x={5} y={13} width={14} height={7} rx={1.5} />
    <Path {...s} d="M8 13v-3a4 4 0 0 1 8 0v3" />
  </>),
  trans: (s) => (<>
    <Path {...s} d="M2 16V8h10v8M12 11h4l3 3v2h-7" />
    <Circle {...s} cx={6} cy={17.5} r={1.6} />
    <Circle {...s} cx={16.5} cy={17.5} r={1.6} />
  </>),
  electrico: (s) => (<>
    <Rect {...s} x={7} y={3} width={10} height={18} rx={2} />
    <Path {...s} d="M13 7l-3 5h4l-3 5" />
  </>),
  tareas: (s) => (<>
    <Path {...s} d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <Path {...s} d="M8 11h7M8 15h5" />
    <Path {...s} d="m16 3 5 5" opacity={0.5} />
  </>),
  pin: (s) => (<>
    <Path {...s} d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
    <Circle {...s} cx={12} cy={9} r={2.5} />
  </>),
  estado: (s) => (<>
    <Path {...s} d="M4 5h13l-2 3 2 3H4zM4 5v15" />
  </>),
  colony: (s) => (<>
    <Path {...s} d="M12 3l7 4v8l-7 4-7-4V7z" />
    <Path {...s} d="M9 9h6M9 12h6M9 15h6" opacity={0.6} />
  </>),
  crown: (s) => (<>
    <Path {...s} d="M4 8l3 3 5-6 5 6 3-3-2 11H6z" />
  </>),
};

/** Glifo line-art por nombre, idéntico a los mockups. Fallback: 'tareas'. */
export const Glyph = ({ name, size = 24, color = '#15263B', strokeWidth = 1.8 }: IconProps & { name: string }) => {
  const render = glyphRender[name] || glyphRender.tareas;
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  return <Svg width={size} height={size} viewBox="0 0 24 24"><G>{render(s)}</G></Svg>;
};

/** Mapea una key de setting/item del backend a un nombre de glifo. */
export function glyphForKey(key: string): string {
  const map: Record<string, string> = {
    honey: 'honey', honeyFrames: 'honey',
    levudex: 'levudex', sugar: 'sugar',
    tOxalic: 'oxalico', tAmitraz: 'amitraz', tFlumetrine: 'flumetrina', disease: 'disease',
    box: 'alza', boxMedium: 'alza34', boxSmall: 'alza12', production: 'alza',
    transhumance: 'trans', tFence: 'electrico', tasks: 'tareas',
    queenStatus: 'crown', population: 'colony', hiveStrength: 'colony',
    broodFrames: 'colony', pollenFrames: 'honey', swarming: 'trans', lastInspection: 'tareas',
    hives: 'colony', status: 'estado',
  };
  return map[key] || 'tareas';
}
