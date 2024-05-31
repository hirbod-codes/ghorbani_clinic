import * as i18next from "i18next";
import { initReactI18next } from "react-i18next";

//Import all translation files
import Persian from "./components/Localization/Translations/Persian.json";
import English from "./components/Localization/Translations/English.json";

export const languages = {
    fa: {
        translation: Persian,
    },
    en: {
        translation: English,
    },
}

i18next.use(initReactI18next)
    .init({
        resources: languages,
        lng: 'en',
        fallbackLng: 'en',
    });

export default i18next;