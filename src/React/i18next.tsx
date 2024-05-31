import * as i18next from "i18next";
import { initReactI18next } from "react-i18next";

//Import all translation files
import Persian from "./components/Localization/Translations/Persian.json";
import English from "./components/Localization/Translations/English.json";

export type Language = {
    code: string,
    name: string,
}

export const languages: Language[] = [
    {
        code: 'fa',
        name: 'Persian',
    },
    {
        code: 'en',
        name: 'English',
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