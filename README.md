# Saartje AI

Saartje is een Next.js webapp met lokale login, chatgeschiedenis, instellingen en media-ondersteuning.

## Vereisten

- Node.js 20+
- Een online host voor publicatie, zoals Vercel, Render of een eigen server

## Installatie

```bash
npm install
copy .env.example .env
```

Vul daarna `.env` in met ten minste:

```env
NEXTAUTH_SECRET=een-lange-willekeurige-sleutel
NEXTAUTH_URL=http://localhost:3000
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

Initialiseer de database:

```bash
npm run db:init
npm run prisma:generate
```

Start de webversie:

```bash
npm run dev
```

Open daarna:

```text
http://localhost:3000
```

## Online zetten

Voor een openbare website moet je de app hosten op een platform met een draaiende Node-server en een database.

Makkelijke route:

1. Zet de code op GitHub.
2. Koppel de repo aan je host.
3. Vul je environment variables in.
4. Laat de host de app bouwen en publiceren.

## Media-mappen

Plaats eigen bestanden in:

- `public/backgrounds/`
- `public/intro-music/`
- `public/background-music/`
