/**
 * Pull request card — used in the repo detail page sidebar.
 * Shows PR number, title, author, and status badge.
 */
function PRCard({ pr, isSelected, onClick }) {
    const statusColors = {
        open: 'bg-emerald-500/20 text-emerald-400',
        reviewed: 'bg-brand-500/20 text-brand-400',
        closed: 'bg-slate-500/20 text-slate-400',
        merged: 'bg-purple-500/20 text-purple-400',
    };

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${isSelected
                    ? 'bg-brand-600/10 border-brand-500/50 shadow-lg shadow-brand-500/5'
                    : 'bg-surface-light/30 border-slate-700/50 hover:border-slate-600'
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-brand-400">#{pr.prNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[pr.status] || statusColors.open}`}>
                    {pr.status}
                </span>
            </div>
            <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">{pr.title}</h4>
            <p className="text-slate-500 text-xs">by {pr.author}</p>
        </button>
    );
}

export default PRCard;
