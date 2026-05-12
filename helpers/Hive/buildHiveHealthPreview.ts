import { IHiveData, IHiveHealthSummary } from '../../constants/interfaces/Apiary/IHive';

const parseDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
};

export const buildHiveHealthPreview = (hiveData: Partial<IHiveData>): IHiveHealthSummary => {
    let score = 100;
    const alerts: string[] = [];
    const recommendedActions: string[] = [];
    const flags: string[] = [];

    if (hiveData.status === 'Malo') {
        score -= 25;
        flags.push('poor_status');
        alerts.push('Estado general malo.');
        recommendedActions.push('Hacer una revisión sanitaria completa.');
    } else if (hiveData.status === 'Medio') {
        score -= 12;
        flags.push('medium_status');
        alerts.push('Estado general medio.');
    }

    if (hiveData.queenStatus === 'absent') {
        score -= 35;
        flags.push('queen_absent');
        alerts.push('No hay reina registrada.');
        recommendedActions.push('Confirmar huérfandad y definir recambio o unión.');
    } else if (hiveData.queenStatus === 'unknown') {
        score -= 15;
        flags.push('queen_unknown');
        alerts.push('Estado de reina desconocido.');
        recommendedActions.push('Verificar postura fresca y presencia de reina.');
    }

    if (hiveData.hiveStrength === 'weak') {
        score -= 20;
        flags.push('weak_hive');
        alerts.push('Fortaleza de colmena débil.');
        recommendedActions.push('Evaluar refuerzo, alimentación o reducción de espacio.');
    } else if (hiveData.hiveStrength === 'medium') {
        score -= 5;
    }

    if (hiveData.disease && hiveData.disease.trim().length > 0) {
        score -= 25;
        flags.push('disease_reported');
        alerts.push(`Problema sanitario reportado: ${hiveData.disease}.`);
        recommendedActions.push('Aplicar protocolo sanitario y seguimiento.');
    }

    if (hiveData.swarming) {
        score -= 15;
        flags.push('swarming_risk');
        alerts.push('Riesgo de enjambrazón.');
        recommendedActions.push('Revisar espacio disponible y celdas reales.');
    }

    const inspectionDate = parseDate(hiveData.lastInspection);
    let lastInspectionDays: number | null = null;
    if (inspectionDate) {
        lastInspectionDays = Math.max(Math.floor((Date.now() - inspectionDate.getTime()) / (1000 * 60 * 60 * 24)), 0);
        if (lastInspectionDays > 45) {
            score -= 18;
            flags.push('inspection_stale_critical');
            alerts.push(`Última revisión hace ${lastInspectionDays} días.`);
        } else if (lastInspectionDays > 30) {
            score -= 10;
            flags.push('inspection_stale');
            alerts.push(`Revisión desactualizada (${lastInspectionDays} días).`);
        }
    } else {
        score -= 12;
        flags.push('inspection_missing');
        alerts.push('No hay fecha de última revisión.');
    }

    if ((hiveData.population || 0) <= 3) {
        score -= 12;
        flags.push('low_population');
        alerts.push('Población baja.');
    }

    if ((hiveData.population || 0) > 0 && (hiveData.broodFrames || 0) === 0) {
        score -= 10;
        flags.push('no_brood');
        alerts.push('Sin cuadros de cría registrados.');
    }

    if ((hiveData.honeyFrames || 0) === 0 && (hiveData.pollenFrames || 0) === 0) {
        score -= 8;
        flags.push('low_frames_reserves');
        alerts.push('Sin cuadros de miel ni polen.');
        recommendedActions.push('Controlar reservas y apoyo alimenticio.');
    }

    if ((hiveData.pollenFrames || 0) === 0 && (hiveData.broodFrames || 0) > 0) {
        score -= 5;
        flags.push('low_pollen');
        alerts.push('Hay cría pero no polen registrado.');
    }

    const reserves = Number(hiveData.honey || 0) + Number(hiveData.sugar || 0);
    if (reserves <= 1) {
        score -= 10;
        flags.push('low_reserves');
        alerts.push('Reservas muy bajas.');
        recommendedActions.push('Evaluar alimentación según clima y floración.');
    }

    score = Math.max(0, Math.min(score, 100));
    const status = score < 50 ? 'critica' : score < 75 || flags.length > 0 ? 'atencion' : 'estable';

    return {
        score,
        status,
        alerts: Array.from(new Set(alerts)),
        recommendedActions: Array.from(new Set(recommendedActions)),
        flags: Array.from(new Set(flags)),
        lastInspectionDays,
    };
};
