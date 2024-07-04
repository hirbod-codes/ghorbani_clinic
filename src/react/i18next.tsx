import * as i18next from "i18next";
import { initReactI18next } from "react-i18next";

//Import all translation files
import Persian from "./Localization/Translations/Persian.json";
import English from "./Localization/Translations/English.json";
import { Direction } from "./Lib/Localization";

export type Language = {
    code: string,
    name: string,
    direction: Direction
}

export const languages: Language[] = [
    {
        code: 'fa',
        name: 'Persian',
        direction: 'rtl'
    },
    {
        code: 'en',
        name: 'English',
        direction: 'ltr'
    }
]

export const resources = {
    fa: {
        Name: 'Persian',
        translation: Persian,
    },
    en: {
        Name: 'English',
        translation: English,
    },
}

i18next.use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
    });

export default i18next;
