import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from './locales/en';
import translationIT from './locales/it';
import translationRO from './locales/ro';

const resources = {
  en: {
    translation: translationEN
  },
  it: {
    translation: translationIT
  },
  ro: {
    translation: translationRO
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'it',
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
