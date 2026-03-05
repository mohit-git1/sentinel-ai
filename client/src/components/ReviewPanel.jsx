/**
 * Review panel — displays AI review results for a selected PR.
 * Shows the summary, individual comments with type badges, and a re-review button.
 */
function ReviewPanel({ pr, reviews, loading, onTriggerReview }) {
    const typeBadge = {
        bug: { bg: 'bg-red-500/20', text: 'text-red-400', label: '🐛 Bug' },
        security: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: '🔒 Security' },
        performance: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '⚡ Performance' },
        style: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '🎨 Style' },
        suggestion: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: '💡 Suggestion' },
    };

    return (
        <div>
            {/* PR Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">{pr.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        PR #{pr.prNumber} by {pr.author}
                    </p>
                </div>
                <button
                    onClick={() => onTriggerReview(pr._id)}
                    disabled={loading}
                    className="bg-brand-600 hover:bg-brand-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20"
                >
                    {loading ? 'Reviewing...' : '🔄 Re-review'}
                </button>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500 mx-auto mb-3"></div>
                        <p className="text-slate-400 text-sm">AI is reviewing the code...</p>
                    </div>
                </div>
            )}

            {/* Reviews */}
            {!loading && reviews.length === 0 && (
                <div className="text-center py-16 bg-surface-light/20 rounded-2xl border border-slate-700/30">
                    <div className="text-4xl mb-3">🤖</div>
                    <p className="text-slate-400">No reviews yet. Click "Re-review" to trigger an AI review.</p>
                </div>
            )}

            {!loading && reviews.map((review) => (
                <div key={review._id} className="mb-8">
                    {/* Summary */}
                    {review.summary && (
                        <div className="bg-surface-light/50 border border-slate-700/50 rounded-xl p-5 mb-5">
                            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-2">Summary</h3>
                            <p className="text-slate-300 leading-relaxed">{review.summary}</p>
                        </div>
                    )}

                    {/* Comments */}
                    <div className="space-y-3">
                        {review.comments.map((comment, idx) => {
                            const badge = typeBadge[comment.type] || typeBadge.suggestion;
                            return (
                                <div
                                    key={idx}
                                    className="bg-surface-light/30 border border-slate-700/40 rounded-xl p-4 hover:border-slate-600/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                                            {badge.label}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono">
                                            {comment.file}:{comment.line}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-2">{comment.issue}</p>
                                    {comment.suggestion && (
                                        <div className="bg-surface/50 rounded-lg p-3 border border-slate-700/30">
                                            <p className="text-xs text-brand-400 font-semibold mb-1">💡 Suggestion</p>
                                            <p className="text-slate-400 text-sm font-mono">{comment.suggestion}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ReviewPanel;
