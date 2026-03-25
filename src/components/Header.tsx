import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Globe, Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

export function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { language, isDarkMode, setLanguage, toggleDarkMode } = useSettingsStore();

  return (
    <header className={`w-full border-b px-6 py-4 relative z-50 transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div onClick={() => navigate('/')} className="cursor-pointer group">
          <h1 className={`text-2xl font-black tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            POKÉ<span className="text-red-600 group-hover:text-red-500">CHECK</span>
          </h1>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isOpen ? 'border-red-500 text-red-500' : 'text-slate-400 border-transparent hover:border-slate-700'
            }`}
          >
            <Settings size={20} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
              <div className={`absolute right-0 mt-3 w-64 border rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <button 
                  onClick={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 group transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="group-hover:text-red-500" />
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{t('language')}</span>
                  </div>
                  <span className="text-xs font-black text-red-500">{language.toUpperCase()}</span>
                </button>

                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {isDarkMode ? t('theme_dark') : t('theme_light')}
                    </span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative ${isDarkMode ? 'bg-red-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}