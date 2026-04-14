import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PokemonBase } from '../types/pokemon'

interface PokemonState {
  // Guarda os IDs capturados separados por jogo/região
  capturedByGame: Record<string, number[]>

  // Agora guardamos o objeto completo para persistir entre trocas de região
  lastCaptured: PokemonBase | null

  // Função atualizada para receber o objeto pokemon inteiro
  togglePokemon: (gameId: string, pokemon: PokemonBase) => void

  importCapturedData: (data: Record<string, number[]>) => void;
}

export const usePokemonStore = create<PokemonState>()(
  persist(
    set => ({
      capturedByGame: {},
      lastCaptured: null,

      importCapturedData: (data: Record<string, number[]>) =>
        set({
          capturedByGame: data
        }),

      togglePokemon: (gameId, pokemon) =>
        set(state => {
          const pokemonId = pokemon.id
          const currentCaptured = state.capturedByGame[gameId] || []
          const isCurrentlyCaptured = currentCaptured.includes(pokemonId)

          // Atualiza a lista de IDs da região específica
          const newCaptured = isCurrentlyCaptured
            ? currentCaptured.filter(id => id !== pokemonId)
            : [...currentCaptured, pokemonId]

          return {
            capturedByGame: {
              ...state.capturedByGame,
              [gameId]: newCaptured
            },
            // Lógica do Card:
            // Se estamos marcando (capturando), salvamos o objeto todo.
            // Se estamos desmarcando, mantemos o que estava (ou você pode por null se preferir).
            lastCaptured: !isCurrentlyCaptured ? pokemon : state.lastCaptured
          }
        })
    }),
    {
      name: 'pokemon-storage' // Nome da chave no LocalStorage
    }
  )
)
