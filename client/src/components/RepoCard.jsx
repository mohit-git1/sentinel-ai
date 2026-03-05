import { Link } from 'react-router-dom';

/**
 * Card component for a connected repository.
 * Shows repo name, active status, and disconnect option.
 */
function RepoCard({ repo, onDisconnect }) {
    return (
        <div className="bg-surface-light/50 border border-slate-700/50 rounded-xl p-5 hover:border-brand-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${repo.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {repo.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <button
                    onClick={() => onDisconnect(repo._id)}
                    className="text-slate-500 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
                >
                    Disconnect
                </button>
            </div>

            <Link to={`/repo/${repo._id}`} className="block">
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
                    {repo.repoName}
                </h3>
                <p className="text-slate-400 text-sm font-mono">{repo.fullName}</p>
            </Link>

            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                    Connected {new Date(repo.createdAt).toLocaleDateString()}
                </span>
                <Link
                    to={`/repo/${repo._id}`}
                    className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
                >
                    View PRs →
                </Link>
            </div>
        </div>
    );
}

export default RepoCard;
