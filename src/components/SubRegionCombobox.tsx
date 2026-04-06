import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Search, MapPin, Check, X } from 'lucide-react'

interface SubRegionComboboxProps {
  allRoutes: string[]
  selectedRoutes: string[] // Alterado para array
  onToggleRoute: (route: string) => void // Alterado para toggle
  isDarkMode: boolean
}

export const SubRegionCombobox: React.FC<SubRegionComboboxProps> = ({
  allRoutes,
  selectedRoutes,
  onToggleRoute,
  isDarkMode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const comboboxRef = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside (event: MouseEvent) {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('') // Limpa a busca ao fechar
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return allRoutes.filter(r => r !== 'all')

    return allRoutes.filter(
      route => route !== 'all' && route.toLowerCase().includes(term)
    )
  }, [allRoutes, searchTerm])

  // Texto que aparece no input quando fechado
  const getDisplayText = () => {
    if (selectedRoutes.includes('all')) return 'Todas as Rotas'
    if (selectedRoutes.length === 1) return selectedRoutes[0]
    return `${selectedRoutes.length} rotas selecionadas`
  }

  return (
    <div ref={comboboxRef} className='w-full md:w-80 relative'>
      <label className='block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 tracking-widest'>
        Filtrar por Localização
      </label>

      <div className='relative group'>
        <div className='relative'>
          <input
            type='text'
            value={isOpen ? searchTerm : getDisplayText()}
            onFocus={() => setIsOpen(true)}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder='Pesquisar rota...'
            className={`w-full h-11.5 p-3 pr-10 rounded-xl border transition-all duration-300 text-sm font-medium outline-none
    ${
      isDarkMode
        ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-600'
        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 shadow-sm'
    }`}
          />
          <Search
            size={16}
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-slate-600' : 'text-slate-400'
            }`}
          />

          {/* Botão de limpar seleção se não for 'all' */}
          {!isOpen && !selectedRoutes.includes('all') && (
            <button
              onClick={() => onToggleRoute('all')}
              className='absolute right-10 top-1/2 -translate-y-1/2 hover:text-red-500 transition-colors'
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isOpen && (
          <div
            className={`absolute z-50 w-full mt-2 max-h-72 overflow-y-auto rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200 transition-colors
    ${
      isDarkMode
        ? 'bg-slate-950 border-slate-700/50' // Fundo ultra escuro e sutil no Dark Mode
        : 'bg-white border-slate-200'
    }
  `}
          >
            {/* Opção TODAS */}
            <div
              className={`p-3.5 cursor-pointer text-sm font-bold transition-colors flex items-center justify-between
        ${
          isDarkMode
            ? 'hover:bg-blue-900/40 text-blue-400' // Hover escuro com texto azul claro no Dark
            : 'hover:bg-blue-50 text-blue-600'
        } // Hover claro com texto azul escuro no Light
        ${
          selectedRoutes.includes('all')
            ? ''
            : isDarkMode
            ? 'text-slate-300'
            : 'text-slate-700'
        }
      `}
              onClick={() => {
                onToggleRoute('all')
                setIsOpen(false)
              }}
            >
              Todas as Rotas
              {selectedRoutes.includes('all') && <Check size={16} />}
            </div>

            <div
              className={`h-px ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'
              }`}
            />

            {/* Lista de Rotas */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map(route => {
                const isSelected = selectedRoutes.includes(route)
                return (
                  <div
                    key={route}
                    className={`p-3.5 cursor-pointer text-sm transition-colors flex items-center justify-between
              ${
                isDarkMode
                  ? 'hover:bg-slate-700 text-slate-100' // Hover escuro, texto branco no Dark
                  : 'hover:bg-blue-50 text-slate-900'
              } // Hover claro, texto preto no Light
              ${
                isSelected
                  ? isDarkMode
                    ? 'bg-blue-600/30 text-blue-300 font-semibold'
                    : 'bg-blue-100 text-blue-700' // Cores de seleção
                  : isDarkMode
                  ? 'text-slate-300'
                  : 'text-slate-700'
              } // Cores padrão de texto
            `}
                    onClick={() => onToggleRoute(route)}
                  >
                    <div className='flex items-center gap-2'>
                      <MapPin
                        size={14}
                        className={
                          isSelected
                            ? isDarkMode
                              ? 'text-blue-300'
                              : 'text-blue-500'
                            : 'opacity-60'
                        }
                      />
                      {route}
                    </div>
                    {isSelected && <Check size={16} />}
                  </div>
                )
              })
            ) : (
              <div
                className={`p-8 text-center text-xs italic ${
                  isDarkMode ? 'text-slate-600' : 'text-slate-500'
                }`}
              >
                Nenhuma rota encontrada para "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
