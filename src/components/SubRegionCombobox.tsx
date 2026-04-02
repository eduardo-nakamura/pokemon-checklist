import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

interface SubRegionComboboxProps {
  allRoutes: string[];
  selectedRoute: string;
  onSelectRoute: (route: string) => void;
  isDarkMode: boolean;
}

export const SubRegionCombobox: React.FC<SubRegionComboboxProps> = ({
  allRoutes,
  selectedRoute,
  onSelectRoute,
  isDarkMode
}) => {
  // Removido o 't' do useTranslation pois não estava sendo usado no JSX
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  /* ESTRATÉGIA: Sincronização durante a renderização.
    Em vez de useEffect, comparamos o estado local com a prop. 
    Se a prop mudou (ex: mudou de região), resetamos o que o usuário estava digitando.
  */
  const [prevSelectedRoute, setPrevSelectedRoute] = useState(selectedRoute);
  const [searchTerm, setSearchTerm] = useState(selectedRoute === 'all' ? '' : selectedRoute);

  if (selectedRoute !== prevSelectedRoute) {
    setPrevSelectedRoute(selectedRoute);
    setSearchTerm(selectedRoute === 'all' ? '' : selectedRoute);
  }

  // Fecha o Combobox ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(selectedRoute === 'all' ? '' : selectedRoute);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedRoute]);

  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allRoutes.filter(r => r !== 'all');
    
    return allRoutes.filter(
      route => route !== 'all' && route.toLowerCase().includes(term)
    );
  }, [allRoutes, searchTerm]);

  const handleSelect = (route: string) => {
    onSelectRoute(route);
    setIsOpen(false);
  };

  return (
    <div ref={comboboxRef} className="w-full md:w-80 relative">
      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 tracking-widest">
        Filtrar por Localização
      </label>
      
      <div className="relative group">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Pesquisar rota..."
            className={`w-full p-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 outline-none transition-all duration-300 font-medium text-sm
              ${isDarkMode 
                ? 'border-slate-700 focus:ring-2 focus:ring-blue-600' 
                : 'border-slate-200 focus:ring-2 focus:ring-blue-500 shadow-sm'
              }`}
          />
          <Search size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
        </div>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 max-h-72 overflow-y-auto rounded-2xl border shadow-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div 
              className={`p-3.5 cursor-pointer text-sm font-semibold transition-colors
                ${isDarkMode ? 'hover:bg-blue-600 text-slate-100' : 'hover:bg-blue-50 text-slate-900'}`}
              onClick={() => handleSelect('all')}
            >
               Todas as Rotas
            </div>

            <div className={`h-px ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`} />

            {filteredOptions.length > 0 ? (
              filteredOptions.map(route => (
                <div 
                  key={route} 
                  className={`p-3.5 cursor-pointer text-sm transition-colors flex items-center gap-2
                    ${isDarkMode ? 'hover:bg-slate-700 text-slate-100' : 'hover:bg-blue-50 text-slate-900'}
                    ${selectedRoute === route ? (isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-100 text-blue-700') : ''}`}
                  onClick={() => handleSelect(route)}
                >
                  <MapPin size={14} className="opacity-50" />
                  {route}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">Nenhuma rota encontrada.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};