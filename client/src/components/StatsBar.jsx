/**
 * Stats bar shown on the dashboard — displays key metrics.
 */
function StatsBar({ repoCount }) {
    const stats = [
        { label: 'Connected Repos', value: repoCount, icon: '📦' },
        { label: 'Reviews Today', value: '—', icon: '🔍' },
        { label: 'Bugs Caught', value: '—', icon: '🐛' },
        { label: 'Security Issues', value: '—', icon: '🔒' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-surface-light/50 border border-slate-700/50 rounded-xl p-4 text-center"
                >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}

export default StatsBar;
