import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemonData } from '../api/pokeApi'
import { useSettingsStore } from '../store/useSettingsStore'
import { usePokemonStore } from '../store/usePokemonStore'
import { SUPPORTED_GAMES, type PokemonBase } from '../types/pokemon'
import { PokemonTable } from '../components/PokemonTable'
import { ProgressBar } from '../components/ProgressBar'
import { SubRegionNav } from '../components/SubRegionNav' // Importação restaurada
import { useTranslation } from '../hooks/useTranslation'

export function GameChecklist () {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Estados de Configuração e Persistência
  const { language, isDarkMode } = useSettingsStore()
  const { capturedByGame, togglePokemon } = usePokemonStore()

  // Estado Local para Busca
  const [searchTerm, setSearchTerm] = useState('')

  const game = SUPPORTED_GAMES.find(g => g.id === gameId)
  const checkedIds = gameId ? capturedByGame[gameId] || [] : []

  // Hook de Busca de Dados com Cache (TanStack Query)
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['pokedex', game?.id, language],
    // Passamos game.id completo para a API agora
    queryFn: () => fetchPokemonData(game!.pokedexName, game!.id, language),
    enabled: !!game
  })

  // Lógica de Filtro da Busca (Restaurada)
const filteredList = useMemo(() => {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return list;

  // Verifica se a busca está entre aspas: "termo"
  const isExactSearch = query.startsWith('"') && query.endsWith('"');
  
  if (isExactSearch) {
    // Remove as aspas para comparar o termo puro
    const exactTerm = query.slice(1, -1);
    
    return list.filter(p => 
      p.name.toLowerCase() === exactTerm ||
      p.routes.some(r => r.toLowerCase() === exactTerm)
    );
  }

  // Busca padrão (contém o termo)
  return list.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.routes.some(r => r.toLowerCase().includes(query))
  );
}, [list, searchTerm]);

  if (!game) return null

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className='max-w-5xl mx-auto'>
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/')}
          className='mb-6 flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-colors'
        >
          ← {t('main_menu')}
        </button>

        {/* Header com Título e Busca (Restaurado) */}
        <header className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
          <div className='flex flex-col'>
            <h1 className='text-3xl font-black'>{game.name}</h1>
            <p className='text-slate-400 text-sm'>
              {t('found_pokemon')}: {list.length}
            </p>
          </div>

          <div className='relative w-full md:w-80'>
            <input
              type='text'
              placeholder={t('search_placeholder')}
              className={`w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              } border`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Navegação de Sub-regiões (Restaurada) */}
        <SubRegionNav currentGame={game} />

        {/* Barra de Progresso */}
        <ProgressBar caught={checkedIds.length} total={list.length} />

        {/* Tabela de Pokémon */}
        <div
          className={`mt-8 rounded-3xl border overflow-hidden ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          <PokemonTable
            list={filteredList}
            isLoading={isLoading}
            checkedIds={checkedIds}
            onToggle={id => togglePokemon(game.id, id)}
          />
        </div>
      </div>
    </div>
  )
}
