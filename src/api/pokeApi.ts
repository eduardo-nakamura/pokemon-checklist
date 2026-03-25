import type { PokemonBase } from "../types/pokemon";

interface PokeApiSpecies {
  names: { language: { name: string }; name: string }[];
}

interface PokeApiPokedexEntry {
  pokemon_species: { name: string; url: string };
}

interface PokeApiEncounter {
  location_area: { name: string };
  version_details: { version: { name: string } }[];
}

export const fetchPokemonData = async (
  pokedexName: string, 
  gameId: string, // Alterado de regionFilter para gameId
  lang: 'pt-BR' | 'en' | 'ja' = 'pt-BR'
): Promise<PokemonBase[]> => {
  
  const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexName}`);
  const data = await response.json();

  // Mapeia o gameId para as versões da API (essencial para X/Y)
  const isXY = gameId.toLowerCase().includes('xy') || gameId.toLowerCase().includes('kalos');
  const versionTags = isXY ? ['x', 'y'] : [gameId.split('-')[0]];

  const pokemonPromises = data.pokemon_entries.map(async (entry: PokeApiPokedexEntry) => {
    try {
      const pokemonId = Number(entry.pokemon_species.url.split('/').filter(Boolean).pop());
      
      const [detailRes, encounterRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`)
      ]);

      const detailData = await detailRes.json();
      const encounterData: PokeApiEncounter[] = await encounterRes.json();

      const speciesRes = await fetch(detailData.species.url);
      const speciesData: PokeApiSpecies = await speciesRes.json();
      
      let translatedName = entry.pokemon_species.name;
      if (lang === 'ja') {
        translatedName = speciesData.names.find(n => n.language.name === 'ja-Hrkt')?.name || 
                         speciesData.names.find(n => n.language.name === 'ja')?.name || translatedName;
      }

      // Filtra rotas comparando com as tags de versão (x, y, etc)
      const routes = encounterData
        .filter((enc) => enc.version_details.some((v) => versionTags.includes(v.version.name)))
        .map((enc) => {
          const rawName = enc.location_area.name
            .replace(/-/g, ' ')
            .replace(/area/g, '')
            .replace(/kalos/gi, '')
            .trim();
          
          const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          return lang === 'pt-BR' ? formattedName.replace(/route/i, 'Rota') : formattedName;
        });

      // Remove duplicatas de rotas (áreas diferentes na mesma rota)
      const uniqueRoutes = Array.from(new Set(routes));

      return {
        id: pokemonId,
        name: lang === 'ja' ? translatedName : translatedName.charAt(0).toUpperCase() + translatedName.slice(1),
        sprite: detailData.sprites.front_default || '',
        routes: uniqueRoutes.length > 0 ? uniqueRoutes : ["Especial / Evolução"]
      };
    } catch (error) {
      console.error("Erro ao buscar:", entry.pokemon_species.name, error);
      return null;
    }
  });

  const results = await Promise.all(pokemonPromises);
  return results.filter((p): p is PokemonBase => p !== null);
};