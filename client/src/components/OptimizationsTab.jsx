import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

export default function OptimizationsTab({ optimizations }) {
    const impactColor = {
        performance: 'bg-blue-500 text-white',
        readability: 'bg-slate-500 text-white',
        security: 'bg-red-500 text-white',
        maintainability: 'bg-green-500 text-white'
    };

    if (!optimizations || optimizations.length === 0) {
        return <div className="py-16 text-center text-slate-400">No optimizations found for this PR.</div>;
    }

    return (
        <div className="space-y-6">
            {optimizations.map((opt, idx) => (
                <div key={idx} className="bg-surface-light/30 border border-slate-700/40 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-3 items-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${impactColor[opt.impact] || 'bg-slate-500 text-white'}`}>{opt.impact}</span>
                            <span className="font-mono text-sm text-slate-400">{opt.file}</span>
                        </div>
                        <button 
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors text-slate-200"
                            onClick={() => navigator.clipboard.writeText(opt.optimizedCode)}
                        >
                            Copy optimized code
                        </button>
                    </div>
                    
                    <div className="h-64 mb-4 rounded border border-slate-700/50">
                        <DiffEditor
                            height="100%"
                            language="javascript"
                            theme="vs-dark"
                            original={opt.originalCode}
                            modified={opt.optimizedCode}
                            options={{ readOnly: true, minimap: { enabled: false } }}
                        />
                    </div>
                    
                    <div className="bg-surface/50 p-3 rounded-lg border border-slate-700/30">
                        <p className="text-sm font-semibold text-brand-400 mb-1">Explanation</p>
                        <p className="text-sm text-slate-300">{opt.explanation}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
