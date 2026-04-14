import React, { useState, useEffect, useRef } from 'react';
import OptimizationsTab from './OptimizationsTab';
import ChatPanel from './ChatPanel';
import SmartSuggestions from './SmartSuggestions';

/**
 * Review panel — displays AI review results for a selected PR.
 * Shows the summary, individual comments with type badges, and a re-review button.
 */
function ReviewPanel({ pr, reviews, loading, onTriggerReview }) {
    const [activeTab, setActiveTab] = useState('review'); // 'review' | 'optimizations'
    const [chatHistory, setChatHistory] = useState([]);
    const chatRef = useRef(null);

    // Reset state when a new PR is selected
    useEffect(() => {
        setChatHistory([]);
        setActiveTab('review');
    }, [pr._id]);

    const typeBadge = {
        bug: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', label: 'Bug' },
        security: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', label: 'Security' },
        performance: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', label: 'Performance' },
        style: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', label: 'Style' },
        suggestion: { bg: 'bg-brand-200 dark:bg-brand-800', text: 'text-brand-700 dark:text-brand-300', label: 'Suggestion' },
    };

    const latestReview = reviews && reviews.length > 0 ? reviews[0] : null;

    const handleTriggerChat = (msg) => {
        if (chatRef.current?.send) {
            chatRef.current.send(msg);
        }
    };

    return (
        <div className="flex gap-6 relative">
            {/* Main content area */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-brand-950 dark:text-brand-50">{pr.title}</h2>
                        <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
                            PR #{pr.prNumber} by {pr.author}
                        </p>
                    </div>
                    <button
                        onClick={() => onTriggerReview(pr._id)}
                        disabled={loading}
                        className="btn-primary px-5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Reviewing...' : 'Re-review'}
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-brand-700 dark:border-brand-200"></div>
                            <p className="text-sm text-brand-600 dark:text-brand-400">AI is reviewing the code...</p>
                        </div>
                    </div>
                )}

                {!loading && reviews.length === 0 && (
                    <div className="panel rounded-2xl py-16 text-center">
                        <div className="text-4xl mb-3">🤖</div>
                        <p className="text-brand-600 dark:text-brand-400">No reviews yet. Click "Re-review" to trigger an AI review.</p>
                    </div>
                )}

                {!loading && latestReview && (
                    <div className="pb-8">
                        <div className="mb-6 flex border-b border-brand-200 dark:border-brand-800">
                            <button
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'review' ? 'border-brand-600 text-brand-800 dark:border-brand-300 dark:text-brand-100' : 'border-transparent text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-200'}`}
                                onClick={() => setActiveTab('review')}
                            >
                                Review
                            </button>
                            <button
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'optimizations' ? 'border-brand-600 text-brand-800 dark:border-brand-300 dark:text-brand-100' : 'border-transparent text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-200'}`}
                                onClick={() => setActiveTab('optimizations')}
                            >
                                Optimizations {latestReview.optimizations?.length > 0 && `(${latestReview.optimizations.length})`}
                            </button>
                        </div>

                        {activeTab === 'review' && (
                            <div className="mb-8">
                                {latestReview.summary && (
                                    <div className="panel mb-5 rounded-xl p-5">
                                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">Summary</h3>
                                        <p className="leading-relaxed text-brand-700 dark:text-brand-300">{latestReview.summary}</p>
                                    </div>
                                )}

                                <div className="space-y-3 mb-10">
                                    {(latestReview.comments || []).map((comment, idx) => {
                                        const badge = typeBadge[comment.type] || typeBadge.suggestion;
                                        return (
                                            <div
                                                key={idx}
                                                className="panel rounded-xl p-4 transition-colors hover:border-brand-400 dark:hover:border-brand-600"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                                                        {badge.label}
                                                    </span>
                                                    <span className="font-mono text-xs text-brand-500 dark:text-brand-400">
                                                        {comment.file}:{comment.line}
                                                    </span>
                                                </div>
                                                <p className="mb-2 text-sm text-brand-700 dark:text-brand-300">{comment.issue}</p>
                                                {comment.suggestion && (
                                                    <div className="rounded-lg border border-brand-200 bg-brand-100/70 p-3 dark:border-brand-800 dark:bg-brand-900/40">
                                                        <p className="mb-1 text-xs font-semibold text-brand-700 dark:text-brand-300">Suggestion</p>
                                                        <p className="font-mono text-sm text-brand-600 dark:text-brand-400">{comment.suggestion}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'optimizations' && (
                            <div className="mb-10">
                                <OptimizationsTab optimizations={latestReview.optimizations || []} />
                            </div>
                        )}

                        <div className="mt-8 border-t border-brand-200 pt-8 dark:border-brand-800">
                            <ChatPanel 
                                prId={pr._id} 
                                chatRef={chatRef}
                                initialHistory={chatHistory} 
                                setInitialHistory={setChatHistory} 
                            />
                        </div>
                    </div>
                )}
            </div>

            {!loading && latestReview && (
                <div className="hidden xl:block w-72 flex-shrink-0">
                    <SmartSuggestions 
                        issues={latestReview.comments || []} 
                        pr={pr} 
                        triggerChat={handleTriggerChat}
                    />
                </div>
            )}
        </div>
    );
}

export default ReviewPanel;
