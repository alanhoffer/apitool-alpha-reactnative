export function variableToPretty(variable: string) {
    switch (variable) {
        case 'hives':
            return 'Colmenas'
            break;
        case 'status':
            return 'Estado'
            break;
        case 'honey':
            return 'Miel'
            break;
        case 'levudex':
            return 'Levudex'
            break;
        case 'sugar':
            return 'Azucar'
            break;
        case 'box':
            return 'Alza'
            break;
        case 'boxMedium':
            return 'Alza 3/4'
            break;
        case 'boxSmall':
            return 'Alza 1/2'
            break;
        case 'tOxalic':
            return 'Acido Oxalico'
            break;
        case 'tAmitraz':
            return 'Amitraz'
            break;
        case 'tFlumetrine':
            return 'Flumetrina'
            break;
        case 'tFence':
            return 'Electrico'
            break;
        case 'tComment':
            return 'Comentario'
            break;
    }
}

export function valueToPretty(variable: string, valor:string) {
    switch (variable) {
        case `hives`:
            return `${valor}`
            break;
        case `status`:
            return `${valor}`
            break;
        case `honey`:
            return `${valor} Kg`
            break;
        case `levudex`:
            return `${valor} Kg`
            break;
        case `sugar`:
            return `${valor} Kg`
            break;
        case `box`:
            return `${valor} Unidades`
            break;
        case `boxMedium`:
            return `${valor} Unidades`
            break;
        case `boxSmall`:
            return `${valor} Unidades`
            break;
        case `tOxalic`:
            return `${valor} Aplicaciones`
            break;
        case `tAmitraz`:
            return `${valor} Aplicaciones`
            break;
        case `tFlumetrine`:
            return `${valor} Aplicaciones`
            break;
        case `tFence`:
            return `${valor} Dias`
            break;
        case `tComment`:
            return `${valor}`
            break;
    }
}