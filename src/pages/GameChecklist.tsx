import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemonData } from '../api/pokeApi'
import { useSettingsStore } from '../store/useSettingsStore'
import { usePokemonStore } from '../store/usePokemonStore'
import { SUPPORTED_GAMES, type PokemonBase } from '../types/pokemon'
import { PokemonTable } from '../components/PokemonTable'
import { DashboardCheckList } from '../components/DashboardCheckList'
import { SubRegionNav } from '../components/SubRegionNav'
import { useTranslation } from '../hooks/useTranslation'
import { useDebounce } from '../hooks/useDebounce'
import { SubRegionCombobox } from '../components/SubRegionCombobox'
import { XCircle } from 'lucide-react'

export function GameChecklist() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(['all'])
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { language, isDarkMode } = useSettingsStore()
  const { capturedByGame, togglePokemon } = usePokemonStore()

  const game = SUPPORTED_GAMES.find(g => g.id === gameId)
  
  const checkedIds = useMemo(() => 
    gameId ? capturedByGame[gameId] || [] : [], 
    [gameId, capturedByGame]
  )

  const { data: list = [], isLoading } = useQuery<PokemonBase[]>({
    queryKey: ['pokedex', game?.id, language],
    queryFn: () => {
      if (!game) throw new Error('Game not found')
      return fetchPokemonData(game.pokedexName, game.id, language)
    },
    enabled: !!game
  })

  const filteredList = useMemo(() => {
    return list.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      const routeMatch = selectedRoutes.includes('all')
        ? true
        : p.routes.some(r => selectedRoutes.includes(r))
      return nameMatch && routeMatch
    })
  }, [list, debouncedSearch, selectedRoutes])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedRoutes(['all'])
  }

  // Lógica de estado do botão de limpar
  const isFilterEmpty = searchTerm === '' && selectedRoutes.includes('all')

  const handleToggleRoute = (route: string) => {
    setSelectedRoutes(prev => {
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

  const totalPokemon = list.length
  const capturedCount = checkedIds.length
  const percentage = totalPokemon > 0 ? Math.round((capturedCount / totalPokemon) * 100) : 0

  const allRoutes = useMemo(() => {
    const routes = list.flatMap(p => p.routes)
    return ['all', ...Array.from(new Set(routes)).sort()]
  }, [list])

  if (!game) return null

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors ${
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
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
            <p className='text-slate-400 text-sm'>Total: {totalPokemon}</p>
          </div>

          <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto items-end'>
            <div className='flex-1 md:w-64'>
              <label className='block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 tracking-widest'>
                {t('pokemon_name')}
              </label>
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full h-11.5 p-3 rounded-xl border transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium
                  ${isDarkMode
                    ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                placeholder='Ex: Pikachu...'
              />
            </div>

            <div className='flex items-end gap-2 w-full md:w-auto'>
              <div className="flex-1 md:w-auto">
                <SubRegionCombobox
                  allRoutes={allRoutes}
                  selectedRoutes={selectedRoutes}
                  onToggleRoute={handleToggleRoute}
                  isDarkMode={isDarkMode}
                />
              </div>

              <button
                onClick={handleClearFilters}
                disabled={isFilterEmpty}
                title={t('clean')}
                className={`h-11.5 px-4 flex items-center gap-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all
                  ${isFilterEmpty 
                    ? 'opacity-30 cursor-not-allowed grayscale border-slate-300 text-slate-400' 
                    : 'active:scale-95 ' + (isDarkMode 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
                        : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white')
                  }`}
              >
                <XCircle size={16} />
                <span className="hidden sm:inline">{t('clean') || 'Limpar'}</span>
              </button>
            </div>
          </div>
        </header>

        <SubRegionNav currentGame={game} />

        <DashboardCheckList
          progress={percentage}
          total={totalPokemon}
          captured={capturedCount}
        />

        <div className={`mt-8 rounded-3xl border overflow-hidden shadow-xl ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
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