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
import { XCircle, RefreshCw } from 'lucide-react'

export function GameChecklist () {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(['all'])
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { language, isDarkMode } = useSettingsStore()
  const { capturedByGame, togglePokemon } = usePokemonStore()

  const game = SUPPORTED_GAMES.find(g => g.id === gameId)

  const checkedIds = useMemo(
    () => (gameId ? capturedByGame[gameId] || [] : []),
    [gameId, capturedByGame]
  )

  const {
    data: list = [],
    isLoading,
    refetch,
    isFetching
  } = useQuery<PokemonBase[]>({
    queryKey: ['pokedex', game?.id, language],
    queryFn: () => {
      if (!game) throw new Error('Game not found')
      return fetchPokemonData(game.pokedexName, game.id, language)
    },
    enabled: !!game,
    staleTime: Infinity
  })

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedRoutes(['all'])
    setCurrentPage(1)
  }

  const isFilterEmpty = searchTerm === '' && selectedRoutes.includes('all')

  const handleToggleRoute = (route: string) => {
    setSelectedRoutes(prev => {
      let nextRoutes: string[]
      if (route === 'all') {
        nextRoutes = ['all']
      } else {
        const newRoutes = prev.filter(r => r !== 'all')
        if (newRoutes.includes(route)) {
          const filtered = newRoutes.filter(r => r !== route)
          nextRoutes = filtered.length === 0 ? ['all'] : filtered
        } else {
          nextRoutes = [...newRoutes, route]
        }
      }
      return nextRoutes
    })
    setCurrentPage(1)
  }

  const totalPokemon = list.length
  const capturedCount = checkedIds.length
  const percentage =
    totalPokemon > 0 ? Math.round((capturedCount / totalPokemon) * 100) : 0

  const allRoutes = useMemo(() => {
    const routes = list.flatMap(p => p.routes)
    return ['all', ...Array.from(new Set(routes)).sort()]
  }, [list])

  if (!game) return null

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
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

        <header className='flex flex-col gap-6 mb-8'>
          {/* Linha Superior: Título e Botão Principal */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <h1 className='text-2xl md:text-3xl font-black tracking-tight'>
                {game.name}
              </h1>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className={`p-2 rounded-xl border transition-all ${
                  isFetching
                    ? 'animate-spin opacity-50'
                    : 'hover:scale-110 active:scale-95'
                } ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-slate-200'
                }`}
              >
                <RefreshCw size={20} />
              </button>
            </div>
            <p className='text-slate-400 text-sm font-bold bg-slate-500/10 px-3 py-1 rounded-lg'>
              Total: {totalPokemon}
            </p>
          </div>

          {/* Linha Inferior: Filtros */}
          <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-end'>
            {/* Busca por Nome */}
            <div className='md:col-span-5'>
              <label className='block text-[10px] font-black uppercase text-slate-500 mb-1.5 ml-1 tracking-widest'>
                {t('pokemon_name')}
              </label>
              <input
                type='text'
                value={searchTerm}
                onChange={handleSearchChange}
                className={`w-full h-12 px-4 rounded-2xl border outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-700'
                    : 'bg-white border-slate-200'
                }`}
                placeholder='Ex: Pikachu...'
              />
            </div>

            {/* Localização e Limpar */}
            <div className='md:col-span-7 flex items-end gap-2'>
              <div className='flex-1 relative'>
               
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
                className={`h-12 w-12 md:w-auto md:px-6 flex items-center justify-center gap-2 rounded-2xl border transition-all shrink-0 ${
                  isFilterEmpty
                    ? 'opacity-20 cursor-not-allowed border-slate-300 text-slate-400'
                    : isDarkMode
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                    : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white'
                }`}
              >
                <XCircle size={20} />
                <span className='hidden md:inline font-black text-[10px] uppercase tracking-widest'>
                  {t('clean') || 'Limpar'}
                </span>
              </button>
            </div>
          </div>
        </header>

        <SubRegionNav currentGame={game} />

        <div className='my-8'>
          <DashboardCheckList
            progress={percentage}
            total={totalPokemon}
            captured={capturedCount}
          />
        </div>

        {/* Tabela com Overlay de carregamento corrigido */}
        <div
          className={`relative rounded-3xl border overflow-hidden shadow-2xl transition-colors duration-300 ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700/50'
              : 'bg-white border-slate-200'
          }`}
        >
          {isFetching && (
            <div className='absolute inset-0 z-5 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center rounded-3xl'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
            </div>
          )}
          <PokemonTable
            list={filteredList}
            isLoading={isLoading}
            checkedIds={checkedIds}
            gameId={game.id}
            onToggle={(gameId, pokemon) => togglePokemon(gameId, pokemon)}
            highlight={debouncedSearch}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}
