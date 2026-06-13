# Keep Notes — your notes, in a GitHub repo you own

A Google Keep style note-taking PWA with **GitHub as the storage backend**. No Firebase, no
database, no accounts: your notes live as a single, human-readable `notes.json` file in a private
GitHub repository you control. Every save is a commit, so you get full version history, and your
data is never locked in — it's always a `git clone` (or a browser tab) away.

Built with Next.js 14, TypeScript, and Tailwind CSS.

## How it works

- The app runs entirely in your browser. There is no server-side component touching your data.
- On first launch you connect it to a GitHub repo using a **fine-grained personal access token**
  scoped to just that one repo.
- Notes are kept in `localStorage` for instant, offline-capable editing, and synced (debounced)
  to `notes.json` in your repo via the GitHub Contents API.
- Sync is two-way with per-note last-write-wins merging and tombstones for deletions, so you can
  use it from multiple devices.
- The token is stored only in your browser's `localStorage` and is only ever sent to
  `api.github.com`.

## Features

- Text notes and interactive checklists
- Pin, archive, trash (7-day retention), restore, delete forever
- 12 note colors, custom labels with colors, label filtering
- Search across titles and content
- Grid / list layouts, responsive design
- PWA: installable, works offline (changes sync when you're back online)
- Sync status indicator + manual "sync now"

## Setup

### 1. Create a notes repo

Create a **private** repository on [github.com/new](https://github.com/new) (e.g. `my-notes`).
Check "Add a README" so the repo isn't empty.

### 2. Create a fine-grained personal access token

1. Go to [Settings → Developer settings → Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
2. **Repository access**: "Only select repositories" → pick your notes repo
3. **Permissions → Repository permissions → Contents**: Read and write
4. Set an expiration you're comfortable with and generate the token

### 3. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste your token and `owner/repo`, and
you're in. (Or use a deployed instance — see below.)

### 4. Deploy (optional, recommended)

Since the app is a pure client-side Next.js app, it deploys anywhere — Vercel is the easiest:

```bash
npx vercel
```

Then open the URL on your phone and "Add to Home Screen" to install it as an app.

## Accessing your notes outside the app

That's the whole point. Your notes are in `notes.json` in your repo:

- Browse/edit the file directly on github.com
- `git clone` your notes repo
- Full edit history in the commit log
- `curl -H "Authorization: Bearer <token>" https://api.github.com/repos/<owner>/<repo>/contents/notes.json`

## Data format

```jsonc
{
  "version": 1,
  "savedAt": "2026-06-12T20:00:00.000Z",
  "notes": [
    {
      "id": "…",
      "title": "Groceries",
      "content": "",
      "type": "checklist",            // 'text' | 'checklist'
      "color": "yellow",
      "labels": ["<labelId>"],
      "isPinned": false,
      "isArchived": false,
      "isDeleted": false,
      "checklistItems": [{ "id": "…", "text": "Milk", "checked": false, "order": 0 }],
      "createdAt": "…",                // ISO 8601
      "updatedAt": "…"
    }
  ],
  "labels": [{ "id": "…", "name": "errands", "color": "#22c55e", "createdAt": "…", "updatedAt": "…" }],
  "tombstones": {}                     // permanently-deleted ids, so deletes sync across devices
}
```

## Project structure

```
src/
├── app/                       # Next.js App Router (layout, page)
├── components/
│   ├── auth/SetupPage.tsx     # GitHub connection screen
│   ├── SyncStatus.tsx         # Sync state badge
│   ├── layout/                # Sidebar, SearchBar
│   ├── notes/                 # NoteCard, NoteEditor, NotesGrid, QuickNoteInput
│   └── labels/LabelManager.tsx
├── contexts/StorageContext.tsx# Connection + sync state for the UI
└── lib/
    ├── storage/
    │   ├── config.ts          # Token/repo config (localStorage)
    │   ├── github.ts          # GitHub Contents API client
    │   └── store.ts           # Local-first store + two-way sync engine
    └── services/              # noteService / labelService used by components
```

## Testing

```bash
npx playwright install   # once
npm test
```

## Notes & limitations

- Designed for a single user (you) across multiple devices. Concurrent edits merge per-note,
  newest wins.
- Attachments/images aren't implemented yet; the GitHub backend could store them as repo files
  in a future iteration.
- GitHub's Contents API caps files at ~1 MB reads via this method — that's a *lot* of text notes,
  but not unlimited.

## License

This project is for educational purposes.
