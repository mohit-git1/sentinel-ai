import { useEffect, useState } from 'react';
import { api } from '../utils/api';

/**
 * Modal for connecting a new GitHub repository.
 * User enters the full repo name (owner/repo) and clicks Connect.
 */
function ConnectRepoModal({ onClose, onConnected }) {
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clean up the input in case they pasted a full URL
        let cleanName = fullName.trim();
        if (cleanName.includes('github.com/')) {
            cleanName = cleanName.split('github.com/')[1];
        }

        // Remove trailing slashes or .git extensions
        cleanName = cleanName.replace(/\/$/, '').replace(/\.git$/, '');

        if (!cleanName.includes('/') || cleanName.split('/').length !== 2) {
            setError('Please enter in the format: owner/repo-name (e.g. octocat/hello-world)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const repoName = cleanName.split('/')[1];
            const newRepo = await api('/api/repos/connect', {
                method: 'POST',
                body: JSON.stringify({ repoName, fullName: cleanName }),
            });
            onConnected(newRepo);
        } catch (err) {
            // A 404 from GitHub usually means the repo doesn't exist or they lack admin access
            const errorMsg = err.message.includes('Not Found')
                ? 'Repository not found. Ensure you spelled it correctly and have admin access to it.'
                : err.message || 'Failed to connect repository';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/45" onClick={onClose}></div>

            <div className="panel relative w-full max-w-md rounded-2xl p-6 shadow-lg" role="dialog" aria-modal="true" aria-labelledby="connect-repository-title">
                <h2 id="connect-repository-title" className="mb-1 text-xl font-semibold text-brand-950 dark:text-brand-50">Connect repository</h2>
                <p className="mb-6 text-sm text-brand-600 dark:text-brand-400">
                    Enter the full name of the GitHub repository you want Sentinel to monitor.
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="mb-2 block text-sm font-medium text-brand-700 dark:text-brand-300">
                        Repository (owner/name)
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. octocat/hello-world"
                        autoFocus
                        className="w-full rounded-lg border border-brand-300 bg-white px-4 py-3 text-sm text-brand-900 outline-none transition-colors placeholder:text-brand-500 focus:border-brand-500 dark:border-brand-700 dark:bg-surface-dark dark:text-brand-100 dark:placeholder:text-brand-500 dark:focus:border-brand-300"
                    />

                    {error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !fullName}
                            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {loading ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ConnectRepoModal;
