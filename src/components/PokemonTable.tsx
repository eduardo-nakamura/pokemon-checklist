import type { PokemonBase } from '../types/pokemon';
import { useTranslation } from '../hooks/useTranslation';

interface PokemonTableProps {
  list: PokemonBase[];
  checkedIds: number[];
  onToggle: (id: number) => void;
  isLoading: boolean;
}

export function PokemonTable({ list, checkedIds, onToggle, isLoading }: PokemonTableProps) {
  const { t } = useTranslation();

  if (isLoading) return <div className="p-20 text-center text-slate-500 font-bold">{t('loading')}</div>;

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
              <td className="p-4 text-xs font-mono text-slate-600">#{String(pokemon.id).padStart(3, '0')}</td>
              <td className="p-4">
                <img src={pokemon.sprite} alt={pokemon.name} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
              </td>
              <td className={`p-4 font-bold ${isCaught ? 'text-green-400' : ''}`}>
                {pokemon.name}
              </td>
              <td className="p-4 text-sm text-slate-500 italic">
                {pokemon.routes[0] === "special_evolution" ? t('special_evolution') : pokemon.routes.join(', ')}
              </td>
              <td className="p-4 text-center">
                <input 
                  type="checkbox" 
                  checked={isCaught} 
                  onChange={() => onToggle(pokemon.id)}
                  className="w-5 h-5 rounded border-slate-600 text-red-600 focus:ring-red-500 transition-all"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}