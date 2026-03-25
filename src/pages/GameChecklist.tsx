import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SUPPORTED_GAMES } from '../types/pokemon';
import { fetchPokemonData } from '../api/pokeApi';
import { usePokemonStore } from '../store/usePokemonStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';
import { ProgressBar } from '../components/ProgressBar';
import { PokemonTable } from '../components/PokemonTable'; 
import { SubRegionNav } from '../components/SubRegionNav';

export function GameChecklist() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { isDarkMode } = useSettingsStore();
  const { t } = useTranslation();
  const { capturedByGame, togglePokemon } = usePokemonStore();
  
  const game = useMemo(() => 
    SUPPORTED_GAMES.find(g => g.id === gameId), 
  [gameId]);

  const checkedIds = useMemo(() => {
    return gameId ? (capturedByGame[gameId] || []) : [];
  }, [capturedByGame, gameId]);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['pokedex', game?.id],
    queryFn: () => {
      const region = game!.pokedexName.split('-')[0];
      return fetchPokemonData(game!.pokedexName, region);
    },
    enabled: !!game,
  });

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return list;
    const cleanSearch = searchTerm.trim().toLowerCase();
    
    return list.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(cleanSearch);
      const routeMatch = p.routes.some(r => r.toLowerCase().includes(cleanSearch));
      return nameMatch || routeMatch;
    });
  }, [list, searchTerm]);

  if (!game) {
    return (
      <div className="p-8 text-center text-slate-500">
        Jogo não encontrado.
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-colors"
        > 
          ← {t('main_menu')}
        </button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-col">
            <h1 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {game.name}
            </h1>
            <p className="text-slate-400 text-sm">
              {t('found_pokemon')}: {list.length}
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder={t('search_placeholder')}
              className={`w-full p-3 pr-10 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                isDarkMode 
                  ? 'bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500' 
                  : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-500 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </header>

        <SubRegionNav currentGame={game} />

        <div className="mt-8">
          <ProgressBar caught={checkedIds.length} total={list.length} />
        </div>
        
        <div className={`border rounded-3xl overflow-hidden shadow-xl mt-8 transition-colors ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <PokemonTable 
            list={filteredList} 
            checkedIds={checkedIds} 
            onToggle={(id) => togglePokemon(game.id, id)} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}