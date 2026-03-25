import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '../store/useSettingsStore';
import { SUPPORTED_GAMES } from '../types/pokemon';
import type { GameConfig, PokemonBase } from '../types/pokemon';

interface SubRegionNavProps {
  currentGame: GameConfig;
}

export function SubRegionNav({ currentGame }: SubRegionNavProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDarkMode } = useSettingsStore();

  // Filtra jogos que pertencem ao mesmo grupo (ex: Kalos Central, Coastal, Mountain)
  const relatedGames = SUPPORTED_GAMES.filter(
    (g) => g.group === currentGame.group && g.group !== undefined
  );

  // Se não houver outros jogos no grupo, não renderiza a navegação
  if (relatedGames.length <= 1) return null;

  return (
    <nav className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
      {relatedGames.map((game) => {
        const isSelected = game.id === currentGame.id;
        
        // Tipagem explícita para evitar erro de 'any' no ESLint
        const pokedexData = queryClient.getQueryData<PokemonBase[]>(['pokedex', game.id]);
        const hasData = !!pokedexData;

        return (
          <button
            key={game.id}
            onClick={() => navigate(`/game/${game.id}`)}
            disabled={isSelected}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2 ${
              isSelected
                ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                : isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 cursor-pointer'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 shadow-sm cursor-pointer'
            } ${isSelected ? 'cursor-default' : ''} ${
              !hasData && !isSelected ? 'opacity-70' : ''
            }`}
          >
            {/* Remove parênteses e nomes repetidos para exibir apenas o subtítulo (ex: Coastal) */}
            {game.name.includes('(') 
              ? game.name.split('(')[1].replace(')', '') 
              : game.name}
          </button>
        );
      })}
    </nav>
  );
}