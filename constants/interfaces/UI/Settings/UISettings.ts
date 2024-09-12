import { ImageSourcePropType } from 'react-native';
import { SettingsCategory } from '../../../Enums/SettingsCategory';

export interface UICategoryItem {
    key: string;
    title: string;
    value: string;
    image: ImageSourcePropType;
}

export interface UICategorizedSettings {
    [SettingsCategory.Food]: UICategoryItem[];
    [SettingsCategory.Treatment]: UICategoryItem[];
    [SettingsCategory.Harvesting]: UICategoryItem[];
    [SettingsCategory.Others]: UICategoryItem[];
}
