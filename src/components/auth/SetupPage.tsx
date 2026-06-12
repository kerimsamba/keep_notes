'use client';

import React, { useState } from 'react';
import { Lightbulb, Github, KeyRound, GitBranch, Loader2 } from 'lucide-react';
import { useStorage } from '@/contexts/StorageContext';

export default function SetupPage() {
  const { connect } = useStorage();
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConnecting(true);
    try {
      await connect({ token, repo, branch });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to GitHub.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
            <Lightbulb className="text-yellow-500 w-10 h-10" />
            Keep Notes
          </h1>
          <p className="text-gray-600">
            Your notes, stored as a plain JSON file in a GitHub repo you own.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Github className="w-5 h-5" />
            Connect a GitHub repository
          </h2>

          <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1 mb-5">
            <li>
              Create a <strong>private repository</strong> for your notes (e.g.{' '}
              <code className="bg-gray-100 px-1 rounded">my-notes</code>) on{' '}
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                github.com/new
              </a>{' '}
              — check &quot;Add a README&quot; so the repo isn&apos;t empty.
            </li>
            <li>
              Create a{' '}
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                fine-grained personal access token
              </a>
              : under &quot;Repository access&quot; select <em>Only select repositories</em> and
              pick your notes repo, then under &quot;Permissions → Repository permissions&quot; set{' '}
              <strong>Contents</strong> to <strong>Read and write</strong>.
            </li>
            <li>Paste the token and repository below.</li>
          </ol>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal access token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="github_pat_..."
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repository</label>
              <div className="relative">
                <Github className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="your-username/my-notes"
                  required
                  pattern="[^/\s]+/[^/\s]+"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-gray-400 font-normal">(optional, default branch if blank)</span>
              </label>
              <div className="relative">
                <GitBranch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-semibold rounded-lg transition"
            >
              {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
              {connecting ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Your token is stored only in this browser and is sent only to api.github.com. Notes are
          saved to <code className="bg-gray-100 px-1 rounded">notes.json</code> in your repo — every
          change is a commit, so you get full history and your data is always a `git clone` away.
        </p>
      </div>
    </div>
  );
}
