# Feline

Feline is een lokale Next.js-app met accounts, aparte chats, instellingen per gebruiker, achtergronden, geluiden en NSFW+-scheiding.

Discordnaam: `Felinefoil`

## Wat heb je nodig

Voor gebruik op je eigen pc:

- [Git](https://git-scm.com/) om de repository te klonen
- [Git LFS](https://git-lfs.com/) zodat de mediabestanden juist worden opgehaald
- [Node.js 20 of nieuwer](https://nodejs.org/)
- [Ollama](https://ollama.com/) die lokaal draait op `http://127.0.0.1:11434`
- Een recente browser
- Camera-toegang als je NSFW+-leeftijdsverificatie gebruikt
- Microfoon-toegang als je intro- of achtergrondgeluiden in de browser wil gebruiken

Feline is standaard alleen voor lokaal gebruik.

- `127.0.0.1` werkt enkel op jouw eigen computer
- Iedereen die Feline gebruikt, heeft dus zijn eigen lokale setup nodig
- Er is geen Docker nodig

## Installeren

Kloon eerst de repository en installeer Git LFS één keer:

```bash
git clone https://github.com/mario-ai20/Feline.git
cd Feline
git lfs install
npm install
copy .env.example .env
```

Als je de repo op een nieuwe computer zet, voer `git lfs install` dan zeker opnieuw uit voordat je de bestanden ophaalt.

Na `npm install` wordt Prisma automatisch gegenereerd en de SQLite-database wordt bij het eerste gebruik ook automatisch aangemaakt als die nog ontbreekt. Je hoeft dus normaal geen extra database-stap meer te doen om een account te kunnen maken.

## Instellingen in `.env`

Vul minstens deze waarden in:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
BUILDER_CODE="your-private-builder-code"
BUILDER_USERNAME="your-builder-username"
BUILDER_PASSWORD="your-builder-password"
BUILDER_NAME="Feline Builder"
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="llama3.1"
```

De builder-flow werkt in 2 stappen:
1. Klik op `Builder code` en vul de geheime code in.
2. Vul daarna je builder-username en wachtwoord in om volledig toegang te krijgen.

## Database klaarzetten

```bash
npm run db:init
npm run prisma:generate
```

Dit blijft beschikbaar als je de database handmatig wil herstellen, maar voor een nieuwe installatie is het meestal niet meer nodig.

## Opstarten

```bash
npm run dev
```

Of dubbelklik op `start-feline.bat` in de projectmap. Dat start de server en opent de browser automatisch.

Open daarna:

```text
http://localhost:3000
```

## Wat je kan doen

- Een lokaal account maken met naam, achternaam, geboortedatum, username en wachtwoord
- Chats en instellingen per account bewaren
- Normale chats en NSFW+-chats apart gebruiken
- Achtergronden, inlog-achtergronden, intro-geluiden en achtergrondgeluiden per account kiezen
- Media automatisch indelen per map in `public/backgrounds/`
- Geheugen- en volwassen-geheugeninstellingen per account opslaan

## Mediavamappen

Zet je eigen bestanden in deze mappen:

- `public/backgrounds/` voor normale achtergronden
- `public/backgrounds/nsfw/` voor NSFW-achtergronden
- `public/inlog-background/` voor inlog-achtergronden
- `public/intro-music/` voor intro-geluiden
- `public/background-music/` voor achtergrondgeluiden
- `public/intro-assets/` voor het vaste Feline-logo en intro-afbeeldingen

De grotere MP3- en MP4-bestanden staan met Git LFS in de repository, zodat alles vlotter te klonen blijft.

Mappen onder `public/backgrounds/` worden automatisch gegroepeerd per mapnaam. Alles in `public/backgrounds/Intens/` verschijnt dus samen als categorie `Intens`.

Inlog-achtergronden mogen deze bestanden zijn:

- `.mp4`
- `.webm`
- `.ogg`
- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

## Gedrag van de instellingen

- Instellingen worden per account opgeslagen.
- Druk op `Opslaan` om wijzigingen echt te bewaren.
- Achtergronden en geluiden blijven gekoppeld aan je account tot je ze zelf verandert.
- Nieuwe mediabestanden verschijnen zodra je de instellingen opnieuw opent of de mediastlijst vernieuwt.
- Het app-logo en tab-icoon staan vast op Feline.

## Handige scripts

```bash
npm run lint
npm run build
npm run prisma:generate
npm run prisma:studio
npm run db:init
```

## Opmerking

- Chats zijn opgesplitst in normale en NSFW+-ruimtes.
- NSFW+ heeft leeftijdsverificatie nodig.
- Feline gebruikt Ollama voor lokale AI-antwoorden.
- De database en instellingen worden standaard opgeslagen met Prisma en SQLite.