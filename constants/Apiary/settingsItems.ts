import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png'
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png'
import beehiveFoodSugar from '../../assets/images/icons/beehive_food_sugar.png'
import beehiveFoodLevudex from '../../assets/images/icons/beehive_food_levudex.png'
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png'
import beehiveTreatmentFlumetrine from '../../assets/images/icons/beehive_treatment_flumetrine.png'
import beehiveTreatmentOxalic from '../../assets/images/icons/beehive_treatment_oxalic.png'
import beehiveBoxGeneral from '../../assets/images/icons/beehive_box_general.png'
import beeHiveBateryNocarge from '../../assets/images/icons/beehive-batery-nocarge.png'
import beehiveTranshumance from '../../assets/images/icons/beehive-transhumance.png'
import beehiveNotes from '../../assets/images/icons/beehive_notes.png'

import { UICategorizedSettings } from '../interfaces/UI/Settings/UISettings'
import { SettingsCategory } from '../Enums/SettingsCategory'

export const settingsItems = (): UICategorizedSettings => ({

    [SettingsCategory.Food]: [
        { key: 'honey', title: 'Miel', value: 'Sí', image: beehiveFoodHoney },
        { key: 'levudex', title: 'Levudex', value: 'Sí', image: beehiveFoodLevudex },
        { key: 'sugar', title: 'Azúcar', value: 'Sí', image: beehiveFoodSugar },
    ],
    [SettingsCategory.Treatment]: [
        { key: 'tOxalic', title: 'Oxálico', value: 'Sí', image: beehiveTreatmentOxalic },
        { key: 'tAmitraz', title: 'Amitraz', value: 'Sí', image: beehiveTreatmentGeneral },
        { key: 'tFlumetrine', title: 'Flumetrina', value: 'Sí', image: beehiveTreatmentFlumetrine },
    ],
    [SettingsCategory.Harvest]: [
        { key: 'box', title: 'Alza', value: 'Sí', image: beehiveBoxGeneral },
        { key: 'boxMedium', title: 'Alza 3/4', value: 'Sí', image: beehiveBoxGeneral },
        { key: 'boxSmall', title: 'Alza 1/2', value: 'Sí', image: beehiveBoxGeneral },
    ],
    [SettingsCategory.Others]: [
        { key: 'transhumance', title: 'Transhumancia', value: 'Sí', image: beehiveTranshumance },
        { key: 'tFence', title: 'Eléctrico', value: 'Sí', image: beeHiveBateryNocarge },
        { key: 'tasks', title: 'Tareas', value: 'Sí', image: beehiveNotes },
    ]
});

// Settings específicas para colmenas individuales
export const settingsItemsIndividual = (): UICategorizedSettings => ({
    [SettingsCategory.Food]: [
        { key: 'honey', title: 'Miel por Colmena', value: 'Sí', image: beehiveFoodHoney },
        { key: 'levudex', title: 'Levudex por Colmena', value: 'Sí', image: beehiveFoodLevudex },
        { key: 'sugar', title: 'Azúcar por Colmena', value: 'Sí', image: beehiveFoodSugar },
    ],
    [SettingsCategory.Treatment]: [
        { key: 'tOxalic', title: 'Oxálico', value: 'Sí', image: beehiveTreatmentOxalic },
        { key: 'tAmitraz', title: 'Amitraz', value: 'Sí', image: beehiveTreatmentGeneral },
        { key: 'tFlumetrine', title: 'Flumetrina', value: 'Sí', image: beehiveTreatmentFlumetrine },
        { key: 'disease', title: 'Enfermedades', value: 'Sí', image: beehiveTreatmentGeneral },
    ],
    [SettingsCategory.Harvest]: [
        { key: 'box', title: 'Alza', value: 'Sí', image: beehiveBoxGeneral },
        { key: 'boxMedium', title: 'Alza 3/4', value: 'Sí', image: beehiveBoxGeneral },
        { key: 'boxSmall', title: 'Alza 1/2', value: 'Sí', image: beehiveBoxGeneral },
        { key: 'production', title: 'Producción Individual', value: 'Sí', image: beehiveBoxGeneral },
    ],
    [SettingsCategory.Others]: [
        { key: 'queenStatus', title: 'Estado de la Reina', value: 'Sí', image: beehiveCollonySize },
        { key: 'population', title: 'Población', value: 'Sí', image: beehiveCollonySize },
        { key: 'broodFrames', title: 'Cuadros con Cría', value: 'Sí', image: beehiveBoxGeneral },
        { key: 'honeyFrames', title: 'Cuadros con Miel', value: 'Sí', image: beehiveFoodHoney },
        { key: 'pollenFrames', title: 'Cuadros con Polen', value: 'Sí', image: beehiveFoodHoney },
        { key: 'hiveStrength', title: 'Fortaleza de Colmena', value: 'Sí', image: beehiveCollonySize },
        { key: 'swarming', title: 'Enjambrazón', value: 'Sí', image: beehiveTranshumance },
        { key: 'lastInspection', title: 'Última Revisión', value: 'Sí', image: beehiveNotes },
        { key: 'tasks', title: 'Tareas', value: 'Sí', image: beehiveNotes },
    ]
});
