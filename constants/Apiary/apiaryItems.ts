import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png';
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png';
import beehiveFoodSugar from '../../assets/images/icons/beehive_food_sugar.png';
import beehiveFoodLevudex from '../../assets/images/icons/beehive_food_levudex.png';
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png';
import beehiveTreatmentFlumetrine from '../../assets/images/icons/beehive_treatment_flumetrine.png';
import beehiveTreatmentOxalic from '../../assets/images/icons/beehive_treatment_oxalic.png';
import beehiveBoxGeneral from '../../assets/images/icons/beehive_box_general.png';
import beeHiveBateryNocarge from '../../assets/images/icons/beehive-batery-nocarge.png';
import beehiveTranshumance from '../../assets/images/icons/beehive-transhumance.png';
import { ApiaryItemCategory } from '../Enums/ApiaryItemCategory';

export const apiaryItems = (apiaryInfo: any) => [
    { key: 'hives', title: 'Colmena(s)', value: apiaryInfo.hives, image: beehiveCollonySize, isVisible: true, category: ApiaryItemCategory.COLONY },
    { key: 'status', title: 'Estado', value: apiaryInfo.status, image: beehiveTreatmentGeneral, isVisible: true, category: ApiaryItemCategory.STATUS },
    { key: 'honey',  title: 'Miel', value: `${apiaryInfo.honey} kg`, image: beehiveFoodHoney, isVisible: apiaryInfo.settings?.honey, category: ApiaryItemCategory.FOOD },
    { key: 'levudex',  title: 'Levudex', value: `${apiaryInfo.levudex} kg`, image: beehiveFoodLevudex, isVisible: apiaryInfo.settings?.levudex, category: ApiaryItemCategory.FOOD },
    { key: 'sugar',  title: 'Azucar', value: `${apiaryInfo.sugar} kg`, image: beehiveFoodSugar, isVisible: apiaryInfo.settings?.sugar, category: ApiaryItemCategory.FOOD },
    { key: 'tOxalic',  title: 'Oxalico', value: `${apiaryInfo.tOxalic} Dias`, image: beehiveTreatmentOxalic, isVisible: apiaryInfo.settings?.tOxalic, category: ApiaryItemCategory.TREATMENT },
    { key: 'tAmitraz',  title: 'Amitraz', value: `${apiaryInfo.tAmitraz} Dias`, image: beehiveTreatmentGeneral, isVisible: apiaryInfo.settings?.tAmitraz, category: ApiaryItemCategory.TREATMENT },
    { key: 'tFlumetrine',  title: 'Flumetrina', value: `${apiaryInfo.tFlumetrine} Dias`, image: beehiveTreatmentFlumetrine, isVisible: apiaryInfo.settings?.tFlumetrine, category: ApiaryItemCategory.TREATMENT },
    { key: 'transhumance',  title: 'Transhumancia', value: `${apiaryInfo.transhumance} Colm`, image: beehiveTranshumance, isVisible: apiaryInfo.settings?.transhumance, category: ApiaryItemCategory.OTHER },
    { key: 'tFence',  title: 'Electrico', value: `${apiaryInfo.tFence} Dias`, image: beeHiveBateryNocarge, isVisible: apiaryInfo.settings?.tFence, category: ApiaryItemCategory.OTHER },
    { key: 'box',  title: 'Alza', value: `${apiaryInfo.box}`, image: beehiveBoxGeneral, isVisible: (apiaryInfo.settings?.box && apiaryInfo.settings?.harvesting), category: ApiaryItemCategory.OTHER },
    { key: 'boxMedium',  title: 'Alza 3/4', value: `${apiaryInfo.boxMedium}`, image: beehiveBoxGeneral, isVisible: (apiaryInfo.settings?.boxMedium && apiaryInfo.settings?.harvesting), category: ApiaryItemCategory.OTHER },
    { key: 'boxSmall',  title: 'Alza 1/2', value: `${apiaryInfo.boxSmall}`, image: beehiveBoxGeneral, isVisible: (apiaryInfo.settings?.boxSmall && apiaryInfo.settings?.harvesting), category: ApiaryItemCategory.OTHER },
];
