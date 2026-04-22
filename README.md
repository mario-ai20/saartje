# Saartje AI

Saartje is een Next.js app met lokale login, chatgeschiedenis, instellingen, achtergrondmuziek en een desktopbuild voor Windows.

## Vereisten

- Node.js 20+
- Ollama lokaal geïnstalleerd en draaiend

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

## Desktopbuild voor Windows

Saartje kan ook als Windows-app worden verpakt.

Maak eerst het app-icoon:

```bash
npm run make:icon
```

Daarna de desktopbuild:

```bash
npm run desktop:build
```

De installer komt in:

```text
dist-electron/Saartje Setup 0.1.0.exe
```

Dat is het bestand dat je het makkelijkst op itch.io kan uploaden als Windows-download.

## Media-mappen

Plaats eigen bestanden in:

- `public/backgrounds/`
- `public/intro-music/`
- `public/background-music/`

## Belangrijk

- De desktopbuild gebruikt lokaal een database in de gebruikersmap.
- Ollama moet nog steeds lokaal beschikbaar zijn voor AI-antwoorden.
- Wil je later echt een versie zonder lokale installaties, dan moeten we nog een online AI-backend toevoegen.
