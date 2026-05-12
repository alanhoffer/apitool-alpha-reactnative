import { ImageSourcePropType } from 'react-native';
import { SettingsCategory } from '../../../Enums/SettingsCategory';

export interface UICategoryItem {
    key: string;
    title: string;
    value: string;
    image: ImageSourcePropType;
}

export type UISettingsItem = UICategoryItem;

export interface UICategorizedSettings {
    [SettingsCategory.Food]: UICategoryItem[];
    [SettingsCategory.Treatment]: UICategoryItem[];
    [SettingsCategory.Harvest]: UICategoryItem[];
    [SettingsCategory.Others]: UICategoryItem[];
}
