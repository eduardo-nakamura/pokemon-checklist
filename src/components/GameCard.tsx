import { useNavigate } from 'react-router-dom';
import type { GameConfig, PokemonBase } from '../types/pokemon';
import { usePokemonStore } from '../store/usePokemonStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../hooks/useTranslation';

export function GameCard({ game }: { game: GameConfig }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();
  const { capturedByGame } = usePokemonStore();

  const pokedexData = queryClient.getQueryData<PokemonBase[]>(['pokedex', game.id]);
  const total = pokedexData?.length || 0;
  const caught = capturedByGame[game.id]?.length || 0;
  const percentage = total > 0 ? (caught / total) * 100 : 0;

  return (
    <button 
      onClick={() => navigate(`/game/${game.id}`)}
      className={`group relative p-8 border-2 rounded-3xl text-left transition-all active:scale-95 overflow-hidden w-full ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:border-red-500 hover:bg-slate-700' 
          : 'bg-white border-slate-200 hover:border-red-500 hover:shadow-lg'
      }`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <span className={`text-2xl font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {game.name}
          </span>
          <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">{t('explore')}</span>
        </div>
        {total > 0 && (
          <span className={`font-mono text-sm px-2 py-1 rounded ${isDarkMode ? 'text-slate-500 bg-slate-900/50' : 'text-slate-400 bg-slate-100'}`}>
            {caught}/{total}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-6">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] font-black text-slate-500 uppercase">{t('progress')}</span>
          <span className="text-[10px] font-black text-red-500">{Math.round(percentage)}%</span>
        </div>
        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <div 
            className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_8px_rgba(220,38,38,0.4)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </button>
  );
}