
export const getApiaryStatusLabel = (value: number): string => {
    switch (value) {
        case 0:
            return 'Malo';
        case 1:
            return 'Medio';
        case 2:
            return 'Bueno';
        case 3:
            return 'Excelente';
        default:
            return ''; // Puedes manejar un valor por defecto si es necesario
    }
};
