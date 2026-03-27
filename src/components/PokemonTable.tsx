import type { PokemonBase } from '../types/pokemon';
import { useTranslation } from '../hooks/useTranslation';
import { useSettingsStore } from '../store/useSettingsStore';
interface PokemonTableProps {
  list: PokemonBase[];
  checkedIds: number[];
  onToggle: (id: number) => void;
  isLoading: boolean;
  highlight?: string; // Prop restaurada
}

// Componente auxiliar para realizar o realce visual (Highlight)
const HighlightText = ({ text, highlight }: { text: string; highlight?: string }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-400/40 text-current rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export function PokemonTable({ list, checkedIds, onToggle, isLoading, highlight }: PokemonTableProps) {
  const { t } = useTranslation();
const { isDarkMode } = useSettingsStore();
  if (isLoading) {
    return <div className="p-20 text-center text-slate-500 font-bold">{t('loading')}</div>;
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-slate-700 bg-slate-800/30">
          <th className="p-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('table_id')}</th>
          <th className="p-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('table_sprite')}</th>
          <th className="p-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('table_pokemon')}</th>
          <th className="p-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('table_location')}</th>
          <th className="p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('table_status')}</th>
        </tr>
      </thead>
     <tbody className={`divide-y transition-colors ${
        isDarkMode ? 'divide-slate-700/50' : 'divide-slate-200'
      }`}>
        {list.map((pokemon) => {
          const isCaught = checkedIds.includes(pokemon.id);
          
          return (
            <tr 
              key={pokemon.id} 
              className={`group transition-colors ${
                isCaught 
                  ? (isDarkMode ? 'bg-green-500/5' : 'bg-green-50/50') 
                  : (isDarkMode ? 'hover:bg-slate-700/20' : 'hover:bg-slate-50')
              }`}
            >
              {/* ID do Pokémon */}
              <td className={`p-4 text-xs font-mono transition-colors ${
                isDarkMode ? 'text-slate-100' : 'text-slate-900'
              }`}>
                #{String(pokemon.id).padStart(3, '0')}
              </td>

              {/* Sprite */}
              <td className="p-4">
                <img 
                  src={pokemon.sprite} 
                  alt={pokemon.name} 
                  className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                />
              </td>

              {/* Nome do Pokémon (Onde estava o erro de leitura) */}
              <td className={`p-4 font-bold transition-colors ${
                isCaught 
                  ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                  : (isDarkMode ? 'text-slate-200' : 'text-slate-800')
              }`}>
                <HighlightText text={pokemon.name} highlight={highlight} />
              </td>

              {/* Localização / Rotas */}
              <td className={`p-4 text-sm italic transition-colors ${
                isDarkMode ? 'text-slate-100' : 'text-slate-600'
              }`}>
                <div className="flex flex-wrap gap-1">
                  {pokemon.routes.map((route, index) => (
                    <span key={index}>
                      <HighlightText text={route} highlight={highlight} />
                      {index < pokemon.routes.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </td>

              {/* Checkbox de Status */}
              <td className="p-4 text-center">
                <input 
                  type="checkbox" 
                  checked={isCaught} 
                  onChange={() => onToggle(pokemon.id)}
                  className={`w-5 h-5 rounded transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'border-slate-600 bg-slate-800 text-red-600 focus:ring-red-500' 
                      : 'border-slate-300 bg-white text-red-500 focus:ring-red-400 shadow-sm'
                  }`}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}