import { IApiarySettings } from './IApiarySettings';

export interface IHive extends IHiveData {
    id: number;
    apiaryId: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IHiveData {
    name: string;
    image: string;
    status: string;
    // Alimentos
    honey: number;
    levudex: number;
    sugar: number;
    // Tratamientos
    tOxalic: number;
    tAmitraz: number;
    tFlumetrine: number;
    disease: string;
    // Cosecha
    box: number;
    boxMedium: number;
    boxSmall: number;
    production: number;
    // Información específica de colmena individual
    queenStatus: string; // 'present', 'marked', 'absent', 'unknown'
    population: number; // 1-10 escala
    broodFrames: number;
    honeyFrames: number;
    pollenFrames: number;
    hiveStrength: string; // 'weak', 'medium', 'strong'
    swarming: boolean;
    lastInspection: string; // fecha
    tComment: string;
    settings: IApiarySettings;
}
