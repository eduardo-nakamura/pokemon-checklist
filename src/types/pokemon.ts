export interface PokemonBase {
  id: number;
  name: string;
  sprite: string;
  routes: string[];
  captureRate: number;
}

export interface GameConfig {
  id: string;
  name: string;
  pokedexName: string;
  group?: string;
}

export const SUPPORTED_GAMES: GameConfig[] = [
  { id: 'xy-central', name: 'Kalos (Central)', pokedexName: 'kalos-central', group: 'xy' },
  { id: 'xy-coastal', name: 'Kalos (Coastal)', pokedexName: 'kalos-coastal', group: 'xy' },
  { id: 'xy-mountain', name: 'Kalos (Mountain)', pokedexName: 'kalos-mountain', group: 'xy' },
  { id: 'red-blue', name: 'Kanto (Red/Blue)', pokedexName: 'kanto' },
];

export const HOME_GAMES: GameConfig[] = [
  { id: 'xy-central', name: 'Kalos (Central)', pokedexName: 'kalos-central', group: 'xy' },  
  { id: 'red-blue', name: 'Kanto (Red/Blue)', pokedexName: 'kanto' },
];