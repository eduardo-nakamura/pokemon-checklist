import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PokemonState {
  capturedByGame: Record<string, number[]>;
  togglePokemon: (gameId: string, pokemonId: number) => void;
}

export const usePokemonStore = create<PokemonState>()(
  persist(
    (set) => ({
      capturedByGame: {},
      togglePokemon: (gameId, pokemonId) => set((state) => {
        const currentCaptured = state.capturedByGame[gameId] || [];
        const isCaptured = currentCaptured.includes(pokemonId);
        
        const newCaptured = isCaptured 
          ? currentCaptured.filter(id => id !== pokemonId)
          : [...currentCaptured, pokemonId];

        return {
          capturedByGame: {
            ...state.capturedByGame,
            [gameId]: newCaptured
          }
        };
      }),
    }),
    { 
      name: 'pokemon-storage' 
    }
  )
);