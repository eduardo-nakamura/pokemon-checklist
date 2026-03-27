# PokeCheck

**PokeCheck** é um checklist interativo e inteligente projetado para treinadores Pokémon que buscam o 100% de conclusão (Living Dex ou Catch 'em all) nos jogos da franquia. O projeto foca em performance, usabilidade e suporte offline.

**Acesse o App:** [https://eduardo-nakamura.github.io/pokemon-checklist/](https://eduardo-nakamura.github.io/pokemon-checklist/)

---

## 🚀 Funcionalidades Principais

### 🔍 Busca Inteligente e Exata
* **Busca por termo:** Encontre Pokémon por nome ou rota rapidamente.
* **Busca Exata com Aspas:** Use aspas (ex: `"Rota 1"`) para filtrar exatamente uma localidade, ignorando resultados parciais como "Rota 10" ou "Rota 11".
* **Highlight Dinâmico:** O termo buscado é realçado visualmente na tabela em tempo real.

### 💾 Persistência e Portabilidade
* **Offline-First:** Seus dados são salvos automaticamente no `localStorage` através do Zustand.
* **Importar/Exportar Save:** Gere um arquivo `.json` do seu progresso para transferir entre navegadores ou dispositivos (PC para Celular).

### 🌍 Experiência do Usuário (UX)
* **Multi-idioma:** Suporte completo para Português (BR), Inglês e Japonês.
* **Dark Mode Nativo:** Interface adaptável para sessões de jogo noturnas e diurnas com alto contraste.
* **Sincronização PokéAPI:** Dados sempre atualizados consumindo a API oficial.

---

## 🛠️ Tecnologias Utilizadas

* **Vite + React:** Core do projeto para uma interface rápida e reativa.
* **Zustand:** Gerenciamento de estado leve com persistência de dados.
* **TanStack Query (React Query):** Cache inteligente e gerenciamento de requisições HTTP.
* **Tailwind CSS:** Estilização utilitária com suporte a temas.
* **Lucide React:** Conjunto de ícones minimalistas.
* **Vitest:** Testes automatizados para garantir a estabilidade do build.


---

## 📦 Como rodar o projeto localmente
1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/pokemon-checklist.git
```
2. **Instale as dependências:**
```bash
npm install
```
3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```
4. **Para rodar os testes:**
```bash
npm run test
```

---

## 👷 CI/CD e Deploy

O projeto utiliza GitHub Actions para automação. Sempre que um código é enviado para a branch main:
1. Os testes unitários e de fumaça são executados via Vitest.
2. O TypeScript verifica a integridade dos tipos (tsc).
3. O build é gerado automaticamente.
4. O deploy é feito de forma isolada para o GitHub Pages.

---

## Licença
Este projeto está sob a licença MIT. Sinta-se à vontade para usar, modificar e distribuir.

---

Nota: Este projeto é uma ferramenta de fã e não possui afiliação oficial com a Nintendo, Creatures Inc. ou Game Freak.

---

## 🎁 Agradecimentos

* [PokéAPI](https://pokeapi.co/) pela infraestrutura de dados incrível e gratuita.
* Comunidade Pokémon pelas sprites e informações de rotas.