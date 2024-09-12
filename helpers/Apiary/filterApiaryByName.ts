import { IApiary } from "../../constants/interfaces/Apiary/IApiary";

export function filterApiaryByName(apiaryList: IApiary[], searchValue: string) {
    return apiaryList.filter(apiary => apiary.name.toLowerCase().startsWith(searchValue.toLowerCase()))
  }