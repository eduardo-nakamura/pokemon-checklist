import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemonData } from '../api/pokeApi'
import { useSettingsStore } from '../store/useSettingsStore'
import { usePokemonStore } from '../store/usePokemonStore'
import { SUPPORTED_GAMES, type PokemonBase } from '../types/pokemon'
import { PokemonTable } from '../components/PokemonTable'
// import { ProgressBar } from '../components/ProgressBar'
import { DashboardCheckList } from '../components/DashboardCheckList'
import { SubRegionNav } from '../components/SubRegionNav'
import { useTranslation } from '../hooks/useTranslation'
import { useDebounce } from '../hooks/useDebounce'
import { SubRegionCombobox } from '../components/SubRegionCombobox'

export function GameChecklist () {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [searchTerm, setSearchTerm] = useState('')
  // const [selectedRoute, setSelectedRoute] = useState('all')
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(['all'])
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { language, isDarkMode } = useSettingsStore()
  // 1. Pegamos a togglePokemon da Store
  const { capturedByGame, togglePokemon } = usePokemonStore()

  const game = SUPPORTED_GAMES.find(g => g.id === gameId)
  const checkedIds = gameId ? capturedByGame[gameId] || [] : []

  const { data: list = [], isLoading } = useQuery<PokemonBase[]>({
    queryKey: ['pokedex', game?.id, language],
    queryFn: () => {
      if (!game) throw new Error('Game not found')
      return fetchPokemonData(game.pokedexName, game.id, language)
    },
    enabled: !!game
  })

  // Dashboard
  const totalPokemon = list.length
  const capturedCount = checkedIds.length
  const percentage =
    totalPokemon > 0 ? Math.round((capturedCount / totalPokemon) * 100) : 0

  const filteredList = useMemo(() => {
    return list.filter(p => {
      const nameMatch = p.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())

      const routeMatch = selectedRoutes.includes('all')
        ? true
        : p.routes.some(r => selectedRoutes.includes(r))

      return nameMatch && routeMatch
    })
  }, [list, debouncedSearch, selectedRoutes])

  const handleToggleRoute = (route: string) => {
    setSelectedRoutes(prev => {
      // Se selecionar 'all', limpa o resto
      if (route === 'all') return ['all']

      const newRoutes = prev.filter(r => r !== 'all')

      if (newRoutes.includes(route)) {
        const filtered = newRoutes.filter(r => r !== route)
        return filtered.length === 0 ? ['all'] : filtered
      } else {
        return [...newRoutes, route]
      }
    })
  }

  const allRoutes = useMemo(() => {
    const routes = list.flatMap(p => p.routes)
    return ['all', ...Array.from(new Set(routes)).sort()]
  }, [list])

  if (!game) return null

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className='max-w-5xl mx-auto'>
        <button
          onClick={() => navigate('/')}
          className='mb-6 flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-colors'
        >
          ← {t('main_menu')}
        </button>

        <header className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 '>
          <div className='flex flex-col'>
            <h1 className='text-3xl font-black'>{game.name}</h1>
            <p className='text-slate-400 text-sm'>Total: {list.length}</p>
          </div>

          <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto'>
            <div className='flex-1 md:w-64'>
              <label className='block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 tracking-widest'>
                Pokémon
              </label>
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full h-11.5 p-3 rounded-xl border transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium
    ${
      isDarkMode
        ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500'
        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
    }`}
                placeholder='Ex: Pikachu...'
              />
            </div>

            <SubRegionCombobox
              allRoutes={allRoutes}
              selectedRoutes={selectedRoutes}
              onToggleRoute={handleToggleRoute}
              isDarkMode={isDarkMode}
            />
          </div>
        </header>

        <SubRegionNav currentGame={game} />

        {/* 2. Removida a prop pokemonList que não é mais usada */}
        <DashboardCheckList
          progress={percentage}
          total={totalPokemon}
          captured={capturedCount}
        />

        <div
          className={`mt-8 rounded-3xl border overflow-hidden shadow-xl ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* 3. Atualizado o onToggle para passar (gameId, pokemonObject) */}
          {/* 4. Adicionada a prop gameId necessária para a tabela */}
          <PokemonTable
            list={filteredList}
            isLoading={isLoading}
            checkedIds={checkedIds}
            gameId={game.id}
            onToggle={(gameId, pokemon) => togglePokemon(gameId, pokemon)}
            highlight={debouncedSearch}
          />
        </div>
      </div>
    </div>
  )
}
