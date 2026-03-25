import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PokemonState {
  // Objeto onde a chave é o ID do jogo e o valor é a lista de IDs capturados
  capturedByGame: Record<string, number[]>;
  togglePokemon: (gameId: string, pokemonId: number) => void;
}
export const usePokemonStore = create<PokemonState>()(
  persist(
    (set) => ({
      capturedByGame: {},
      togglePokemon: (gameId, pokemonId) => 
        set((state) => {
          // Garante que pegamos o estado mais fresco
          const currentList = state.capturedByGame[gameId] || [];
          const isCaptured = currentList.includes(pokemonId);
          
          const newList = isCaptured 
            ? currentList.filter(id => id !== pokemonId)
            : [...currentList, pokemonId];

          return {
            capturedByGame: { ...state.capturedByGame, [gameId]: newList }
          };
        }),
      resetGame: (gameId: string ) => 
        set((state) => ({
          capturedByGame: { ...state.capturedByGame, [gameId]: [] }
        })),
    }),
    { 
      name: 'pokemon-checklist-storage',
      // Isso ajuda o Zustand a se fundir com o que já existe no storage
      skipHydration: false 
    }
  )
)