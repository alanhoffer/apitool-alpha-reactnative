export function fenceToDays(days: number): number{
    switch (days) {
        case 0:
            return 15
            break;
        case 15:
            return 45
            break;
        case 45:
            return 90
            break;
        case 90:
            return 360
            break;
        case 360:
            return 0
            break;
    }
    return 0
}