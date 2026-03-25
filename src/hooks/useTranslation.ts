import { useSettingsStore } from '../store/useSettingsStore';
import { translations } from '../i18n/translations';

export function useTranslation() {
  const { language } = useSettingsStore();
  
  const t = (key: keyof typeof translations['pt-BR']) => {
    return translations[language][key] || key;
  };

  return { t };
}