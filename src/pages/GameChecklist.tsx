import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPokemonData } from '../api/pokeApi';
import { useSettingsStore } from '../store/useSettingsStore';
import { usePokemonStore } from '../store/usePokemonStore';
import { SUPPORTED_GAMES, type PokemonBase } from '../types/pokemon';
import { PokemonTable } from '../components/PokemonTable';
import { ProgressBar } from '../components/ProgressBar';
import { SubRegionNav } from '../components/SubRegionNav';
import { useTranslation } from '../hooks/useTranslation';

export function GameChecklist() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { language, isDarkMode } = useSettingsStore();
  const { capturedByGame, togglePokemon } = usePokemonStore();
  
  const game = SUPPORTED_GAMES.find(g => g.id === gameId);
  const checkedIds = gameId ? capturedByGame[gameId] || [] : [];

  const { data: list = [], isLoading } = useQuery<PokemonBase[]>({
    queryKey: ['pokedex', game?.id, language], 
    queryFn: () => {
      if (!game) throw new Error("Game not found");
      return fetchPokemonData(game.pokedexName, game.id, language);
    },
    enabled: !!game,
  });

  // Lógica de Filtro com Suporte a Aspas ("Busca Exata")
  const filteredList = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return list;

    const isExact = query.startsWith('"') && query.endsWith('"') && query.length > 2;
    const term = isExact ? query.slice(1, -1) : query;

    return list.filter(p => {
      const nameMatch = isExact 
        ? p.name.toLowerCase() === term 
        : p.name.toLowerCase().includes(term);
        
      const routeMatch = p.routes.some(r => 
        isExact ? r.toLowerCase() === term : r.toLowerCase().includes(term)
      );

      return nameMatch || routeMatch;
    });
  }, [list, searchTerm]);

  if (!game) return null;

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors ${
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
            <h1 className="text-3xl font-black">{game.name}</h1>
            <p className="text-slate-400 text-sm">Total: {list.length}</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder='Ex: "Rota 1" ou Chespin'
              className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <SubRegionNav currentGame={game} />
        <ProgressBar caught={checkedIds.length} total={list.length} />
        
        <div className={`mt-8 rounded-3xl border overflow-hidden shadow-xl ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <PokemonTable 
            list={filteredList} 
            isLoading={isLoading} 
            checkedIds={checkedIds} 
            onToggle={(id) => togglePokemon(game.id, id)}
            highlight={searchTerm.replace(/"/g, '')} // Passamos o termo para o realce
          />
        </div>
      </div>
    </div>
  );
}