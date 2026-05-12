export interface IApiarySettingsItems {
    honey: boolean;
    levudex: boolean;
    sugar: boolean;
    box: boolean;
    boxMedium: boolean;
    boxSmall: boolean;
    tOxalic: boolean;
    tAmitraz: boolean;
    tFlumetrine: boolean;
    tFence: boolean;
    transhumance: boolean;
    tasks?: boolean | string | null;
    tComment?: boolean;
    // Settings para colmenas individuales
    queenStatus?: boolean;
    population?: boolean;
    broodFrames?: boolean;
    honeyFrames?: boolean;
    pollenFrames?: boolean;
    lastInspection?: boolean;
    hiveStrength?: boolean;
    swarming?: boolean;
    disease?: boolean;
    production?: boolean;
}



export interface IApiarySettings extends IApiarySettingsItems {
    id: number;
    apiaryId: number;
    apiaryUserId: number;
}
