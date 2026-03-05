import { useState } from 'react';
import { api } from '../utils/api';

/**
 * Modal for connecting a new GitHub repository.
 * User enters the full repo name (owner/repo) and clicks Connect.
 */
function ConnectRepoModal({ onClose, onConnected }) {
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fullName.includes('/')) {
            setError('Please enter in the format: owner/repo-name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const repoName = fullName.split('/')[1];
            const newRepo = await api('/api/repos/connect', {
                method: 'POST',
                body: JSON.stringify({ repoName, fullName }),
            });
            onConnected(newRepo);
        } catch (err) {
            setError(err.message || 'Failed to connect repository');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-surface-light border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-1">Connect Repository</h2>
                <p className="text-slate-400 text-sm mb-6">
                    Enter the full name of the GitHub repository you want Sentinel to monitor.
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Repository (owner/name)
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. octocat/hello-world"
                        className="w-full bg-surface border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />

                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !fullName}
                            className="flex-1 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
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
