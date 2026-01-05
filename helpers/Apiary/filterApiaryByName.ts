import { IApiary } from "../../constants/interfaces/Apiary/IApiary";

export function filterApiaryByName(apiaryList: IApiary[], searchValue: string) {
    if (!searchValue || searchValue.trim() === '') {
        return apiaryList;
    }
    
    return apiaryList.filter(apiary => {
        if (!apiary || !apiary.name) {
            return false;
        }
        return apiary.name.toLowerCase().startsWith(searchValue.toLowerCase());
    });
}
