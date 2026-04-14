import type { PokemonBase } from '../types/pokemon'
import { translations } from '../i18n/translations'

interface PokeApiSpecies {
  names: { language: { name: string }; name: string }[]
  capture_rate: number
}

interface PokeApiPokedexEntry {
  pokemon_species: { name: string; url: string }
}

interface PokeApiEncounter {
  location_area: { name: string }
  version_details: {
    version: { name: string }
    encounter_details: { method: { name: string } }[]
  }[]
}

export const fetchPokemonData = async (
  pokedexName: string,
  gameId: string,
  lang: 'pt-BR' | 'en' | 'ja' = 'pt-BR'
): Promise<PokemonBase[]> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokedex/${pokedexName}`
  )
  const data = await response.json()

  const isXY = gameId.toLowerCase().includes('xy') || gameId.toLowerCase().includes('kalos')
  const isSM = gameId.toLowerCase().includes('sun') || gameId.toLowerCase().includes('moon')

  let versionTags = [gameId.toLowerCase()]
  if (isXY) versionTags = ['x', 'y']
  if (isSM) versionTags = ['sun', 'moon'] // Mapeia corretamente para as versões de Alola

  const pokemonPromises = data.pokemon_entries.map(
    async (entry: PokeApiPokedexEntry) => {
      try {
        const pokemonId = Number(
          entry.pokemon_species.url.split('/').filter(Boolean).pop()
        )

        const [detailRes, encounterRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`)
        ])

        const detailData = await detailRes.json()
        const encounterData: PokeApiEncounter[] = await encounterRes.json()

        const speciesRes = await fetch(detailData.species.url)
        const speciesData: PokeApiSpecies = await speciesRes.json()

        let translatedName = entry.pokemon_species.name
        if (lang === 'ja') {
          translatedName =
            speciesData.names.find(n => n.language.name === 'ja-Hrkt')?.name ||
            speciesData.names.find(n => n.language.name === 'ja')?.name ||
            translatedName
        }

        const routes = encounterData
          .filter(enc =>
            enc.version_details.some(v => versionTags.includes(v.version.name))
          )
          .map(enc => {
            const versionDetail = enc.version_details.find(v =>
              versionTags.includes(v.version.name)
            )

            const methodFromApi = versionDetail?.encounter_details[0]?.method.name || ''
            const methodKey = methodFromApi.replace(/-/g, '_') as keyof typeof translations['en']
            const methodLabel = translations[lang][methodKey] || methodFromApi

            let locationName = enc.location_area.name
              .replace(/-/g, ' ')
              .replace(/area/g, '')
              .replace(/kalos|alola/gi, '') // Limpa termos regionais repetitivos
              .trim()

            const routeWord = translations[lang]['route'] || 'Route'
            locationName = locationName.replace(/route/i, routeWord)

            const formattedName = locationName.charAt(0).toUpperCase() + locationName.slice(1)

            return methodFromApi
              ? `${formattedName} (${methodLabel})`
              : formattedName
          })

        const uniqueRoutes = Array.from(new Set(routes))
        const specialEvolutionLabel = translations[lang]['special_evolution'] || 'Special / Evolution'

        return {
          id: pokemonId,
          name: lang === 'ja'
              ? translatedName
              : translatedName.charAt(0).toUpperCase() + translatedName.slice(1),
          // Fallback de sprite para maior velocidade no Android
          sprite: detailData.sprites.front_default || 
                  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
          routes: uniqueRoutes.length > 0 ? uniqueRoutes : [specialEvolutionLabel],
          captureRate: speciesData.capture_rate
        }
      } catch (error) {
        console.error('Erro ao buscar:', entry.pokemon_species.name, error)
        return null
      }
    }
  )

  const results = await Promise.all(pokemonPromises)
  return results.filter((p): p is PokemonBase => p !== null)
}