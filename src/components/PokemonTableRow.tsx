import React from 'react'
import type { PokemonBase } from '../types/pokemon'

const HighlightText = React.memo(
  ({ text, highlight }: { text: string; highlight?: string }) => {
    if (!highlight || !highlight.trim()) return <>{text}</>
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={i}
              className='bg-yellow-400/40 text-current rounded-sm px-0.5'
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }
)

interface PokemonRowProps {
  pokemon: PokemonBase
  isCaught: boolean
  onToggle: (gameId: string, pokemon: PokemonBase) => void
  gameId: string
  isDarkMode: boolean
  highlight?: string
}

export const PokemonTableRow = React.memo(
  ({
    pokemon,
    isCaught,
    onToggle,
    gameId,
    isDarkMode,
    highlight
  }: PokemonRowProps) => {
    
    // Helper para manter o fundo sólido nas colunas fixas durante o hover e seleção
    const getStickyBg = () => {
      if (isCaught) return isDarkMode ? 'bg-[#1a2e25]' : 'bg-[#f0fdf4]' // Verde suave para capturados
      return isDarkMode ? 'bg-slate-900 group-hover:bg-slate-800' : 'bg-white group-hover:bg-slate-50'
    }

    return (
      <tr
        onClick={() => onToggle(gameId, pokemon)}
        className={`group transition-colors cursor-pointer select-none border-b last:border-0 ${
          isCaught
            ? isDarkMode
              ? 'bg-green-500/10 border-slate-700/50'
              : 'bg-green-50/60 border-slate-200'
            : isDarkMode
            ? 'hover:bg-slate-700/20 border-slate-700/50'
            : 'hover:bg-slate-50 border-slate-200'
        }`}
      >
        {/* COLUNA 1: ID (FIXA) */}
        <td
          className={`p-4 text-xs font-mono sticky left-0 z-10 transition-colors ${getStickyBg()} ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          #{String(pokemon.id).padStart(3, '0')}
        </td>

        {/* COLUNA 2: SPRITE (FIXA) */}
        <td className={`p-4 sticky left-13.75 z-10 transition-colors ${getStickyBg()}`}>
          <div className="relative w-10 h-10">
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              loading='lazy'
              decoding='async'
              onError={e => {
                const target = e.target as HTMLImageElement
                target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
              }}
              className={`w-10 h-10 object-contain group-hover:scale-125 transition-transform duration-300 relative z-10
                ${!pokemon.sprite ? 'opacity-0' : 'opacity-100'}`}
            />
            <div
              className={`absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse z-0 
                ${pokemon.sprite ? 'hidden' : 'block'}`}
            />
          </div>
        </td>

        {/* COLUNA 3: NOME (FIXA) */}
        <td
          className={`p-4 font-bold sticky left-26.25 z-10 border-r transition-colors ${getStickyBg()} ${
            isCaught
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : isDarkMode ? 'text-slate-200' : 'text-slate-800'
          } ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}
        >
          <HighlightText text={pokemon.name} highlight={highlight} />
        </td>

        {/* COLUNAS RESTANTES (ROLAGEM NORMAL) */}
        <td className='p-4'>
          {pokemon.availability && (
            <div className='flex flex-wrap gap-1'>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border ${
                  pokemon.availability === 'Both'
                    ? isDarkMode
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                    : pokemon.availability === 'X' ||
                      pokemon.availability === 'Sun'
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}
              >
                {pokemon.availability === 'Both'
                  ? gameId.includes('xy')
                    ? 'X & Y'
                    : 'Sun & Moon'
                  : pokemon.availability}
              </span>
            </div>
          )}
        </td>

        <td className={`p-4 text-sm italic ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <div className='flex flex-wrap gap-1'>
            {pokemon.routes.map((route, index) => (
              <span key={index}>
                <HighlightText text={route} highlight={highlight} />
                {index < pokemon.routes.length - 1 && ', '}
              </span>
            ))}
          </div>
        </td>

        <td className='p-4 text-center'>
          <div className='flex flex-col items-center gap-1'>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                pokemon.captureRate > 200
                  ? 'bg-green-100 text-green-700'
                  : pokemon.captureRate > 100
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {pokemon.captureRate > 150 ? 'Fácil' : pokemon.captureRate > 50 ? 'Médio' : 'Difícil'}
            </span>
            <span className='text-[10px] opacity-50 font-mono'>{pokemon.captureRate}</span>
          </div>
        </td>

        <td className='p-4 text-center'>
          <input
            type='checkbox'
            checked={isCaught}
            readOnly
            className={`w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${
              isDarkMode ? 'accent-green-500' : 'accent-green-600'
            }`}
          />
        </td>
      </tr>
    )
  }
)