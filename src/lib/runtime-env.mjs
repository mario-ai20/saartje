const DEFAULTS = {
  DATABASE_URL: "file:./dev.db",
  NEXTAUTH_SECRET: "feline-development-secret",
  NEXTAUTH_URL: "http://localhost:3000",
  OLLAMA_URL: "http://127.0.0.1:11434",
  OLLAMA_MODEL: "llama3.1",
};

export function applyRuntimeDefaults() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (!process.env[key]?.trim()) {
      process.env[key] = value;
    }
  }
}

applyRuntimeDefaults();
