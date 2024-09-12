export interface ITreatment {
    key: string; // La clave única para el tratamiento (por ejemplo, 'tOxalic')
    max: number; // Valor máximo para el tratamiento
    min: number; // Valor mínimo para el tratamiento
    step: number; // Incremento para el tratamiento
    name: string; // Nombre del tratamiento
    image: any; // Imagen del tratamiento (puede ser un `require` o un `import`)
    text: string; // Texto descriptivo para el tratamiento
    unity: string; // Unidad de medida para el tratamiento
    isVisible: boolean; // Si el tratamiento es visible o no
}