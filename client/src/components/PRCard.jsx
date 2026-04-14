/**
 * Pull request card — used in the repo detail page sidebar.
 * Shows PR number, title, author, and status badge.
 */
function PRCard({ pr, isSelected, onClick }) {
    const statusColors = {
        open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
        reviewed: 'bg-brand-200 text-brand-800 dark:bg-brand-800 dark:text-brand-200',
        closed: 'bg-brand-200 text-brand-700 dark:bg-brand-900 dark:text-brand-300',
        merged: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    };

    return (
        <button
            onClick={onClick}
            className={`w-full rounded-xl border p-4 text-left transition-colors duration-200 ${isSelected
                    ? 'border-brand-500 bg-brand-100 dark:border-brand-500 dark:bg-brand-900/60'
                    : 'border-brand-200 bg-white hover:border-brand-400 dark:border-brand-800 dark:bg-surface-darkMuted dark:hover:border-brand-600'
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-brand-600 dark:text-brand-300">#{pr.prNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[pr.status] || statusColors.open}`}>
                    {pr.status}
                </span>
            </div>
            <h4 className="mb-1 line-clamp-2 text-sm font-medium text-brand-900 dark:text-brand-100">{pr.title}</h4>
            <p className="text-xs text-brand-600 dark:text-brand-400">by {pr.author}</p>
        </button>
    );
}

export default PRCard;
