import type { PokemonBase } from '../types/pokemon';
import { useTranslation } from '../hooks/useTranslation';

interface PokemonTableProps {
  list: PokemonBase[];
  checkedIds: number[];
  onToggle: (id: number) => void;
  isLoading: boolean;
  highlight?: string; // Prop restaurada
}

// Componente auxiliar para realizar o realce visual (Highlight)
const HighlightText = ({ text, highlight }: { text: string, highlight?: string }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  
  // Escapa caracteres especiais para o RegExp não quebrar
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() 
          ? <mark key={i} className="bg-yellow-400/40 text-current rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </>
  );
};

export function PokemonTable({ list, checkedIds, onToggle, isLoading, highlight }: PokemonTableProps) {
  const { t } = useTranslation();

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
      <tbody className="divide-y divide-slate-700/50">
        {list.map((pokemon) => {
          const isCaught = checkedIds.includes(pokemon.id);
          return (
            <tr key={pokemon.id} className={`group transition-colors ${isCaught ? 'bg-green-500/5' : 'hover:bg-slate-700/20'}`}>
              <td className="p-4 text-xs font-mono text-slate-600">
                #{String(pokemon.id).padStart(3, '0')}
              </td>
              <td className="p-4">
                <img 
                  src={pokemon.sprite} 
                  alt={pokemon.name} 
                  className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                />
              </td>
              <td className={`p-4 font-bold ${isCaught ? 'text-green-400' : 'text-slate-200'}`}>
                <HighlightText text={pokemon.name} highlight={highlight} />
              </td>
              <td className="p-4 text-sm text-slate-500 italic">
                <div className="flex flex-wrap gap-1">
                  {pokemon.routes.map((route, index) => (
                    <span key={index}>
                      <HighlightText text={route} highlight={highlight} />
                      {index < pokemon.routes.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4 text-center">
                <input 
                  type="checkbox" 
                  checked={isCaught} 
                  onChange={() => onToggle(pokemon.id)}
                  className="w-5 h-5 rounded border-slate-600 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}