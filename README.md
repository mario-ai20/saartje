# Saartje AI (Ollama 3.1)

Saartje is een Next.js webapp met:
- Lokale login met account aanmaken (naam, achternaam, geboortedatum, username, wachtwoord)
- Chatinterface met linkerkolom (nieuwe chat, recente chats, zoeken)
- Instellingen voor thema, achtergrond, intro sound, background sound
- Ouderlijk toezicht
- AI-persoonlijkheid
- AI leeftijdsmodus (1, 5, 16, 18+ veilige volwassen toon)
- Meertalige UI (Nederlands, Frans, Duits, Grieks)
- Opslag van chats en instellingen in SQLite

## Vereisten

- Node.js 20+
- Ollama lokaal geïnstalleerd en draaiend

## Installatie

1. Dependencies installeren:

```bash
npm install
```

2. `.env` aanmaken:

```bash
copy .env.example .env
```

3. Vul in `.env`:

```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

4. Database initialiseren:

```bash
npm run db:init
```

5. Prisma client genereren:

```bash
npm run prisma:generate
```

6. Start de app:

```bash
npm run dev
```

## Media mappen

Plaats je bestanden in:
- `public/backgrounds/`
- `public/intro-music/`
- `public/background-music/`

Deze bestanden verschijnen automatisch in de instellingen.

## Taal en gedrag

Als je de taal wijzigt in instellingen, verandert de volledige UI-taal mee.
De systeeminstructie voor Saartje volgt ook de gekozen taal.

## Veiligheidsnota

De 18+ modus gebruikt een volwassen toon, maar blijft veilig en niet-expliciet.
Als ouderlijk toezicht actief is, wordt risicovolle inhoud extra beperkt.


OPSTARTEN:
maak een map in 't Saam Diksmuide\Mijn Documenten genaamd Codex daar zet je deze map
DAARNA:
Opstarten doe je met CMD en daar plak je deze command
cd "C:\Users\Yoshi.Bastiaenssens\OneDrive - 't Saam Diksmuide\Mijn Documenten\Codex\saartje"
npm run dev
hierna kan je hem openen in je browser met deze link:
http://localhost:3000