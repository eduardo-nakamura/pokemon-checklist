import { FileUp, FileDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useSettingsStore } from '../store/useSettingsStore'; // Importando o store

export function BackupManager() {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore(); // Lendo o estado do tema

  const handleExport = () => {
    const data = localStorage.getItem('pokemon-storage');
    if (!data) return alert(t('no_data_export'));

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pokecheck-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.state) throw new Error();

        localStorage.setItem('pokemon-storage', JSON.stringify(json));
        alert(t('import_success'));
        window.location.reload();
      } catch {
        alert(t('import_error'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`mt-6 p-4 rounded-2xl border transition-colors ${
      isDarkMode 
        ? 'bg-slate-800/50 border-slate-700' 
        : 'bg-slate-100 border-slate-200'
    }`}>
      <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${
        isDarkMode ? 'text-slate-500' : 'text-slate-400'
      }`}>
        {t('backup_title')}
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        {/* Botão de Exportar - Azul padrão em ambos, mas hover ajustado */}
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all active:scale-95 shadow-sm"
        >
           <FileDown size={20} /> {t('export_save')}
        </button>

        {/* Botão de Importar - Cores variam conforme o tema */}
        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
          isDarkMode 
            ? 'bg-slate-700 hover:bg-slate-600 text-white' 
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
        }`}>
           <FileUp size={20} /> {t('import_save')}
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>
    </div>
  );
}