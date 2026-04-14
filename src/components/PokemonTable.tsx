import { useMemo, useState } from 'react'
import type { PokemonBase } from '../types/pokemon'
import { PokemonTableRow } from './PokemonTableRow'
import { useTranslation } from '../hooks/useTranslation'
import { useSettingsStore } from '../store/useSettingsStore'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

interface PokemonTableProps {
  list: PokemonBase[]
  checkedIds: number[]
  // MUDANÇA: Ajustado para receber o objeto completo e o gameId
  onToggle: (gameId: string, pokemon: PokemonBase) => void
  gameId: string // Precisamos saber qual o jogo atual para salvar na store
  isLoading: boolean
  highlight?: string
}

type SortKey = 'id' | 'name' | 'captureRate' | 'status' | 'routes' | 'availability';

export function PokemonTable ({
  list,
  checkedIds,
  onToggle,
  gameId,
  isLoading,
  highlight
}: PokemonTableProps) {
  const { t } = useTranslation()
  const { isDarkMode } = useSettingsStore()
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: 'asc' | 'desc'
  } | null>(null)

  const sortedList = useMemo(() => {
    const sortableItems = [...list]

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'status') {
          const aCaught = checkedIds.includes(a.id)
          const bCaught = checkedIds.includes(b.id)
          if (aCaught === bCaught) return 0
          return sortConfig.direction === 'asc'
            ? aCaught
              ? 1
              : -1
            : aCaught
            ? -1
            : 1
        }

        if (sortConfig.key === 'routes') {
          const aLoc = a.routes.join(', ').toLowerCase()
          const bLoc = b.routes.join(', ').toLowerCase()
          return sortConfig.direction === 'asc'
            ? aLoc.localeCompare(bLoc)
            : bLoc.localeCompare(aLoc)
        }

        const key = sortConfig.key as keyof PokemonBase
        const aValue = a[key] ?? ''
        const bValue = b[key] ?? ''

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [list, sortConfig, checkedIds])

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Componente auxiliar para os Headers para limpar o JSX
  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig?.key !== column)
      return (
        <ArrowUpDown
          size={14}
          className='opacity-30 group-hover:opacity-100 transition-opacity'
        />
      )
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={14} className='text-blue-500' />
    ) : (
      <ArrowDown size={14} className='text-blue-500' />
    )
  }

  if (isLoading)
    return (
      <div className='p-20 text-center text-slate-500 font-bold'>
        {t('loading')}
      </div>
    )

  return (
    <div
      className={`w-full overflow-x-auto border rounded-xl overflow-hidden shadow-sm transition-colors duration-300
  ${
    isDarkMode
      ? 'bg-slate-900 border-slate-700/50'
      : 'bg-white border-slate-200'
  }
`}
    >
      <table className='w-full border-collapse min-w-200'>
        <thead>
          <tr
            className={`text-left text-[10px] uppercase font-black tracking-wider border-b ${
              isDarkMode
                ? 'bg-slate-800/50 text-slate-400 border-slate-700'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {[
              { id: 'id', label: 'ID' },
              { id: 'sprite', label: 'Sprite', sortable: false },
              { id: 'name', label: 'Pokémon' },
              { id: 'availability', label: 'Games' },
              { id: 'routes', label: 'Location' },
              { id: 'captureRate', label: 'Capture Rate', center: true },
              { id: 'status', label: 'Status', center: true }
            ].map(col => (
              <th
                key={col.id}
                onClick={() =>
                  col.sortable !== false && requestSort(col.id as SortKey)
                }
                className={`p-4 group select-none ${
                  col.sortable !== false
                    ? 'cursor-pointer hover:text-blue-500 transition-colors'
                    : ''
                } ${col.center ? 'text-center' : ''}`}
              >
                <div
                  className={`flex items-center gap-1 ${
                    col.center ? 'justify-center' : ''
                  }`}
                >
                  {col.label}
                  {col.sortable !== false && (
                    <SortIcon column={col.id as SortKey} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            isDarkMode ? 'divide-slate-800' : 'divide-slate-100'
          }`}
        >
          {sortedList.map(pokemon => (
            <PokemonTableRow
              key={pokemon.id}
              pokemon={pokemon}
              gameId={gameId} // Passando o ID do jogo para a linha
              isCaught={checkedIds.includes(pokemon.id)}
              onToggle={onToggle} // Agora alinhado com (gameId, pokemon)
              isDarkMode={isDarkMode}
              highlight={highlight}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
