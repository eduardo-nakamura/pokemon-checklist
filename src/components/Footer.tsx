export function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm font-medium">
          © {new Date().getFullYear()} PokéCheck - Checklist de Captura
        </p>
        <div className="flex gap-6 text-xs font-black text-slate-600 uppercase tracking-widest">
          <span className="hover:text-red-600 cursor-pointer transition-colors">Github</span>
          <span className="hover:text-red-600 cursor-pointer transition-colors">PokeAPI</span>
        </div>
      </div>
    </footer>
  );
}