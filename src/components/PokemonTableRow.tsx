import React from 'react'
import type { PokemonBase } from '../types/pokemon'

// Sub-componente de Highlight com React.memo para evitar re-renderizações desnecessárias
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
  // MUDANÇA: Agora recebe o objeto completo e o gameId
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
    return (
      <tr
        // MUDANÇA: Passando gameId e o objeto pokemon inteiro para a Store
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
        <td
          className={`p-4 text-xs font-mono ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          #{String(pokemon.id).padStart(3, '0')}
        </td>

        <td className='p-4'>
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            loading='lazy'
            decoding='async'
            // Estratégia: Se a imagem falhar, carrega um placeholder e diminui a opacidade
            onError={e => {
              const target = e.target as HTMLImageElement
              // 3. FALLBACK RÁPIDO: O GitHub costuma ser 3x mais rápido que a PokeAPI no mobile
              target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
            }}
            className={`w-10 h-10 object-contain group-hover:scale-125 transition-transform duration-300 relative z-10
        ${!pokemon.sprite ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Skeleton/Placeholder de fundo enquanto carrega */}
          <div
            className={`absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse -z-0 
            ${pokemon.sprite ? 'hidden' : 'block'}`}
          />
        </td>

        <td
          className={`p-4 font-bold ${
            isCaught
              ? isDarkMode
                ? 'text-green-400'
                : 'text-green-600'
              : isDarkMode
              ? 'text-slate-200'
              : 'text-slate-800'
          }`}
        >
          <HighlightText text={pokemon.name} highlight={highlight} />
        </td>

        <td
          className={`p-4 text-sm italic ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
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
              {pokemon.captureRate > 150
                ? 'Fácil'
                : pokemon.captureRate > 50
                ? 'Médio'
                : 'Difícil'}
            </span>
            <span className='text-[10px] opacity-50 font-mono'>
              {pokemon.captureRate}
            </span>
          </div>
        </td>

        <td className='p-4 text-center'>
          <input
            type='checkbox'
            checked={isCaught}
            readOnly // Evita warnings de onChange sem handler direto no input
            className={`w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${
              isDarkMode ? 'accent-green-500' : 'accent-green-600'
            }`}
          />
        </td>
      </tr>
    )
  }
)
