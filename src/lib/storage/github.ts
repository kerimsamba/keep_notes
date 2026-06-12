import { GitHubConfig } from './config';

const API_BASE = 'https://api.github.com';

export class GitHubApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

function apiHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function request(config: GitHubConfig, path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...apiHeaders(config.token), ...init?.headers },
  });
  return res;
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || res.statusText;
  } catch {
    return res.statusText;
  }
}

/** UTF-8 safe base64 encoding (btoa alone breaks on non-Latin1 characters). */
function encodeContent(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

function decodeContent(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface RepoInfo {
  defaultBranch: string;
  isPrivate: boolean;
  fullName: string;
}

export async function getRepoInfo(config: GitHubConfig): Promise<RepoInfo> {
  const res = await request(config, `/repos/${config.repo}`);
  if (!res.ok) {
    throw new GitHubApiError(res.status, await errorMessage(res));
  }
  const body = await res.json();
  return {
    defaultBranch: body.default_branch,
    isPrivate: body.private,
    fullName: body.full_name,
  };
}

export interface RemoteFile {
  text: string;
  sha: string;
}

/** Fetch a file from the repo. Returns null when the file does not exist yet. */
export async function getFile(config: GitHubConfig, path: string): Promise<RemoteFile | null> {
  const ref = config.branch ? `?ref=${encodeURIComponent(config.branch)}` : '';
  const res = await request(config, `/repos/${config.repo}/contents/${path}${ref}`, {
    // Bypass any HTTP cache so we always see the latest sha
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubApiError(res.status, await errorMessage(res));
  }
  const body = await res.json();
  return { text: decodeContent(body.content), sha: body.sha };
}

/**
 * Create or update a file. Pass the current sha when updating an existing file;
 * GitHub responds 409 if the sha is stale (someone else pushed in between).
 */
export async function putFile(
  config: GitHubConfig,
  path: string,
  text: string,
  message: string,
  sha?: string
): Promise<string> {
  const res = await request(config, `/repos/${config.repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: encodeContent(text),
      ...(config.branch ? { branch: config.branch } : {}),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new GitHubApiError(res.status, await errorMessage(res));
  }
  const body = await res.json();
  return body.content.sha;
}
