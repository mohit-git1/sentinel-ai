import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, Search, Rocket } from 'lucide-react';
import { api } from '../utils/api';
import RepoCard from '../components/RepoCard';
import ConnectRepoModal from '../components/ConnectRepoModal';
import StatsBar from '../components/StatsBar';

function Dashboard() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const data = await api('/api/repos');
                setRepos(data);
            } catch (error) {
                console.error('Failed to fetch repos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, []);

    const handleRepoConnected = (newRepo) => {
        setRepos((prev) => [...prev, newRepo]);
        setShowConnectModal(false);
    };

    const handleDisconnect = async (repoId) => {
        try {
            await api(`/api/repos/${repoId}`, { method: 'DELETE' });
            setRepos((prev) => prev.filter((r) => r._id !== repoId));
        } catch (error) {
            console.error('Failed to disconnect repo:', error);
        }
    };

    const filteredRepos = repos.filter((repo) => {
        const repoName = (repo?.name || repo?.fullName || '').toLowerCase();
        return repoName.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="app-shell px-4 pb-20 pt-10 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
                >
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-500 dark:text-brand-400">
                            <LayoutGrid className="w-4 h-4" />
                            Overview
                        </div>
                        <h1 className="font-display text-4xl font-extrabold tracking-tight text-brand-950 md:text-5xl dark:text-brand-50">
                            Your repositories
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-brand-600 dark:text-brand-400">
                            Monitor connected repositories and manage review coverage from one place.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="btn-primary gap-2 self-start"
                    >
                        <Plus className="h-4 w-4" />
                        Connect repository
                    </button>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <StatsBar repoCount={repos.length} />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10 flex items-center gap-4"
                >
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500 dark:text-brand-400" />
                        <input 
                            type="text"
                            placeholder="Search repositories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-brand-300 bg-white py-2.5 pl-10 pr-4 text-sm text-brand-900 outline-none transition-colors placeholder:text-brand-500 focus:border-brand-500 dark:border-brand-700 dark:bg-surface-darkMuted dark:text-brand-100 dark:placeholder:text-brand-500 dark:focus:border-brand-300"
                        />
                    </div>
                </motion.div>

                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700 dark:border-brand-700 dark:border-t-brand-200"></div>
                            <span className="text-sm font-medium text-brand-600 dark:text-brand-400">Synchronizing with GitHub...</span>
                        </div>
                    ) : filteredRepos.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="panel rounded-2xl border-dashed py-20 text-center"
                        >
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-brand-300 bg-brand-100 dark:border-brand-700 dark:bg-brand-900">
                                <Rocket className="h-6 w-6 text-brand-500 dark:text-brand-400" />
                            </div>
                            <h3 className="mb-2 text-2xl font-semibold text-brand-950 dark:text-brand-50">Connect your first repository</h3>
                            <p className="mx-auto mb-8 max-w-sm text-sm text-brand-600 dark:text-brand-400">
                                You haven't connected any repositories yet. Start by connecting your first project to enable AI reviews.
                            </p>
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="btn-primary px-8"
                            >
                                Connect repository
                            </button>
                        </motion.div>
                    ) : (
                        <div
                            className="grid gap-5"
                            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
                        >
                            {filteredRepos.map((repo, idx) => (
                                <motion.div
                                    key={repo._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <RepoCard
                                        repo={repo}
                                        onDisconnect={handleDisconnect}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showConnectModal && (
                    <ConnectRepoModal
                        onClose={() => setShowConnectModal(false)}
                        onConnected={handleRepoConnected}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default Dashboard;

