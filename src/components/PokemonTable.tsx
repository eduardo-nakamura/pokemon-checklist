import { useMemo, useState } from 'react'
import type { PokemonBase } from '../types/pokemon'
import { PokemonTableRow } from './PokemonTableRow'
import { useTranslation } from '../hooks/useTranslation'
import { useSettingsStore } from '../store/useSettingsStore'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

interface PokemonTableProps {
  list: PokemonBase[]
  checkedIds: number[]
  onToggle: (gameId: string, pokemon: PokemonBase) => void
  gameId: string
  isLoading: boolean
  highlight?: string
}

type SortKey = 'id' | 'name' | 'captureRate' | 'status' | 'routes' | 'availability'

export function PokemonTable({
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
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const sortedList = useMemo(() => {
    const sortableItems = [...list]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'status') {
          const aCaught = checkedIds.includes(a.id)
          const bCaught = checkedIds.includes(b.id)
          if (aCaught === bCaught) return 0
          return sortConfig.direction === 'asc' ? (aCaught ? 1 : -1) : (aCaught ? -1 : 1)
        }

        if (sortConfig.key === 'routes') {
          const aLoc = a.routes.join(', ').toLowerCase()
          const bLoc = b.routes.join(', ').toLowerCase()
          return sortConfig.direction === 'asc' ? aLoc.localeCompare(bLoc) : bLoc.localeCompare(aLoc)
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

  const totalPages = Math.ceil(sortedList.length / itemsPerPage)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedList.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedList, currentPage])

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1)
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig?.key !== column)
      return <ArrowUpDown size={14} className='opacity-30 group-hover:opacity-100' />
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className='text-blue-500' /> : <ArrowDown size={14} className='text-blue-500' />
  }

  if (isLoading) return <div className='p-20 text-center text-slate-500 font-bold'>{t('loading')}</div>

  return (
    
    <div className={`w-full flex flex-col border rounded-xl shadow-sm transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'
    }`}>
      
      
      <div className="w-full overflow-x-auto">
        <table className='w-full border-collapse min-w-200'>
          <thead>
            <tr className={`text-left text-[10px] uppercase font-black tracking-wider border-b ${
              isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {[
                { id: 'id', label: 'ID', stickyPos: 'left-0' },
                { id: 'sprite', label: 'Sprite', sortable: false, stickyPos: 'left-[55px]' },
                { id: 'name', label: 'Pokémon', stickyPos: 'left-[105px]' },
                { id: 'availability', label: 'Games' },
                { id: 'routes', label: 'Location' },
                { id: 'captureRate', label: 'Capture Rate', center: true },
                { id: 'status', label: 'Status', center: true }
              ].map((col, idx) => (
                <th
                  key={col.id}
                  onClick={() => col.sortable !== false && requestSort(col.id as SortKey)}
                  className={`p-4 group select-none ${col.sortable !== false ? 'cursor-pointer hover:text-blue-500' : ''} ${col.center ? 'text-center' : ''} ${
                    idx < 3 ? `sticky ${col.stickyPos} z-20 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}` : ''
                  }`}
                >
                  <div className={`flex items-center gap-1 ${col.center ? 'justify-center' : ''}`}>
                    {col.label}
                    {col.sortable !== false && <SortIcon column={col.id as SortKey} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {paginatedList.map(pokemon => (
              <PokemonTableRow
                key={pokemon.id}
                pokemon={pokemon}
                gameId={gameId}
                isCaught={checkedIds.includes(pokemon.id)}
                onToggle={onToggle}
                isDarkMode={isDarkMode}
                highlight={highlight}
              />
            ))}
          </tbody>
        </table>
      </div>

      
      <div className={`flex flex-wrap items-center justify-center gap-1 p-4 border-t ${
        isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <button
          disabled={currentPage === 1}
          onClick={() => {
            setCurrentPage(prev => prev - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className={`px-3 py-2 text-[10px] font-black uppercase rounded border transition-all disabled:opacity-20 ${
            isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          Previous
        </button>

        {pageNumbers.map(num => (
          <button
            key={num}
            onClick={() => {
              setCurrentPage(num)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`px-3 py-2 text-[10px] font-black rounded border transition-all ${
              currentPage === num 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => {
            setCurrentPage(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className={`px-3 py-2 text-[10px] font-black uppercase rounded border transition-all disabled:opacity-20 ${
            isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}