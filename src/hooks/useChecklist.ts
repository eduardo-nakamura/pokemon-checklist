import { useState, useEffect } from "react";

export function useChecklist(gameId: string) {
  const storageKey = `pkmn-check-${gameId}`;

  const [checkedIds, setCheckedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Salva sempre que mudar
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checkedIds));
  }, [checkedIds, storageKey]);

  const togglePokemon = (id: number) => {
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return { checkedIds, togglePokemon };
}