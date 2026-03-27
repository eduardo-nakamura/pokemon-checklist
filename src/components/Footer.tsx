export function Footer() {
  return (
    <footer className="mt-10 p-6 text-center text-[10px] text-slate-500 border-t border-slate-800">
      <p>
        Dados fornecidos pela <a href="https://pokeapi.co/" target="_blank" className="underline hover:text-blue-500">PokéAPI</a>.
      </p>
      <p className="mt-2">
        Pokémon e os nomes dos personagens são marcas registradas da Nintendo, Creatures Inc. e Game Freak. 
        Este é um projeto de fã sem fins lucrativos.
      </p>
    </footer>
  );
}