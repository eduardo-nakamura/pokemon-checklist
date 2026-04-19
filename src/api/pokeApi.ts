import type { PokemonBase } from '../types/pokemon'
import { translations } from '../i18n/translations'

interface PokeApiSpecies {
  id: number
  names: { language: { name: string }; name: string }[]
  capture_rate: number
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[]
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

const fetchWithRetry = async <T>(url: string, retries = 3): Promise<T> => {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Erro HTTP! status: ${res.status}`)
    return (await res.json()) as T
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return fetchWithRetry<T>(url, retries - 1)
    }
    throw err
  }
}

export const fetchPokemonData = async (
  pokedexName: string,
  gameId: string,
  lang: 'pt-BR' | 'en' | 'ja' = 'pt-BR'
): Promise<PokemonBase[]> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexName}`)
  const data = await response.json()

  // Mapeia o idioma para o padrão da PokeAPI (Japonês usa ja-Hrkt)
  const apiLang = lang === 'ja' ? 'ja-Hrkt' : 'en'

  const isXY = gameId.toLowerCase().includes('xy') || gameId.toLowerCase().includes('kalos')
  const isSM = gameId.toLowerCase().includes('sun') || gameId.toLowerCase().includes('moon')

  let versionTags = [gameId.toLowerCase()]
  if (isXY) versionTags = ['x', 'y']
  if (isSM) versionTags = ['sun', 'moon']

  const pokemonPromises = data.pokemon_entries.map(
    async (entry: PokeApiPokedexEntry) => {
      try {
        const speciesData: PokeApiSpecies = await fetchWithRetry(entry.pokemon_species.url)
        const pokemonId = speciesData.id

        // --- ALTERAÇÃO CRÍTICA AQUI: BUSCA DO NOME TRADUZIDO ---
        const nameEntry = speciesData.names.find(n => n.language.name === apiLang)
        const fallbackName = speciesData.names.find(n => n.language.name === 'en')?.name
          console.log('translatedName')
        // Se for japonês, tenta ja-Hrkt. Se for outro, tenta o idioma ou fallback inglês formatado.
        const translatedName = nameEntry?.name || fallbackName || entry.pokemon_species.name
        console.log(translatedName)
        const regionalVariety = speciesData.varieties.find(
          v => isSM && v.pokemon.name.includes('-alola')
        )
        const defaultVariety = speciesData.varieties.find(v => v.is_default)

        const targetPokemonUrl = regionalVariety
          ? regionalVariety.pokemon.url
          : defaultVariety?.pokemon.url || `https://pokeapi.co/api/v2/pokemon/${pokemonId}`

        const [detailData, encounterData] = await Promise.all([
          fetchWithRetry<{ sprites: { front_default: string } }>(targetPokemonUrl),
          fetchWithRetry<PokeApiEncounter[]>(`${targetPokemonUrl}/encounters`)
        ])

        const routes = encounterData
          .filter(enc => enc.version_details.some(v => versionTags.includes(v.version.name)))
          .map(enc => {
            const versionDetail = enc.version_details.find(v => versionTags.includes(v.version.name))
            const methodFromApi = versionDetail?.encounter_details[0]?.method.name || ''
            const methodKey = methodFromApi.replace(/-/g, '_') as keyof typeof translations['en']
            const methodLabel = translations[lang][methodKey] || methodFromApi

            let locationName = enc.location_area.name
              .replace(/-/g, ' ')
              .replace(/area/g, '')
              .replace(/kalos|alola/gi, '')
              .trim()

            const routeWord = translations[lang]['route'] || 'Route'
            locationName = locationName.replace(/route/i, routeWord)
            const formattedName = locationName.charAt(0).toUpperCase() + locationName.slice(1)

            return methodFromApi ? `${formattedName} (${methodLabel})` : formattedName
          })

        const availableVersions = encounterData
          .flatMap(enc => enc.version_details.map(v => v.version.name))
          .filter(name => versionTags.includes(name))

        const uniqueVersions = Array.from(new Set(availableVersions))
        let availabilityLabel = ''
        if (isXY) {
          const hasX = uniqueVersions.includes('x')
          const hasY = uniqueVersions.includes('y')
          if ((hasX && hasY) || (!hasX && !hasY)) availabilityLabel = 'Both'
          else if (hasX) availabilityLabel = 'X'
          else if (hasY) availabilityLabel = 'Y'
        }

        const uniqueRoutes = Array.from(new Set(routes))
        const specialEvolutionLabel = translations[lang]['special_evolution'] || 'Special / Evolution'

        return {
          id: pokemonId,
          // Se for japonês, mantém como está. Se for ocidental, garante a primeira letra maiúscula.
          name: lang === 'ja' 
            ? translatedName 
            : translatedName.charAt(0).toUpperCase() + translatedName.slice(1),
          sprite: detailData.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
          routes: uniqueRoutes.length > 0 ? uniqueRoutes : [specialEvolutionLabel],
          captureRate: speciesData.capture_rate,
          availability: availabilityLabel
        }
      } catch (error) {
        console.error('Erro ao buscar:', entry.pokemon_species.name, error)
        return null
      }
    }
  )

  const results: PokemonBase[] = []
  const batchSize = 20

  for (let i = 0; i < pokemonPromises.length; i += batchSize) {
    const batch = pokemonPromises.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch)
    results.push(...batchResults.filter((p): p is PokemonBase => p !== null))
  }

  return results
}