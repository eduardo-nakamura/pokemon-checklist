import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { GameChecklist } from './pages/GameChecklist';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useSettingsStore } from './store/useSettingsStore';

export default function App() {
  const { isDarkMode } = useSettingsStore();

  return (
    <HashRouter>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <Header />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:gameId" element={<GameChecklist />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}