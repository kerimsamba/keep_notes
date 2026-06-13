export interface GitHubConfig {
  /** Fine-grained personal access token with Contents read/write on the notes repo */
  token: string;
  /** Repository in "owner/name" form */
  repo: string;
  /** Branch to store notes on (resolved to the repo default branch when connecting) */
  branch: string;
}

const CONFIG_KEY = 'keep-notes:github-config';

export function loadConfig(): GitHubConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GitHubConfig;
    if (!parsed.token || !parsed.repo) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConfig(config: GitHubConfig): void {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  window.localStorage.removeItem(CONFIG_KEY);
}
