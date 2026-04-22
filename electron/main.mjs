import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import http from "http";
import crypto from "crypto";

const isDev = !app.isPackaged;
let mainWindow;
let nextServer;

function getUserDataFile(name) {
  return path.join(app.getPath("userData"), name);
}

function ensureSecretFile() {
  const secretPath = getUserDataFile("nextauth-secret.txt");
  if (!fs.existsSync(secretPath)) {
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, crypto.randomBytes(32).toString("hex"), "utf8");
  }
  return fs.readFileSync(secretPath, "utf8").trim();
}

function ensureDatabaseUrl() {
  const dbPath = getUserDataFile("dev.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  return `file:${dbPath.replace(/\\/g, "/")}`;
}

async function startNextServer() {
  const { default: next } = await import("next");

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:./")) {
    process.env.DATABASE_URL = ensureDatabaseUrl();
  }

  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.includes("vervang-dit")) {
    process.env.NEXTAUTH_SECRET = ensureSecretFile();
  }

  if (!process.env.OLLAMA_URL) {
    process.env.OLLAMA_URL = "http://127.0.0.1:11434";
  }

  if (!process.env.OLLAMA_MODEL) {
    process.env.OLLAMA_MODEL = "llama3.1";
  }

  const appDir = app.getAppPath();
  const nextApp = next({
    dev: false,
    dir: appDir,
  });

  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 3000;
  process.env.NEXTAUTH_URL = `http://127.0.0.1:${port}`;

  return { server, port };
}

async function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#140d18",
    title: "Saartje",
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), "public", "intro-assets", "saartje kalebassen.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  await mainWindow.loadURL(url);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function boot() {
  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || "http://127.0.0.1:3000";
    await createWindow(devUrl);
    return;
  }

  const { server, port } = await startNextServer();
  nextServer = server;
  await createWindow(`http://127.0.0.1:${port}`);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(boot).catch((error) => {
    console.error("Failed to start Saartje desktop app:", error);
    app.quit();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      if (nextServer) {
        nextServer.close();
      }
      app.quit();
    }
  });
}
