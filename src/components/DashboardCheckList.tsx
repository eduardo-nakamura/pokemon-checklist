import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { LastCapturedCard } from '../components/LastCapturedCard';
// Removido: import { usePokemonStore } e PokemonBase, pois não são usados aqui

interface DashboardCheckListProps {
  progress: number;
  total: number;
  captured: number;
}

export const DashboardCheckList: React.FC<DashboardCheckListProps> = ({ progress, total, captured }) => {
  const { isDarkMode } = useSettingsStore();
  // Removido: const lastCaptured = ... (O card já faz isso internamente)

  return (
    <div className={`
      rounded-xl border p-6 mb-8 transition-all duration-300 shadow-sm
      ${isDarkMode 
        ? 'bg-slate-800 border-slate-700/50 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800'}
    `}>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        
        {/* Seção de Progresso */}
        <div className="w-full md:w-1/2 space-y-3">
          <div className="flex justify-between items-end">
            <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Progresso Regional
            </h2>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {captured} / {total} ({progress}%)
            </span>
          </div>
          
          <div className={`w-full rounded-full h-4 overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div 
              className={`h-full transition-all duration-700 ease-out ${isDarkMode ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={`hidden md:block w-px h-12 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Ferramentas e Status */}
        <div className="w-full md:w-1/2 flex gap-4 overflow-x-auto pb-1 items-center">
          
          <div className="shrink-0">
             <LastCapturedCard />
          </div>

          <div className={`shrink-0 w-32 h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-[10px] text-center p-2 uppercase font-black ${isDarkMode ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
            Daycare Helper
          </div>
        </div>

      </div>
    </div>
  );
};