import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Globe, Moon, Sun, Share2, Check } from 'lucide-react'
import { useSettingsStore } from '../store/useSettingsStore'
import { usePokemonStore } from '../store/usePokemonStore'
import { useTranslation } from '../hooks/useTranslation'
import { BackupManager } from './BackupManager'
import { compressToEncodedURIComponent } from 'lz-string'

export function Header () {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Pegando tudo o que precisamos do Zustand
  const { language, isDarkMode, setLanguage, toggleDarkMode } = useSettingsStore()
  const capturedByGame = usePokemonStore((state) => state.capturedByGame)

  const generateSyncLink = () => {
    if (Object.keys(capturedByGame).length === 0) {
      alert('Capture algum Pokémon antes de sincronizar!')
      return
    }

    try {
      const dataString = JSON.stringify(capturedByGame)
      const compressed = compressToEncodedURIComponent(dataString)
      const syncUrl = `${window.location.origin}${window.location.pathname}?sync=${compressed}`

      navigator.clipboard.writeText(syncUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erro ao gerar link:", error)
    }
  }

  return (
    <header className={`w-full border-b px-6 py-4 relative z-50 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className='max-w-5xl mx-auto flex justify-between items-center'>
        <div onClick={() => navigate('/')} className='cursor-pointer group'>
          <h1 className={`text-2xl font-black tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            POKÉ <span className='text-red-600 group-hover:text-red-500'>CHECK</span>
          </h1>
        </div>

        <div className='relative'>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl border transition-all ${isOpen ? 'border-red-500 text-red-500' : 'text-slate-400 border-transparent hover:border-slate-700'}`}
          >
            <Settings size={20} />
          </button>

          {isOpen && (
            <>
              <div className='fixed inset-0 z-[-1]' onClick={() => setIsOpen(false)} />
              <div className={`absolute right-0 mt-3 w-64 border rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                
                {/* BOTÃO DE IDIOMA - DE VOLTA! */}
                <button
                  onClick={() => {
                    const nextLang = language === 'pt-BR' ? 'en' : language === 'en' ? 'ja' : 'pt-BR'
                    setLanguage(nextLang)
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 group transition-colors"
                >
                  <div className='flex items-center gap-3'>
                    <Globe size={18} className='group-hover:text-red-500' />
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{t('language')}</span>
                  </div>
                  <span className='text-xs font-black text-red-500'>{language.toUpperCase()}</span>
                </button>

                {/* BOTÃO DE MODO NOTURNO - DE VOLTA! */}
                <button
                  onClick={toggleDarkMode}
                  className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 group transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {isDarkMode ? t('theme_dark') : t('theme_light')}
                    </span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative ${isDarkMode ? 'bg-red-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>

                <BackupManager />

                {/* BOTÃO DE SINCRONIZAÇÃO */}
                <button
                  onClick={generateSyncLink}
                  className={`w-full flex items-center justify-between p-3.5 mt-1 rounded-xl transition-all duration-200 group
                    ${isDarkMode ? 'hover:bg-blue-900/20 border border-slate-800 bg-slate-900/50' : 'hover:bg-blue-50 border border-slate-100 bg-white shadow-sm'}
                  `}
                >
                  <div className='flex items-center gap-3'>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 group-hover:bg-blue-900/40' : 'bg-blue-50'}`}>
                      {copied ? <Check size={18} className='text-green-500' /> : <Share2 size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />}
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {copied ? 'Link Copiado!' : t('sync')}
                    </span>
                  </div>
                </button>
                
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}