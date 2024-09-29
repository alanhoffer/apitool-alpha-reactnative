export function statusToText(status:number):string{

    let result:string = '' ;
    switch(status){
        case 0:
            result = 'Muy Malo';
        break;
        case 1:
            result = 'Malo';
        break;
        case 2:
            result = 'Bueno';
        break;
        case 3:
            result = 'Excelente';
        break;
    }
    
    return result;
}

export function statusToColor(status:string):string{
    let result:string = '';
    switch (status) {
        case 'Malo':
            result = '#FF4C4C'; // Un rojo más suave, pero aún indicando alerta.
            break;
        case 'Medio':
            result = '#FF8C42'; // Un naranja que indica precaución.
            break;
        case 'Bueno':
            result = '#FFD700'; // Un dorado para simbolizar que está bien.
            break;
        case 'Excelente':
            result = '#7CFC00'; // Un verde vivo que representa excelencia.
            break;
    }
    
    return result;
}