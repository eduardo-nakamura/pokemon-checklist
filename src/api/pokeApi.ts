import type { PokemonBase } from "../types/pokemon";
import { translations } from '../i18n/translations';

interface PokeApiSpecies {
  names: { language: { name: string }; name: string }[];
  capture_rate: number;
}

interface PokeApiPokedexEntry {
  pokemon_species: { name: string; url: string };
}

interface PokeApiEncounter {
  location_area: { name: string };
  version_details: { 
    version: { name: string };
    encounter_details: { method: { name: string } }[];
  }[];
}

export const fetchPokemonData = async (
  pokedexName: string, 
  gameId: string, 
  lang: 'pt-BR' | 'en' | 'ja' = 'pt-BR'
): Promise<PokemonBase[]> => {
  
  const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexName}`);
  const data = await response.json();

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

      // Processamento de Rotas e Métodos de Encontro
      const routes = encounterData
        .filter((enc) => enc.version_details.some((v) => versionTags.includes(v.version.name)))
        .map((enc) => {
          const versionDetail = enc.version_details.find((v) => versionTags.includes(v.version.name));
          
          // 1. Extraímos o método original da API (ex: walk, old-rod)
          const methodFromApi = versionDetail?.encounter_details[0]?.method.name || '';
          
          // 2. Formatamos para bater com as chaves do seu translations.ts (ex: walk, old_rod)
          const methodKey = methodFromApi.replace(/-/g, '_') as keyof typeof translations['en'];
          
          // 3. Buscamos a tradução. Se não existir no dicionário, usamos o nome original.
          const methodLabel = translations[lang][methodKey] || methodFromApi;

          let locationName = enc.location_area.name
            .replace(/-/g, ' ')
            .replace(/area/g, '')
            .replace(/kalos/gi, '')
            .trim();
          
          const routeWord = translations[lang]['route'] || 'Route';
          locationName = locationName.replace(/route/i, routeWord);
          
          const formattedName = locationName.charAt(0).toUpperCase() + locationName.slice(1);
          
          return methodFromApi ? `${formattedName} (${methodLabel})` : formattedName;
        });

      const uniqueRoutes = Array.from(new Set(routes));

      // Busca a tradução de "Especial / Evolução" do seu arquivo
      const specialEvolutionLabel = translations[lang]['special_evolution'] || "Special / Evolution";

      return {
        id: pokemonId,
        name: lang === 'ja' ? translatedName : translatedName.charAt(0).toUpperCase() + translatedName.slice(1),
        sprite: detailData.sprites.front_default || '',
        routes: uniqueRoutes.length > 0 ? uniqueRoutes : [specialEvolutionLabel],
        captureRate: speciesData.capture_rate
      };
    } catch (error) {
      console.error("Erro ao buscar:", entry.pokemon_species.name, error);
      return null;
    }
  });

  const results = await Promise.all(pokemonPromises);
  return results.filter((p): p is PokemonBase => p !== null);
};