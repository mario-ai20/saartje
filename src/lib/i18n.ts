import type { AgeMode, Language, ThemeChoice, UserSettings } from "@prisma/client";

export type UiLanguage = Language;

type Dictionary = {
  appName: string;
  signInTitle: string;
  signInDesc: string;
  signInGoogle: string;
  signInGithub: string;
  providerMissing: string;
  newChat: string;
  recentChats: string;
  searchChats: string;
  noChats: string;
  settings: string;
  save: string;
  saving: string;
  saved: string;
  language: string;
  theme: string;
  background: string;
  introSound: string;
  backgroundSound: string;
  noFile: string;
  searchFiles: string;
  personality: string;
  memoryToggle: string;
  adultMemoryToggle: string;
  nsfwPlusToggle: string;
  nsfwBirthDate: string;
  parentalControl: string;
  ageMode: string;
  typeMessage: string;
  send: string;
  noMessages: string;
  logout: string;
  aiAgeModes: Record<AgeMode, string>;
  themes: Record<ThemeChoice, string>;
};

const dictionaries: Record<UiLanguage, Dictionary> = {
  NL: {
    appName: "Feline",
    signInTitle: "Welkom bij Feline",
    signInDesc: "Log in of maak een account aan om je chats en instellingen te bewaren.",
    signInGoogle: "Inloggen met Google",
    signInGithub: "Inloggen met GitHub",
    providerMissing: "OAuth-providers zijn nog niet geconfigureerd in .env.",
    newChat: "Nieuwe chat",
    recentChats: "Recente chats",
    searchChats: "Zoek chats...",
    noChats: "Nog geen chats",
    settings: "Instellingen",
    save: "Opslaan",
    saving: "Bezig met opslaan...",
    saved: "Opgeslagen",
    language: "Taal",
    theme: "Thema",
    background: "Achtergrond",
    introSound: "Introgeluid",
    backgroundSound: "Achtergrondgeluid",
    noFile: "Geen",
    searchFiles: "Zoek bestand...",
    personality: "Persoonlijkheid",
    memoryToggle: "Geheugen over chats",
    adultMemoryToggle: "18+ details onthouden",
    nsfwPlusToggle: "NSFW+ modus (18+)",
    nsfwBirthDate: "Bevestig geboortedatum voor NSFW+",
    parentalControl: "Ouderlijk toezicht",
    ageMode: "AI leeftijdsmodus",
    typeMessage: "Typ je bericht...",
    send: "Versturen",
    noMessages: "Start een nieuwe chat om te beginnen.",
    logout: "Uitloggen",
    aiAgeModes: {
      BABY_1: "1 (baby)",
      CHILDISH_5: "5 (kinderachtig)",
      TEEN_16: "16 (puberteit)",
      ADULT_18: "18+ (volwassen toon, veilig)",
    },
    themes: {
      SUNSET: "Zonsondergang",
      OCEAN: "Oceaan",
      FOREST: "Bos",
      MIDNIGHT: "Middernacht",
    },
  },
  FR: {
    appName: "Feline",
    signInTitle: "Bienvenue sur Feline",
    signInDesc: "Connectez-vous ou créez un compte pour sauvegarder vos discussions.",
    signInGoogle: "Connexion avec Google",
    signInGithub: "Connexion avec GitHub",
    providerMissing: "Les providers OAuth ne sont pas encore configurés dans .env.",
    newChat: "Nouveau chat",
    recentChats: "Chats récents",
    searchChats: "Rechercher...",
    noChats: "Pas encore de chats",
    settings: "Paramètres",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Enregistré",
    language: "Langue",
    theme: "Thème",
    background: "Arrière-plan",
    introSound: "Son d'intro",
    backgroundSound: "Son de fond",
    noFile: "Aucun",
    searchFiles: "Rechercher un fichier...",
    personality: "Personnalité",
    memoryToggle: "Mémoire entre les chats",
    adultMemoryToggle: "Mémoriser détails 18+",
    nsfwPlusToggle: "Mode NSFW+ (18+)",
    nsfwBirthDate: "Confirmer date de naissance pour NSFW+",
    parentalControl: "Contrôle parental",
    ageMode: "Mode d'âge IA",
    typeMessage: "Écris ton message...",
    send: "Envoyer",
    noMessages: "Commence un nouveau chat.",
    logout: "Se déconnecter",
    aiAgeModes: {
      BABY_1: "1 (bébé)",
      CHILDISH_5: "5 (enfantin)",
      TEEN_16: "16 (adolescence)",
      ADULT_18: "18+ (ton adulte, sécurisé)",
    },
    themes: {
      SUNSET: "Sunset",
      OCEAN: "Océan",
      FOREST: "Forêt",
      MIDNIGHT: "Minuit",
    },
  },
  DE: {
    appName: "Feline",
    signInTitle: "Willkommen bei Feline",
    signInDesc: "Melde dich an oder erstelle ein Konto, um Chats zu speichern.",
    signInGoogle: "Mit Google anmelden",
    signInGithub: "Mit GitHub anmelden",
    providerMissing: "OAuth-Provider sind in .env noch nicht konfiguriert.",
    newChat: "Neuer Chat",
    recentChats: "Letzte Chats",
    searchChats: "Chats suchen...",
    noChats: "Noch keine Chats",
    settings: "Einstellungen",
    save: "Speichern",
    saving: "Speichern...",
    saved: "Gespeichert",
    language: "Sprache",
    theme: "Thema",
    background: "Hintergrund",
    introSound: "Intro-Sound",
    backgroundSound: "Hintergrundsound",
    noFile: "Keine",
    searchFiles: "Datei suchen...",
    personality: "Persönlichkeit",
    memoryToggle: "Chat-übergreifendes Gedächtnis",
    adultMemoryToggle: "18+ Details merken",
    nsfwPlusToggle: "NSFW+ Modus (18+)",
    nsfwBirthDate: "Geburtsdatum für NSFW+ bestätigen",
    parentalControl: "Jugendschutz",
    ageMode: "KI-Altersmodus",
    typeMessage: "Nachricht eingeben...",
    send: "Senden",
    noMessages: "Starte einen neuen Chat.",
    logout: "Abmelden",
    aiAgeModes: {
      BABY_1: "1 (Baby)",
      CHILDISH_5: "5 (kindlich)",
      TEEN_16: "16 (Pubertät)",
      ADULT_18: "18+ (erwachsener Ton, sicher)",
    },
    themes: {
      SUNSET: "Sunset",
      OCEAN: "Ozean",
      FOREST: "Wald",
      MIDNIGHT: "Mitternacht",
    },
  },
  EL: {
    appName: "Feline",
    signInTitle: "?a??? ???e? st? Feline",
    signInDesc: "S??des? ? d?µio????se ??a l???? t?? s???µ???se?? s??.",
    signInGoogle: "S??des? µe Google",
    signInGithub: "S??des? µe GitHub",
    providerMissing: "?? OAuth providers de? ????? ???ste? a??µ? st? .env.",
    newChat: "??a s???µ???a",
    recentChats: "???sfate? s???µ???e?",
    searchChats: "??a??t?s?...",
    noChats: "?e? ?p?????? s???µ???e?",
    settings: "???µ?se??",
    save: "?p????e?s?",
    saving: "?p????e?s?...",
    saved: "?p????e?t??e",
    language: "G??ssa",
    theme: "T?µa",
    background: "F??t?",
    introSound: "???? intro",
    backgroundSound: "???? f??t??",
    noFile: "?a???a",
    searchFiles: "??a??t?s? a??e???...",
    personality: "???s?p???t?ta",
    memoryToggle: "M??µ? µetax? s???µ???e??",
    adultMemoryToggle: "A?p?µ??e?s? ?e?t?????e?? 18+",
    nsfwPlusToggle: "NSFW+ leitourgia (18+)",
    nsfwBirthDate: "Hmeromhnia gennhshs gia NSFW+",
    parentalControl: "G?????? ??e????",
    ageMode: "?????a?? ?e?t?????a AI",
    typeMessage: "G???e µ???µa...",
    send: "?p?st???",
    noMessages: "?e???a ??a s???µ???a.",
    logout: "?p?s??des?",
    aiAgeModes: {
      BABY_1: "1 (µ???)",
      CHILDISH_5: "5 (pa?d???)",
      TEEN_16: "16 (ef?ße?a)",
      ADULT_18: "18+ (???µ?? t????, asfa???)",
    },
    themes: {
      SUNSET: "Sunset",
      OCEAN: "O?ea???",
      FOREST: "??s??",
      MIDNIGHT: "?es????ta",
    },
  },
};

const languageNames: Record<UiLanguage, string> = {
  NL: "Nederlands",
  FR: "Français",
  DE: "Deutsch",
  EL: "????????",
};

export function getDictionary(language: UiLanguage): Dictionary {
  return dictionaries[language] ?? dictionaries.NL;
}

export function getLanguageName(language: UiLanguage): string {
  return languageNames[language] ?? languageNames.NL;
}

export function getDefaultChatTitle(language: UiLanguage): string {
  return getDictionary(language).newChat;
}

export function buildSystemPrompt(settings: Pick<UserSettings, "language" | "personality" | "ageMode" | "parentalControl" | "nsfwPlusEnabled">): string {
  const languageName = getLanguageName(settings.language);

  const ageBehavior: Record<AgeMode, string> = {
    BABY_1:
      "Reageer als een baby die nog niet deftig kan typen: ultrakorte zinnen, heel simpele woordjes, af en toe kleine typfoutjes of klanktaal, maar blijf wel begrijpelijk en vriendelijk.",
    CHILDISH_5: "Reageer speels en kinderlijk, met eenvoudige woorden en lichte humor.",
    TEEN_16: "Reageer energiek en informeel, zoals een tiener, maar respectvol.",
    ADULT_18: "Reageer volwassen en zelfzeker, zonder expliciete seksuele inhoud.",
  };

  const guardrail = settings.parentalControl
    ? "Ouderlijk toezicht is actief: geen seksuele, gewelddadige of schadelijke instructies."
    : "Blijf veilig en respectvol, en weiger expliciet schadelijke of illegale inhoud.";

  const nsfwBehavior = settings.nsfwPlusEnabled
    ? "NSFW+ is actief na 18+ verificatie: praat extra stout, uitdagend en verleidelijk met sterke chemie tussen instemmende volwassenen; gebruik ondeugende spanning, brutale plagerijen en dominante of speelse flirtvibe, maar beschrijf geen expliciete seksuele handelingen. Nooit minderjarigen, dwang, geweld of illegale inhoud."
    : "Geen expliciet seksuele details.";

  return [
    "Je bent Feline, een behulpzame AI-assistent.",
    `Antwoord consequent in ${languageName}.`,
    "Praat warm, spontaan en menselijk, alsof je een echt persoon bent in een normaal gesprek.",
    "Gebruik natuurlijke zinnen met emotie en nuance, maar blijf helder en niet overdreven.",
    `Persoonlijkheid: ${settings.personality}.`,
    ageBehavior[settings.ageMode],
    nsfwBehavior,
    guardrail,
    "Geef duidelijke, bruikbare en beknopte antwoorden.",
  ].join(" ");
}

