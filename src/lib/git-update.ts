import { execFile } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type GitRunOptions = {
  cwd?: string;
};

export type GitUpdateStatus = {
  available: boolean;
  branch: string | null;
  head: string | null;
  remoteHead: string | null;
  behind: number;
  ahead: number;
  dirty: boolean;
  canUpdate: boolean;
  reason: string | null;
};

const protectedPaths = [
  "dev.db",
  "dev.db-wal",
  "dev.db-shm",
  "prisma/dev.db",
  "prisma/dev.db-wal",
  "prisma/dev.db-shm",
  "public/backgrounds",
  "public/inlog-background",
  "public/intro-music",
  "public/background-music",
  "public/intro-assets",
];

async function runGit(args: string[], options: GitRunOptions = {}): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd: options.cwd ?? process.cwd(),
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });

  return String(stdout).trim();
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function createLocalBackup(): Promise<string | null> {
  const backupRoot = path.join(
    process.cwd(),
    ".feline-backups",
    `update-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  );
  const copiedItems: string[] = [];

  for (const relativePath of protectedPaths) {
    const sourcePath = path.join(process.cwd(), relativePath);
    if (!(await pathExists(sourcePath))) {
      continue;
    }

    const targetPath = path.join(backupRoot, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, {
      recursive: true,
      force: true,
      preserveTimestamps: true,
    });
    copiedItems.push(relativePath);
  }

  if (copiedItems.length === 0) {
    return null;
  }

  return backupRoot;
}

function parseBranchStatus(statusOutput: string): { behind: number; ahead: number; dirty: boolean } {
  const firstLine = statusOutput.split("\n", 1)[0] ?? "";
  const branchMatch = firstLine.match(/behind (\d+)/);
  const aheadMatch = firstLine.match(/ahead (\d+)/);
  const dirty = statusOutput.split("\n").slice(1).some((line) => line.trim().length > 0);

  return {
    behind: branchMatch ? Number(branchMatch[1]) : 0,
    ahead: aheadMatch ? Number(aheadMatch[1]) : 0,
    dirty,
  };
}

async function readRepositoryStatus(): Promise<GitUpdateStatus> {
  try {
    const insideWorkTree = await runGit(["rev-parse", "--is-inside-work-tree"]);
    if (insideWorkTree !== "true") {
      return {
        available: false,
        branch: null,
        head: null,
        remoteHead: null,
        behind: 0,
        ahead: 0,
        dirty: false,
        canUpdate: false,
        reason: "Geen Git-repository gevonden.",
      };
    }

    const branch = await runGit(["branch", "--show-current"]);
    const resolvedBranch = branch || "main";
    await runGit(["fetch", "origin", "--prune"]);

    let head: string | null = null;
    let remoteHead: string | null = null;
    let behind = 0;
    let ahead = 0;

    try {
      head = await runGit(["rev-parse", "HEAD"]);
    } catch {
      head = null;
    }

    try {
      remoteHead = await runGit(["rev-parse", `origin/${resolvedBranch}`]);
      const branchStatus = await runGit(["status", "--porcelain=v1", "-b"]);
      const parsed = parseBranchStatus(branchStatus);
      behind = parsed.behind;
      ahead = parsed.ahead;
      const dirty = parsed.dirty;

      return {
        available: true,
        branch: resolvedBranch,
        head,
        remoteHead,
        behind,
        ahead,
        dirty,
        canUpdate: behind > 0 && ahead === 0 && !dirty,
        reason: dirty
          ? "Je werkmap heeft lokale wijzigingen. Commit of stash eerst."
          : ahead > 0
            ? "Je zit lokaal voor op GitHub. Pullen kan nu niet veilig."
          : behind > 0
            ? null
            : "Je zit al op de nieuwste versie.",
      };
    } catch {
      return {
        available: true,
        branch: resolvedBranch,
        head,
        remoteHead: null,
        behind: 0,
        ahead: 0,
        dirty: false,
        canUpdate: false,
        reason: `Remote branch origin/${resolvedBranch} is niet beschikbaar.`,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Git status kon niet worden gelezen.";
    return {
      available: false,
      branch: null,
      head: null,
      remoteHead: null,
      behind: 0,
      ahead: 0,
      dirty: false,
      canUpdate: false,
      reason: message,
    };
  }
}

export async function getGitUpdateStatus(): Promise<GitUpdateStatus> {
  return readRepositoryStatus();
}

export async function pullLatestGitChanges(): Promise<{ status: GitUpdateStatus; output: string }> {
  const status = await readRepositoryStatus();
  if (!status.available) {
    throw new Error(status.reason ?? "Git is niet beschikbaar.");
  }

  if (status.dirty) {
    throw new Error("Je werkmap heeft lokale wijzigingen. Commit of stash eerst.");
  }

  if (status.behind <= 0) {
    return { status, output: "Je zit al op de nieuwste versie." };
  }

  const branch = status.branch ?? "main";
  const backupPath = await createLocalBackup();
  const output = await runGit(["pull", "--ff-only", "origin", branch]);
  const updated = await readRepositoryStatus();

  return {
    status: updated,
    output: `${output || "Update voltooid."}${backupPath ? ` Lokale backup bewaard in ${backupPath}.` : ""}`,
  };
}
