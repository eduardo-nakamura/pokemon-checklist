import { HashRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { useEffect } from 'react' // Não esqueça de importar o useEffect
import { GameChecklist } from './pages/GameChecklist'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { useSettingsStore } from './store/useSettingsStore'
import { decompressFromEncodedURIComponent } from 'lz-string'
import { usePokemonStore } from './store/usePokemonStore'

export default function App () {
  const { isDarkMode } = useSettingsStore()
  const importCapturedData = usePokemonStore(state => state.importCapturedData)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const syncData = params.get('sync')

    if (syncData) {
      try {
        // 1. Descomprime a string
        const decompressed = decompressFromEncodedURIComponent(syncData)

        // 2. Transforma o JSON de volta em objeto
        const importedData = JSON.parse(decompressed) as Record<string, number[]>

        if (Object.keys(importedData).length > 0) {
          // 3. Salva no Zustand
          importCapturedData(importedData)

          // 4. Limpa a URL e avisa o usuário
          window.history.replaceState({}, document.title, window.location.pathname)
          alert('Progresso de todos os jogos sincronizado!')
        }
      } catch (e) {
        console.error('Erro ao sincronizar dados da URL', e)
      }
    }
  }, [importCapturedData])
  return (
    <HashRouter>
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <Header />
        <main className='grow'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/game/:gameId' element={<GameChecklist />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  )
}
