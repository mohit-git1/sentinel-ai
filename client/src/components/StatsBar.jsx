/**
 * Stats bar shown on the dashboard — displays key metrics.
 */
function StatsBar({ repoCount }) {
    const stats = [
        { label: 'Connected Repos', value: repoCount, featured: true },
        { label: 'Reviews Today', value: '—' },
        { label: 'Bugs Caught', value: '—' },
        { label: 'Security Issues', value: '—' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={stat.featured ? 'brand-frame rounded-xl px-4 py-4 sm:px-5' : 'panel rounded-xl px-4 py-4 sm:px-5'}
                >
                    <div className={stat.featured ? 'font-display text-3xl font-extrabold text-brand-900 dark:text-brand-100' : 'text-2xl font-semibold text-brand-900 dark:text-brand-100'}>
                        {stat.value}
                    </div>
                    <div className="mt-1.5 text-xs text-brand-600 dark:text-brand-400">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}

export default StatsBar;
