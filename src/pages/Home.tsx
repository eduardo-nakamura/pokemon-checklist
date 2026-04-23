import { useQueries } from '@tanstack/react-query'
import { HOME_GAMES, type PokemonBase } from '../types/pokemon' // Importe o tipo PokemonBase
import { GameCard } from '../components/GameCard'
import { useSettingsStore } from '../store/useSettingsStore'
import { useTranslation } from '../hooks/useTranslation'
import { usePokemonStore } from '../store/usePokemonStore'

export function Home () {
  const { isDarkMode, language } = useSettingsStore()
  const { t } = useTranslation()
  const { capturedByGame } = usePokemonStore()

  // Definimos explicitamente que cada query retorna um array de PokemonBase
  const pokedexResults = useQueries({
    queries: HOME_GAMES.map(game => ({
      queryKey: ['pokedex', game.id, language],
      staleTime: Infinity
    }))
  })

  return (
    <div
      className={`min-h-screen p-4 md:p-8 flex flex-col items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
      }`}
    >
      <header className='mb-12 text-center'>
        <h1
          className={`text-6xl font-black tracking-tighter italic ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          POKÉ<span className='text-red-600'>CHECK</span>
        </h1>
        <p
          className={`font-medium mt-2 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {t('home_title')}
        </p>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl'>
        {HOME_GAMES.map((game, index) => {
          const cachedData = pokedexResults[index].data as PokemonBase[]
          const totalCount = cachedData?.length || 0
          const capturedCount = capturedByGame[game.id]?.length || 0

          return (
            <GameCard
              key={game.id}
              game={game}
              capturedCount={capturedCount}
              totalInPokedex={totalCount}
            />
          )
        })}
      </div>
    </div>
  )
}
