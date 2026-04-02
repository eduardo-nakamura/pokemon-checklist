import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PokemonState {
  capturedByGame: Record<string, number[]>;
  lastCapturedId: number | null;
  togglePokemon: (gameId: string, pokemonId: number) => void;
}

export const usePokemonStore = create<PokemonState>()(
  persist(
    (set) => ({
      capturedByGame: {},
      lastCapturedId: null,
      togglePokemon: (gameId, pokemonId) => set((state) => {
        const currentCaptured = state.capturedByGame[gameId] || [];
        const isCurrentlyCaptured = currentCaptured.includes(pokemonId);
        
        const newCaptured = isCurrentlyCaptured 
          ? currentCaptured.filter(id => id !== pokemonId)
          : [...currentCaptured, pokemonId];

        return {
          capturedByGame: {
            ...state.capturedByGame,
            [gameId]: newCaptured
          },
          lastCapturedId: !isCurrentlyCaptured ? pokemonId : state.lastCapturedId
        };
      }),
    }),
    { 
      name: 'pokemon-storage' 
    }
  )
);