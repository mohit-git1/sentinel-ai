/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f6f7f9',
                    100: '#ebeef2',
                    200: '#d3dae3',
                    300: '#b4c0cf',
                    400: '#8f9db2',
                    500: '#6c7b92',
                    600: '#57657b',
                    700: '#445063',
                    800: '#343d4d',
                    900: '#232a37',
                    950: '#151a24',
                },
                accent: {
                    slate: '#546074',
                },
                surface: {
                    DEFAULT: '#f6f7f9',
                    muted: '#ebeef2',
                    dark: '#0f1218',
                    darkMuted: '#171c24',
                },
            },
            fontFamily: {
                sans: ['"Manrope"', 'system-ui', 'sans-serif'],
                display: ['"Sora"', '"Manrope"', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
};
