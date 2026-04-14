import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink, Trash2, ArrowRight } from 'lucide-react';

const GithubIcon = () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

function RepoCard({ repo, onDisconnect }) {
    return (
        <motion.div 
            whileHover={{ y: -3 }}
            className="group relative h-full"
        >
            <div className="panel relative flex h-full flex-col rounded-xl p-5 transition-colors group-hover:border-brand-400 dark:group-hover:border-brand-600">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-300 bg-brand-100 dark:border-brand-700 dark:bg-brand-900">
                        <div className="h-5 w-5 text-brand-600 dark:text-brand-300">
                            <GithubIcon />
                        </div>
                    </div>
                    <button
                        onClick={() => onDisconnect(repo._id)}
                        className="rounded-md p-2 text-brand-500 opacity-0 transition-all hover:bg-brand-100 hover:text-brand-800 group-hover:opacity-100 dark:text-brand-400 dark:hover:bg-brand-900 dark:hover:text-brand-200"
                        title="Disconnect repository"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="font-display mb-1 truncate text-xl font-bold text-brand-900 dark:text-brand-100">
                        {repo.name || repo.fullName || 'Untitled repository'}
                    </h3>
                    <p className="min-h-[2.5rem] line-clamp-2 text-sm text-brand-600 dark:text-brand-400">
                        {repo.description || 'No description provided.'}
                    </p>
                </div>

                <div className="mb-7 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
                        <Star className="h-3.5 w-3.5" />
                        {repo.stargazersCount || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
                        <GitFork className="h-3.5 w-3.5" />
                        {repo.forksCount || 0}
                    </div>
                    <div className="ml-auto rounded border border-brand-300 bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-300">
                        {repo.language || 'Code'}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-brand-200 pt-4 dark:border-brand-800">
                    <Link
                        to={`/repo/${repo._id}`}
                        className="group/btn flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-900 dark:text-brand-100"
                    >
                        Manage
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                    
                    {repo.fullName ? (
                        <a
                            href={`https://github.com/${repo.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-brand-300 text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900"
                            aria-label={`Open ${repo.fullName} on GitHub`}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
}

export default RepoCard;
