import { useSettingsStore } from '../store/useSettingsStore';

interface ProgressBarProps {
  caught: number;
  total: number;
}

export function ProgressBar({ caught, total }: ProgressBarProps) {
  const { isDarkMode } = useSettingsStore();
  const percentage = total > 0 ? Math.round((caught / total) * 100) : 0;

  return (
    <div className={`p-6 rounded-3xl border-2 transition-colors ${
      isDarkMode 
        ? 'bg-slate-800/50 border-slate-700 shadow-2xl' 
        : 'bg-white border-slate-200 shadow-md'
    }`}>
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
            Seu Progresso
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {caught}
            </span>
            <span className="text-slate-500 font-bold text-lg">
              / {total} Pokémon
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-4xl font-black text-red-600 italic tracking-tighter">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className={`h-4 w-full rounded-full overflow-hidden p-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
        <div 
          className="h-full bg-red-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(220,38,38,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}