# Character Persona Generator

Generate richly detailed fictional personas – complete with backstory, personality traits, dialogue style and sample dialogue – in just a few clicks.

![Screenshot](public/screenshot.png)

## ✨ Features

- **Interactive form** for entering character basics (name, age, occupation, goals, flaws, setting, MBTI type)
- One-click **AI generation** powered by [OpenRouter](https://openrouter.ai/) (DeepSeek v3) – no model hosting required
- Beautiful, accessible UI built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS** and **shadcn/ui** (Radix primitives)
- Responsive design & dark-mode support

## 🏗️ Tech Stack

| Layer            | Tech                                                      |
|------------------|-----------------------------------------------------------|
| Framework        | Next.js 15 (App Router)                                   |
| Language         | TypeScript & React 19                                     |
| Styling          | Tailwind CSS, tailwindcss-animate                         |
| UI Components    | shadcn/ui, Radix UI, Lucide icons                         |
| AI Integration   | OpenRouter API (deepseek/deepseek-v3-base:free)           |

## 🚀 Quick Start

1. **Clone & install**
   ```bash
   git clone https://github.com/your-username/character-persona-generator.git
   cd character-persona-generator
   pnpm install        # or npm install / yarn
   ```
2. **Configure environment variables**
   ```bash
   # .env.local
   OPENROUTER_API_KEY=sk-your-openrouter-key
   ```
3. **Run the dev server**
   ```bash
   pnpm dev
   # open http://localhost:3000
   ```

## 🛠️ Available Scripts

| Command       | Description                         |
|---------------|-------------------------------------|
| `pnpm dev`    | Start development server at port 3000|
| `pnpm build`  | Generate an optimized production build |
| `pnpm start`  | Run the production build locally     |
| `pnpm lint`   | Lint with ESLint                     |

## 📂 Project Structure

```
.
├─ app/               # App Router routes & layouts
│  ├─ page.tsx        # Main page with the character form
│  ├─ layout.tsx      # Root layout & ThemeProvider
│  └─ api/
│     └─ generate/    # Edge-compatible API route → OpenRouter
│        └─ route.ts
├─ components/        # Reusable UI/shadcn components
├─ styles/            # Tailwind & global CSS files
├─ public/            # Static assets (add a screenshot here!)
├─ tailwind.config.ts # Tailwind configuration
└─ tsconfig.json      # TypeScript configuration
```

## 🔑 Environment Variables

| Name                  | Purpose                                    |
|-----------------------|--------------------------------------------|
| `OPENROUTER_API_KEY`  | Secret token used to call OpenRouter API   |

> **Security tip:** Never commit real keys – use `.gitignore` or secret management on your hosting platform.

## 🤖 How It Works

1. Client submits character details to `POST /api/generate`.
2. The API route constructs a prompt and calls OpenRouter chat completions.
3. Returned text is parsed (regex + fallbacks) into four distinct sections.
4. The UI renders each section inside collapsible cards for an elegant reading experience.

## 🏗️ Deployment

This repo works out-of-the-box on **Vercel**:

```bash
vercel --prod
```

Any platform that supports Next.js (Netlify, Render, Docker, traditional VPS) will also work – just remember to set `OPENROUTER_API_KEY` in your environment.

## 📜 License

[MIT](LICENSE)

## 🙏 Acknowledgements

- [OpenRouter](https://openrouter.ai/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

Happy writing! 🎉