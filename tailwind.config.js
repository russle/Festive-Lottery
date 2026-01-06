/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'bounce-slow': 'bounce-slow 3s infinite ease-in-out',
                'scale-in': 'scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'pop-in': 'pop-in 0.4s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
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
            },
        },
    },
    plugins: [],
}
