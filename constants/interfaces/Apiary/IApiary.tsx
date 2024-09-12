import { IApiarySettings } from './IApiarySettings';

export interface IApiary {
    id: number;
    userId: number;
    name: string;
    image: string;
    hives: number;
    status: string;
    honey: number;
    levudex: number;
    sugar: number;
    box: number;
    boxMedium: number;
    boxSmall: number;
    tOxalic: number;
    tAmitraz: number;
    tFlumetrine: number;
    tFence: number;
    transhumance: number;
    tComment: string;
    createdAt: Date;
    updatedAt: Date;
    settings: IApiarySettings;
}
