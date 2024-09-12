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
    tComment: boolean;
    transhumance: boolean;
    harvesting: boolean;
}



export interface IApiarySettings extends IApiarySettingsItems {
    id: number;
    apiaryId: number;
    apiaryUserId: number;
}
