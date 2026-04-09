import { useState } from 'react';

/**
 * Login page — hero section with GitHub OAuth login button.
 * Styled as a dark landing page with gradient accents.
 */
function Login() {
    const [isHovered, setIsHovered] = useState(false);

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`;
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl animate-pulse"></div>

            {/* Main content */}
            <div className="relative z-10 text-center max-w-2xl">
                {/* Logo */}
                <div className="mb-8 flex items-center justify-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25">
                        <span className="text-white text-2xl font-bold">S</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white">
                        Sentinel <span className="text-brand-400">AI</span>
                    </h1>
                </div>

                {/* Tagline */}
                <p className="text-xl text-slate-300 mb-3">
                    AI-powered PR reviewer that catches bugs before humans do.
                </p>
                <p className="text-slate-400 mb-10 max-w-lg mx-auto">
                    Connect your repositories, and Sentinel will automatically review every pull request
                    with GPT-4o-mini — finding bugs, security issues, and performance problems in seconds.
                </p>

                {/* GitHub Login Button */}
                <button
                    onClick={handleLogin}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="inline-flex items-center gap-3 bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-slate-100 shadow-lg shadow-white/10 transition-all duration-300 hover:scale-105"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    {isHovered ? 'Let\'s Go!' : 'Sign in with GitHub'}
                </button>

                {/* Feature highlights */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                    <div className="bg-surface-light/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
                        <div className="text-brand-400 text-lg font-semibold mb-2">🐛 Bug Detection</div>
                        <p className="text-slate-400 text-sm">Catches logic errors and edge cases that slip past human reviewers.</p>
                    </div>
                    <div className="bg-surface-light/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
                        <div className="text-brand-400 text-lg font-semibold mb-2">🔒 Security Scan</div>
                        <p className="text-slate-400 text-sm">Identifies vulnerabilities, injection risks, and auth issues automatically.</p>
                    </div>
                    <div className="bg-surface-light/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
                        <div className="text-brand-400 text-lg font-semibold mb-2">⚡ Performance Tips</div>
                        <p className="text-slate-400 text-sm">Suggests optimizations for faster, leaner code in every pull request.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
