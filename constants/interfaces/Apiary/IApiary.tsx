import { IApiarySettings } from './IApiarySettings';

export interface IApiary extends IApiaryData {
    id: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IApiaryData {
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
    settings: IApiarySettings;
}
