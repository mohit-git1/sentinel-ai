import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import RepoCard from '../components/RepoCard';
import ConnectRepoModal from '../components/ConnectRepoModal';
import StatsBar from '../components/StatsBar';

/**
 * Dashboard page — shows connected repos, recent reviews, and stats.
 */
function Dashboard() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConnectModal, setShowConnectModal] = useState(false);

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

    return (
        <div className="min-h-screen bg-surface pt-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-slate-400 mt-1">Manage your repositories and review history</p>
                    </div>
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20"
                    >
                        + Connect Repository
                    </button>
                </div>

                {/* Stats */}
                <StatsBar repoCount={repos.length} />

                {/* Repository grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
                    </div>
                ) : repos.length === 0 ? (
                    <div className="text-center py-20 bg-surface-light/30 rounded-2xl border border-slate-700/50">
                        <div className="text-5xl mb-4">🔗</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No repositories connected</h3>
                        <p className="text-slate-400 mb-6">Connect a GitHub repo to start getting AI-powered PR reviews.</p>
                        <button
                            onClick={() => setShowConnectModal(true)}
                            className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
                        >
                            Connect Your First Repo
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {repos.map((repo) => (
                            <RepoCard
                                key={repo._id}
                                repo={repo}
                                onDisconnect={handleDisconnect}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Connect repo modal */}
            {showConnectModal && (
                <ConnectRepoModal
                    onClose={() => setShowConnectModal(false)}
                    onConnected={handleRepoConnected}
                />
            )}
        </div>
    );
}

export default Dashboard;
