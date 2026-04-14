import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Moon, ShieldCheck, Sun } from 'lucide-react';

const GithubIcon = () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

function Login() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`;
    };

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <div className="app-shell relative flex min-h-screen flex-col overflow-hidden px-4">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42vw] bg-brand-100/70 dark:bg-brand-900/35 lg:block" />
            <div className="mx-auto flex w-full max-w-5xl justify-end py-5 sm:py-7">
                <button
                    onClick={toggleTheme}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto flex w-full max-w-5xl flex-1 items-center pb-12"
            >
                <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
                    <section className="space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-300 bg-brand-100 text-brand-800 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100">
                                <div className="h-5 w-5">
                                    <GithubIcon />
                                </div>
                            </div>
                            <span className="text-base font-semibold text-brand-800 dark:text-brand-200">Sentinel AI</span>
                        </div>

                        <div className="max-w-2xl space-y-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500 dark:text-brand-400">
                                Premium Review Workflow
                            </p>
                            <h1 className="font-display text-5xl font-extrabold tracking-tight text-brand-950 sm:text-6xl dark:text-brand-50">
                                Catch high-risk changes before humans miss them.
                            </h1>
                            <p className="max-w-xl text-base text-brand-600 dark:text-brand-300">
                                Connect your repository and get consistent review signals across bugs, security, and performance without adding process overhead.
                            </p>
                        </div>

                        <div className="grid max-w-2xl grid-cols-1 gap-3.5 sm:grid-cols-3">
                            {[
                                ['Bug Detection', 'Catch risky logic before merge.'],
                                ['Security Checks', 'Flag high-impact vulnerabilities.'],
                                ['Performance Notes', 'Find practical optimization wins.'],
                            ].map(([title, desc]) => (
                                <article key={title} className="panel rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-100">{title}</h3>
                                    <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">{desc}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="brand-frame rounded-2xl p-6 sm:p-8 lg:mt-2">
                        <h2 className="text-xl font-semibold text-brand-900 dark:text-brand-100">Sign in to continue</h2>
                        <p className="mt-2 text-sm text-brand-600 dark:text-brand-400">
                            Use your GitHub account to connect repositories and start automated PR reviews.
                        </p>

                        <button
                            onClick={handleLogin}
                            className="btn-primary mt-6 w-full gap-2"
                        >
                            Continue with GitHub
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <div className="mt-5 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-100/60 px-3 py-2 text-xs text-brand-700 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            OAuth authentication and token handling are secured by default.
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;

