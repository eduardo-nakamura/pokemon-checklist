import type { PokemonBase } from "../types/pokemon";

interface PokeApiPokedexEntry {
  pokemon_species: {
    name: string;
    url: string;
  };
}

interface PokeApiEncounter {
  location_area: {
    name: string;
  };
  version_details: {
    version: {
      name: string;
    };
  }[];
}

interface PokeApiSpecies {
  names: {
    language: { name: string };
    name: string;
  }[];
  evolution_chain: { url: string };
}

export const fetchPokemonData = async (
  pokedexName: string, 
  regionFilter: string,
  lang: 'pt-BR' | 'en' = 'pt-BR'
): Promise<PokemonBase[]> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexName}`);
  const data = await response.json();

  const pokemonPromises = data.pokemon_entries.map(async (entry: PokeApiPokedexEntry) => {
    try {
      const pokemonId = entry.pokemon_species.url.split('/').filter(Boolean).pop();
      const detailRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      const detailData = await detailRes.json();

      const speciesRes = await fetch(detailData.species.url);
      const speciesData: PokeApiSpecies = await speciesRes.json();
      
      const translatedName = speciesData.names.find(n => 
        n.language.name === (lang === 'pt-BR' ? 'es' : 'en')
      )?.name || entry.pokemon_species.name;

      const encounterRes = await fetch(detailData.location_area_encounters);
      const encounterData: PokeApiEncounter[] = await encounterRes.json();

      const routes = encounterData
        .filter(enc => enc.version_details.some(v => v.version.name.includes(regionFilter)))
        .map(enc => {
          let route = enc.location_area.name.replace(/-/g, ' ').replace(/area/g, '').trim();
          if (lang === 'pt-BR') {
            route = route
              .replace(/route/i, 'Rota')
              .replace(/city/i, 'Cidade')
              .replace(/woods/i, 'Bosque')
              .replace(/forest/i, 'Floresta')
              .replace(/cave/i, 'Caverna');
          }
          return route;
        });

      return {
        id: detailData.id,
        name: translatedName.charAt(0).toUpperCase() + translatedName.slice(1),
        sprite: detailData.sprites.front_default || '',
        routes: routes.length > 0 ? routes : ["special_evolution"]
      };
    } catch (error) {
      console.error("Erro ao processar Pokémon:", error);
      return null;
    }
  });

  const results = await Promise.all(pokemonPromises);
  return results.filter((p): p is PokemonBase => p !== null);
};