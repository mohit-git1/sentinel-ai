import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogOut, ChevronDown, Moon, Sun } from 'lucide-react';

const GithubIcon = () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Navbar({ user, onLogout, theme, onToggleTheme }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/login');
        window.location.reload();
    };

    return (
        <div className="sticky top-0 z-40 border-b border-brand-200/80 bg-brand-50/95 backdrop-blur-sm dark:border-brand-800/70 dark:bg-surface-dark/95">
            <motion.nav 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
            >
                <Link to="/" className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-300 bg-brand-100 text-brand-800 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100"
                    >
                        <div className="h-5 w-5">
                            <GithubIcon />
                        </div>
                    </motion.div>
                    <span className="hidden text-lg font-semibold text-brand-900 sm:block dark:text-brand-50">
                        Sentinel AI
                    </span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 hover:text-brand-900 dark:text-brand-300 dark:hover:bg-brand-900 dark:hover:text-brand-100"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden md:block">Dashboard</span>
                    </Link>

                    <button
                        onClick={onToggleTheme}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-brand-100 dark:hover:bg-brand-900"
                        >
                            <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="h-8 w-8 rounded-full border border-brand-300 dark:border-brand-700"
                            />
                            <div className="hidden flex-col items-start sm:flex">
                                <span className="text-xs font-semibold leading-none text-brand-900 dark:text-brand-100">{user.username}</span>
                                <span className="mt-1 text-[10px] leading-none text-brand-500 dark:text-brand-400">Personal</span>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-brand-500 transition-transform duration-300", isMenuOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                        {isMenuOpen ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="panel absolute right-0 mt-2 w-44 rounded-lg p-2 shadow-sm"
                            >
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-900"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log out
                                </button>
                            </motion.div>
                        ) : null}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.nav>
        </div>
    );
}

export default Navbar;

