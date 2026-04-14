import React, { useMemo, useState } from 'react';
import { api } from '../utils/api';

export default function ChatPanel({ prId, chatRef, initialHistory = [], setInitialHistory }) {
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState("");

    const history = useMemo(() => initialHistory || [], [initialHistory]);
    const setHistory = (nextHistory) => {
        if (typeof setInitialHistory === 'function') {
            setInitialHistory(nextHistory);
        }
    };

    const scrollRef = React.useRef(null);

    const handleSend = async (e, overrideMsg) => {
        if (e) e.preventDefault();
        if (!prId) {
            setErrorText('Select a pull request before starting chat.');
            return;
        }

        const textToSend = overrideMsg || msg;
        if (!textToSend.trim()) return;
        setErrorText("");

        const userMessage = { role: 'user', content: textToSend };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        if (!overrideMsg) setMsg("");
        setLoading(true);

        // Scroll into view safely
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);

        try {
            const res = await api(`/api/chat/${prId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: textToSend, history })
            });
            setHistory([...newHistory, { role: 'assistant', content: res.reply || "I couldn't generate a response for that yet." }]);
        } catch (err) {
            console.error(err);
            setErrorText(err.message || 'Unable to send message right now.');
            setHistory([...newHistory, { role: 'assistant', content: "Sorry, I encountered an error." }]);
        } finally {
            setLoading(false);
        }
    };

    // Expose send explicitly for external buttons
    React.useEffect(() => {
        if (chatRef) {
            chatRef.current = { send: (m) => handleSend(null, m) };
        }
    }, [chatRef, msg, history]);

    return (
        <div id="interactive-chat" className="panel mt-8 flex h-[400px] flex-col overflow-hidden rounded-xl">
            <div className="border-b border-brand-200 bg-brand-100 px-4 py-2 font-semibold text-brand-800 dark:border-brand-800 dark:bg-brand-900 dark:text-brand-200">
                Interactive PR Chat
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {history.length === 0 && (
                    <div className="mt-10 text-center text-brand-500 dark:text-brand-400">Ask me anything about this PR.</div>
                )}
                {history.map((h, i) => (
                    <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] whitespace-pre-wrap rounded-xl px-4 py-2 text-sm ${h.role === 'user' ? 'bg-brand-800 text-brand-50 dark:bg-brand-200 dark:text-brand-950' : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'}`}>
                            {h.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] animate-pulse rounded-xl bg-brand-100 px-4 py-2 text-sm text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-surface-dark">
                <input 
                    type="text" 
                    value={msg} 
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 outline-none transition-colors focus:border-brand-500 dark:border-brand-700 dark:bg-surface-darkMuted dark:text-brand-100 dark:focus:border-brand-300"
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading || !msg.trim() || !prId}
                    className="btn-primary px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Send
                </button>
            </form>
            {errorText ? (
                <div className="border-t border-brand-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-brand-800 dark:bg-red-900/20 dark:text-red-300">
                    {errorText}
                </div>
            ) : null}
        </div>
    );
}
