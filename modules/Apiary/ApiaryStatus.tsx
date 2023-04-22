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
    switch(status){
        case 'Malo':
            result = '#f32602';
        break;
        case 'Medio':
            result = '#f35b02';
        break;
        case 'Bueno':
            result = '#F3B202';
        break;
        case 'Excelente':
            result = '#a2f302';
        break;
    }
    
    return result;
}