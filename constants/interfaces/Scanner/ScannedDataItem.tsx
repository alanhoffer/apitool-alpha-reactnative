export interface ScannedDataItem {
    id: number | string; // Puede ser number del backend o string temporal
    code: string;
    tare: number;
    weight: number;
    sold?: boolean;
    createdAt?: string;
    updatedAt?: string;
}