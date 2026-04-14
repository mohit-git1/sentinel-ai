import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import PRCard from '../components/PRCard';
import ReviewPanel from '../components/ReviewPanel';

/**
 * Repository detail page — lists pull requests and shows AI reviews.
 */
function RepoDetail() {
    const { id } = useParams();
    const [pulls, setPulls] = useState([]);
    const [selectedPR, setSelectedPR] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const fetchPulls = async () => {
            try {
                const data = await api(`/api/repos/${id}/pulls`);
                setPulls(data);
            } catch (error) {
                console.error('Failed to fetch pulls:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPulls();
    }, [id]);

    // Load reviews when a PR is selected
    const handleSelectPR = async (pr) => {
        setSelectedPR(pr);
        setReviewLoading(true);
        try {
            const data = await api(`/api/reviews/pr/${pr._id}`);
            setReviews(data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setReviewLoading(false);
        }
    };

    // Manually trigger an AI review for a PR
    const handleTriggerReview = async (prId) => {
        setReviewLoading(true);
        try {
            const newReview = await api(`/api/reviews/trigger/${prId}`, { method: 'POST' });
            setReviews((prev) => [newReview, ...prev]);
        } catch (error) {
            console.error('Failed to trigger review:', error);
        } finally {
            setReviewLoading(false);
        }
    };

    // Actively sync new PRs from GitHub
    const handleSyncPulls = async () => {
        setIsSyncing(true);
        try {
            const data = await api(`/api/repos/${id}/sync-pulls`, { method: 'POST' });
            setPulls(data);
        } catch (error) {
            console.error('Failed to sync PRs:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="app-shell px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid gap-8 lg:grid-cols-[minmax(280px,360px)_1fr]">
                    <section className="w-full">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-brand-950 dark:text-brand-50">Pull requests</h2>
                            <button 
                                onClick={handleSyncPulls} 
                                disabled={isSyncing}
                                className="btn-primary px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSyncing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                        Check new PRs
                                    </>
                                )}
                            </button>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-brand-700 dark:border-brand-200"></div>
                            </div>
                        ) : pulls.length === 0 ? (
                            <div className="panel rounded-xl py-10 text-center">
                                <p className="text-brand-700 dark:text-brand-300">No pull requests yet.</p>
                                <p className="mt-1 text-sm text-brand-500 dark:text-brand-500">Open a PR on GitHub to see it here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {pulls.map((pr) => (
                                    <PRCard
                                        key={pr._id}
                                        pr={pr}
                                        isSelected={selectedPR?._id === pr._id}
                                        onClick={() => handleSelectPR(pr)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="hidden lg:block">
                        {selectedPR ? (
                            <ReviewPanel
                                pr={selectedPR}
                                reviews={reviews}
                                loading={reviewLoading}
                                onTriggerReview={handleTriggerReview}
                            />
                        ) : (
                            <div className="panel flex h-96 items-center justify-center rounded-2xl">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">👈</div>
                                    <p className="text-brand-600 dark:text-brand-400">Select a pull request to view its AI review</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default RepoDetail;
