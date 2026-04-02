import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HOME_GAMES } from '../types/pokemon';
import { GameCard } from '../components/GameCard';
import { fetchPokemonData } from '../api/pokeApi';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

export function Home() {
  const queryClient = useQueryClient();
  const { isDarkMode } = useSettingsStore();
  const { t } = useTranslation();

  useEffect(() => {
    HOME_GAMES.forEach(game => {
      const region = game.pokedexName.split('-')[0];
      queryClient.prefetchQuery({
        queryKey: ['pokedex', game.id],
        queryFn: () => fetchPokemonData(game.pokedexName, region),
        staleTime: 1000 * 60 * 60
      });
    });
  }, [queryClient]);

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <header className="mb-12 text-center">
        <h1 className={`text-6xl font-black tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          POKÉ<span className="text-red-600">CHECK</span>
        </h1>
        <p className={`font-medium mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {t('home_title')}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {HOME_GAMES.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}