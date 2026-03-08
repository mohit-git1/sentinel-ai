import React, { useState } from 'react';
import { api } from '../utils/api';

export default function SmartSuggestions({ issues, pr, triggerChat }) {
    const [modalIssue, setModalIssue] = useState(null);
    const [similarIssues, setSimilarIssues] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    // Get the first issue for quick actions, or return if none
    const firstIssue = issues && issues.length > 0 ? issues[0] : null;

    const handleCheckSimilar = async (issueType) => {
        setLoadingSimilar(true);
        setSimilarIssues([]);
        try {
            const res = await api(`/api/reviews/similar/${encodeURIComponent(issueType)}`);
            setSimilarIssues(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSimilar(false);
        }
    };

    return (
        <div className="bg-surface-light/30 border border-slate-700/50 rounded-xl p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Smart Suggestions</h3>
            
            {!firstIssue ? (
                <p className="text-xs text-slate-500">No issues required for suggestions.</p>
            ) : (
                <div className="space-y-2 flex flex-col">
                    <button 
                        onClick={() => setModalIssue(firstIssue)}
                        className="text-left px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors text-slate-300"
                    >
                        ✨ Apply this fix
                    </button>
                    <button 
                        onClick={() => triggerChat(`Can you explain the ${firstIssue.issue} issue in more detail and give me a step by step fix?`)}
                        className="text-left px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors text-slate-300"
                    >
                        🗣️ Explain this issue
                    </button>
                    <button 
                        onClick={() => triggerChat(`Generate a complete unit test for the ${firstIssue.file} changes in this PR using Jest.`)}
                        className="text-left px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors text-slate-300"
                    >
                        🧪 Generate full test
                    </button>
                    <button 
                        onClick={() => handleCheckSimilar(firstIssue.type || 'bug')}
                        className="text-left px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors text-slate-300"
                    >
                        🔍 Check similar issues
                    </button>
                </div>
            )}

            {loadingSimilar && <p className="text-xs text-slate-400 mt-3">Loading similar issues...</p>}
            
            {similarIssues.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs font-semibold text-slate-300 mb-2">Past PRs with this issue:</p>
                    <ul className="text-xs space-y-1">
                        {similarIssues.map(rev => (
                            <li key={rev._id}>
                                <a href={rev.prId?.diffUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
                                    PR #{rev.prId?.prNumber} - {rev.prId?.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {modalIssue && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-lg w-full">
                        <h3 className="text-lg font-bold text-white mb-2">Apply Fix</h3>
                        <p className="text-sm text-slate-400 mb-4 font-mono">{modalIssue.file}:{modalIssue.line}</p>
                        
                        <div className="bg-slate-900 rounded border border-slate-700 p-3 mb-4">
                            <pre className="text-xs text-brand-300 break-all whitespace-pre-wrap">{modalIssue.suggestion || "No direct suggestion available."}</pre>
                        </div>
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={() => setModalIssue(null)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
