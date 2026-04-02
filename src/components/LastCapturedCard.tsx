import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSettingsStore } from '../store/useSettingsStore';
import { usePokemonStore } from '../store/usePokemonStore'; // Importando a store de Pokémon

export const LastCapturedCard: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();
  
  // Lemos o objeto completo diretamente da store
  const lastCaptured = usePokemonStore((state) => state.lastCaptured);

  // Se não houver nenhum Pokémon salvo no localStorage, mostra o estado vazio
  if (!lastCaptured) {
    return (
      <div className={`
        flex flex-col items-center justify-center h-full text-[10px] uppercase font-bold border-2 border-dashed rounded-xl p-2 text-center
        ${isDarkMode ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'}
      `}>
        {t('no_captured')}
      </div>
    );
  }

  return (
    <div className={`
      flex items-center gap-3 p-2 rounded-xl border animate-in fade-in slide-in-from-right-4 duration-500
      ${isDarkMode 
        ? 'bg-slate-800 border-slate-700 text-white' 
        : 'bg-blue-50 border-blue-100 text-slate-800'}
    `}>
      <div className="relative">
        {/* Efeito de brilho atrás do Pokémon */}
        <div className={`absolute inset-0 blur-lg rounded-full ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-400/20'}`} />
        <img 
          src={lastCaptured.sprite} 
          alt={lastCaptured.name} 
          className="w-12 h-12 relative z-10 drop-shadow-sm" 
        />
      </div>
      
      <div className="min-w-25">
        <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
          {t('last_captured')}
        </p>
        <p className={`text-sm font-black leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          #{lastCaptured.id} {lastCaptured.name}
        </p>
      </div>
    </div>
  );
};