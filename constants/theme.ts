/**
 * Apitool v2 design system.
 *
 * Tokens extraídos 1:1 de los mockups HTML (Mis Apiarios, Home v2, wizard de
 * creación). Tema navy + honey sobre fondos crema. Tipografías Sora (títulos /
 * números) y Manrope (texto). Usar estos tokens en las pantallas rediseñadas;
 * `constants/colors` queda para las pantallas legacy aún no migradas.
 */

// ─── Paleta ──────────────────────────────────────────────────────────────────
export const palette = {
  navy: '#15263B',
  navySoft: '#1E3450',
  honey: '#F2B233',
  honeyDark: '#C8881A',
  honeyText: '#B9821B',
  honeyBg: '#FBEBC2',

  // Fondos
  cream: '#F5F2EA', // pantallas de wizard / formularios
  mist: '#EEF1F4', // listas / dashboard
  white: '#FFFFFF',
  fieldBg: '#F4F6F8',
  segmentBg: '#F4F2EB',

  // Texto
  ink: '#15263B', // texto primario
  inkMuted: '#75716A', // secundario sobre crema
  inkSubtle: '#85806F',
  slate: '#9AA3AC', // terciario / metadatos
  steel: '#8FA0B5', // texto secundario sobre navy

  // Bordes
  border: '#E2DDD0',
  borderSoft: '#EFEADD',
  borderCool: '#E4E8ED',

  // Estados (dot, texto, fondo del pill)
  good: '#2FA66A',
  goodText: '#1E7A4D',
  goodBg: '#E6F4EC',
  warn: '#E0A21C',
  warnText: '#946B10',
  warnBg: '#FBEBC2',
  bad: '#E5654A',
  badText: '#C0432C',
  badBg: '#FDEAE5',

  // Translúcidos sobre navy (header / stat cards)
  onNavy10: 'rgba(255,255,255,0.10)',
  onNavy06: 'rgba(255,255,255,0.06)',
} as const;

// ─── Tipografía ──────────────────────────────────────────────────────────────
// Familias registradas vía useFonts en App.tsx (@expo-google-fonts/*).
export const fonts = {
  // Sora — títulos, números, botones
  soraMedium: 'Sora_500Medium',
  soraSemiBold: 'Sora_600SemiBold',
  soraBold: 'Sora_700Bold',
  soraExtraBold: 'Sora_800ExtraBold',
  // Manrope — body
  manrope: 'Manrope_400Regular',
  manropeMedium: 'Manrope_500Medium',
  manropeSemiBold: 'Manrope_600SemiBold',
  manropeBold: 'Manrope_700Bold',
  manropeExtraBold: 'Manrope_800ExtraBold',
} as const;

// ─── Radios / sombras ────────────────────────────────────────────────────────
export const radius = {
  sm: 11,
  md: 14,
  lg: 18,
  xl: 20,
  xxl: 22,
  header: 26,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#141E32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  soft: {
    shadowColor: '#141E32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
} as const;

/** Mapea el `status` del apiario (texto o índice) a su color/label/pill v2. */
export type ApiaryHealth = 'good' | 'warn' | 'bad';

export function statusToHealth(status: any): ApiaryHealth {
  const s = String(status ?? '').toLowerCase();
  if (['excelente', 'bueno', '3', '2', 'good'].includes(s)) return 'good';
  if (['medio', 'revisar', '1', 'warn', 'warning'].includes(s)) return 'warn';
  return 'bad';
}

export const healthMeta: Record<ApiaryHealth, { label: string; dot: string; text: string; bg: string }> = {
  good: { label: 'Saludable', dot: palette.good, text: palette.goodText, bg: palette.goodBg },
  warn: { label: 'Revisar', dot: palette.warn, text: palette.warnText, bg: palette.warnBg },
  bad: { label: 'Atención', dot: palette.bad, text: palette.badText, bg: palette.badBg },
};

export default { palette, fonts, radius, shadow };
