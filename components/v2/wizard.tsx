/**
 * Componentes reutilizables del wizard de creación (v2), calcados de los mockups
 * "Tipo de Manejo", "Configuración" y "Creación del Apiario".
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft, Plus, Glyph } from './icons';

// ─── Barra superior del wizard ────────────────────────────────────────────────
type TopBarProps = {
  variant?: 'cancel' | 'back';
  onCancel?: () => void;
  onBack?: () => void;
  actionLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export function WizardTopBar({ variant = 'cancel', onCancel, onBack, actionLabel, onAction, actionDisabled }: TopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
      {variant === 'cancel' ? (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ChevronLeft size={22} color={palette.navy} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.actionBtn, actionDisabled && styles.actionBtnDisabled]}
        onPress={onAction}
        disabled={actionDisabled}
        activeOpacity={0.85}
      >
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Progreso (3 pasos) ───────────────────────────────────────────────────────
export function StepProgress({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={styles.progress}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i + 1 === step ? styles.dotActive : styles.dotInactive]} />
      ))}
      <Text style={styles.progressLabel}>Paso {step} de {total}</Text>
    </View>
  );
}

// ─── Título de sección ────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

// ─── Chip de grilla (configuración) ───────────────────────────────────────────
export function OptionChip({ label, glyph, active, onPress }: { label: string; glyph: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active ? styles.chipOn : styles.chipOff]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.chipIcon, { backgroundColor: active ? palette.honeyBg : '#F1EFE7' }]}>
        <Glyph name={glyph} size={24} color={active ? palette.honeyText : palette.navy} />
      </View>
      <Text style={[styles.chipLabel, { color: active ? palette.ink : palette.inkSubtle, fontFamily: active ? fonts.manropeBold : fonts.manropeSemiBold }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Fila contador (− valor unidad +) ─────────────────────────────────────────
export function CounterRow({ label, glyph, value, unit, onDec, onInc }: {
  label: string; glyph: string; value: number; unit?: string; onDec: () => void; onInc: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}><Glyph name={glyph} size={20} color={palette.honeyText} strokeWidth={1.9} /></View>
      <Text style={styles.rowLabel}>{label}</Text>
      <TouchableOpacity style={styles.stepBtnMinus} onPress={onDec} activeOpacity={0.7}><Text style={styles.stepMinusText}>−</Text></TouchableOpacity>
      <Text style={styles.rowValue}>{value}</Text>
      {unit ? <Text style={styles.rowUnit}>{unit}</Text> : null}
      <TouchableOpacity style={styles.stepBtnPlus} onPress={onInc} activeOpacity={0.8}><Text style={styles.stepPlusText}>+</Text></TouchableOpacity>
    </View>
  );
}

// ─── Segmentos (tratamientos: Off / 45 / 90 …) ────────────────────────────────
export function SegmentControl({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (k: string) => void }) {
  return (
    <View style={styles.segment}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <TouchableOpacity key={opt.key} style={[styles.segBtn, active && styles.segBtnActive]} onPress={() => onChange(opt.key)} activeOpacity={0.8}>
            <Text style={[styles.segText, active ? styles.segTextActive : styles.segTextInactive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 12,
    backgroundColor: palette.cream,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  cancelText: { fontFamily: fonts.soraBold, fontSize: 14, color: palette.navy },
  backBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { backgroundColor: palette.navy, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  actionBtnDisabled: { backgroundColor: '#CFCABB' },
  actionText: { fontFamily: fonts.soraBold, fontSize: 14, color: '#fff' },

  progress: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 26, backgroundColor: palette.honey },
  dotInactive: { width: 9, backgroundColor: palette.border },
  progressLabel: { fontFamily: fonts.manropeSemiBold, fontSize: 12, color: palette.slate, marginLeft: 6 },

  sectionLabel: { fontFamily: fonts.soraBold, fontSize: 19, color: palette.ink, marginTop: 22, marginBottom: 12 },

  chip: { width: '31%', borderRadius: radius.lg, paddingTop: 16, paddingBottom: 13, paddingHorizontal: 8, alignItems: 'center', gap: 9 },
  chipOn: { backgroundColor: palette.white, borderWidth: 2, borderColor: palette.honey, shadowColor: '#E08A1C', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 4 },
  chipOff: { backgroundColor: palette.white, borderWidth: 2, borderColor: palette.borderSoft, ...shadow.soft },
  chipIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontSize: 12, textAlign: 'center', lineHeight: 15 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.white, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 13, marginTop: 12, ...shadow.soft },
  rowIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontFamily: fonts.soraBold, fontSize: 16, color: palette.ink },
  rowValue: { fontFamily: fonts.soraExtraBold, fontSize: 17, color: palette.ink, minWidth: 24, textAlign: 'center' },
  rowUnit: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, width: 26 },
  stepBtnMinus: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' },
  stepBtnPlus: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center' },
  stepMinusText: { fontSize: 20, color: palette.navy, lineHeight: 22, fontWeight: '600' },
  stepPlusText: { fontSize: 20, color: '#fff', lineHeight: 22, fontWeight: '600' },

  segment: { flexDirection: 'row', gap: 5, backgroundColor: palette.segmentBg, borderRadius: 12, padding: 4 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  segBtnActive: { backgroundColor: palette.bad },
  segText: { fontSize: 13 },
  segTextActive: { fontFamily: fonts.soraBold, color: '#fff' },
  segTextInactive: { fontFamily: fonts.manropeSemiBold, color: palette.slate },
});
