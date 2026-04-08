import React, { useState } from 'react';
import { api } from '../utils/api';

export default function ChatPanel({ prId, chatRef, initialHistory = [], setInitialHistory }) {
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const history = initialHistory || [];
    const setHistory = setInitialHistory;

    const scrollRef = React.useRef(null);

    const handleSend = async (e, overrideMsg) => {
        if (e) e.preventDefault();
        const textToSend = overrideMsg || msg;
        if (!textToSend.trim()) return;
        
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
            setHistory([...newHistory, { role: 'assistant', content: res.reply }]);
        } catch (err) {
            console.error(err);
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
        <div id="interactive-chat" className="mt-8 bg-surface-light border border-slate-700/50 rounded-xl overflow-hidden flex flex-col" style={{ height: '400px' }}>
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 font-semibold text-slate-200">
                Interactive PR Chat
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.length === 0 && (
                    <div className="text-center text-slate-500 mt-10">Ask me anything about this PR!</div>
                )}
                {history.map((h, i) => (
                    <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap ${h.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            {h.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] px-4 py-2 rounded-xl text-sm bg-slate-700 text-slate-200 animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                <input 
                    type="text" 
                    value={msg} 
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
