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

    return (
        <div className="min-h-screen bg-surface pt-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex gap-6">
                    {/* Left: PR list */}
                    <div className="w-full lg:w-1/3">
                        <h2 className="text-2xl font-bold text-white mb-4">Pull Requests</h2>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
                            </div>
                        ) : pulls.length === 0 ? (
                            <div className="text-center py-10 bg-surface-light/30 rounded-xl border border-slate-700/50">
                                <p className="text-slate-400">No pull requests yet.</p>
                                <p className="text-slate-500 text-sm mt-1">Open a PR on GitHub to see it here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
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
                    </div>

                    {/* Right: Review panel */}
                    <div className="hidden lg:block lg:w-2/3">
                        {selectedPR ? (
                            <ReviewPanel
                                pr={selectedPR}
                                reviews={reviews}
                                loading={reviewLoading}
                                onTriggerReview={handleTriggerReview}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-96 bg-surface-light/20 rounded-2xl border border-slate-700/30">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">👈</div>
                                    <p className="text-slate-400">Select a pull request to view its AI review</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RepoDetail;
