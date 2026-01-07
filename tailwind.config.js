/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./FestiveLottery.tsx",
    ],
    theme: {
        extend: {
            colors: {
                festive: {
                    dark: '#2a0a12',
                    red: {
                        DEFAULT: '#991b1b', // red-800
                        deep: '#450a0a',   // red-950
                    },
                    gold: {
                        light: '#fde68a',  // amber-200
                        DEFAULT: '#f59e0b', // amber-500
                        dark: '#b45309',   // amber-700
                    }
                },
                mystery: {
                    dark: '#1a1025',
                    purple: '#7e22ce', // purple-700
                }
            },
            backgroundImage: {
                'festive-gradient': 'linear-gradient(to bottom, #2a0a12, #1a0505)',
                'gold-gradient': 'linear-gradient(to bottom right, #fbbf24, #b45309)',
            },
            animation: {
                'bounce-slow': 'bounce-slow 3s infinite ease-in-out',
                'scale-in': 'scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'pop-in': 'pop-in 0.4s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
                'float-up': 'float-up 4s ease-in-out infinite',
            },
            keyframes: {
                'bounce-slow': {
                    '0%, 100%': { transform: 'translateY(-5%)' },
                    '50%': { transform: 'translateY(5%)' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '60%': { transform: 'scale(1.2)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'pop-in': {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'fade-in-up': {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                'float-up': {
                    '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
                    '10%': { opacity: '1', transform: 'translateY(-20px) scale(1)' },
                    '100%': { transform: 'translateY(-300px) scale(1)', opacity: '0' },
                },
            },
            boxShadow: {
                'gold-glow': '0 0 15px rgba(245, 158, 11, 0.4)',
                'purple-glow': '0 0 15px rgba(168, 85, 247, 0.4)',
            }
        },
    },
    plugins: [],
}

