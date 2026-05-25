// cairn-core: read repository content through the GitHub contents API.
//
// Pass B is read-only — list a collection directory and fetch a file's raw markdown.
// The token is optional: ecnordic's repo is public, so reads work anonymously today.
// Pass C supplies a GitHub App installation token here for private repos and the
// authenticated 5000/hr rate limit, and adds the commit path (git-data API).

export interface RepoRef {
  owner: string;
  repo: string;
  branch: string;
}

/** A markdown file in a collection directory. `id` is the slug (filename without `.md`). */
export interface RepoFile {
  id: string;
  name: string;
  path: string;
}

const API = 'https://api.github.com';

function ghHeaders(accept: string, token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: accept,
    'User-Agent': 'cairn-cms',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Build the contents-API URL for a repo path, pinned to the configured branch. */
export function contentsUrl(repo: RepoRef, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${API}/repos/${repo.owner}/${repo.repo}/contents/${clean}?ref=${encodeURIComponent(repo.branch)}`;
}

interface ContentsEntry {
  name: string;
  path: string;
  type: string;
}

/** Keep only markdown files from a contents-API directory listing, newest id first. */
export function markdownFiles(entries: ContentsEntry[]): RepoFile[] {
  return entries
    .filter((entry) => entry.type === 'file' && entry.name.endsWith('.md'))
    .map((entry) => ({ id: entry.name.replace(/\.md$/, ''), name: entry.name, path: entry.path }))
    .sort((a, b) => b.id.localeCompare(a.id));
}

/** List the markdown files in a collection directory. */
export async function listMarkdown(repo: RepoRef, dir: string, token?: string): Promise<RepoFile[]> {
  const res = await fetch(contentsUrl(repo, dir), { headers: ghHeaders('application/vnd.github+json', token) });
  if (!res.ok) throw new Error(`GitHub list ${dir} failed: ${res.status}`);
  return markdownFiles((await res.json()) as ContentsEntry[]);
}

/** Fetch a file's raw markdown, or null if it does not exist. */
export async function readRaw(repo: RepoRef, path: string, token?: string): Promise<string | null> {
  const res = await fetch(contentsUrl(repo, path), { headers: ghHeaders('application/vnd.github.raw', token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read ${path} failed: ${res.status}`);
  return res.text();
}
