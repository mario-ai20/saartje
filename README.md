# Feline AI

Feline is a Next.js web app with local accounts, separate chats, per-account settings, backgrounds, sounds and NSFW+ separation.
Discord name: `Felinefoil`

## What Feline needs

For local use on your own PC:

- Node.js 20 or newer
- Ollama running locally on `http://127.0.0.1:11434`
- A modern browser
- Git LFS (`git lfs install`) so the media files download correctly
- Camera access if you want to use NSFW+ age verification
- Microphone access if you want to use intro or sound features in the browser

For a public online deployment for other people:

- A public host that supports Node or Docker
- Persistent storage for the database
- An AI backend that is reachable from the server
- `NEXTAUTH_URL` set to the public URL
- HTTPS recommended for logins and browser permissions

Important:
- The app is local-first by default.
- `127.0.0.1` only works on your own machine.
- If other people should use Feline from a website, you must host the app and AI backend online.

## Quick start

```bash
git lfs install
npm install
copy .env.example .env
```

If you clone this repo on a new machine, run `git lfs install` once before pulling so the MP3 and MP4 files download properly.

Fill in `.env` with at least:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="llama3.1"
```

Initialize the database:

```bash
npm run db:init
npm run prisma:generate
```

Start the app:

```bash
npm run dev
```

Or double click `start-feline.bat` in the project folder. It starts the server and opens the browser automatically.

Then open:

```text
http://localhost:3000
```

## What users can do

- Create a local account with name, last name, birth date, username and password
- Keep chats and settings per account
- Use separate normal and NSFW+ chat spaces
- Choose backgrounds, login backgrounds, intro sounds and background sounds per account
- Use folder-based media categories in `public/backgrounds/`
- Save memory and adult-memory settings per account

## Media folders

Put your own files in these folders:

- `public/backgrounds/` for normal backgrounds
- `public/backgrounds/nsfw/` for NSFW-only backgrounds
- `public/inlog-background/` for login backgrounds
- `public/intro-music/` for intro sounds
- `public/background-music/` for background sounds
- `public/intro-assets/` for the fixed Feline logo and intro art

The larger MP3 and MP4 files are stored with Git LFS so the repository stays easier to share and clone.

Background folders are grouped by folder name. For example, everything inside `public/backgrounds/Intens/` appears together as the `Intens` category.

Login backgrounds can be images or videos:

- `.mp4`
- `.webm`
- `.ogg`
- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

## Settings behavior

- Settings are saved per account.
- Press `Opslaan` to keep changes.
- Backgrounds and sounds stay tied to your account until you change them again.
- New media files are picked up when you reopen settings or refresh the media list.
- The app logo/tab icon is fixed to Feline.
- There is no separate profile-icon picker in settings anymore.

## Public deployment with Docker

If you want Feline online for other people, use Docker plus a persistent volume.

1. Put the code on GitHub.
2. Deploy the repo to a Docker-capable host.
3. Mount persistent storage for SQLite at `/data`.
4. Point `DATABASE_URL` at the volume, for example:

```env
DATABASE_URL="file:/data/dev.db"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="https://your-public-url.example"
OLLAMA_URL="https://your-hosted-ai.example"
OLLAMA_MODEL="llama3.1"
```

5. Start the container.

Local Docker test:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

## Useful scripts

```bash
npm run lint
npm run build
npm run prisma:generate
npm run prisma:studio
npm run db:init
```

## Notes

- Chats are separated into normal and NSFW+ spaces.
- NSFW+ needs age verification.
- The app uses Ollama for local AI responses.
- Database and settings are stored with Prisma and SQLite by default.
