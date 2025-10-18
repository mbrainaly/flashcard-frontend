/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#FAFAFA', // Near white
                    100: '#F5F5F5', // Light gray
                    200: '#E5E5E5', // Medium light gray
                    300: '#1A1A1A', // Near black
                },
                accent: {
                    gold: '#D4AF37', // Luxury gold
                    silver: '#C0C0C0', // Premium silver
                    pearl: '#F8F8FF', // Pearl white
                    obsidian: '#0A0A0A', // Deep black
                    neon: '#00FFD1', // Futuristic neon
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))',
            },
            boxShadow: {
                'neon': '0 0 5px theme("colors.accent.neon"), 0 0 20px theme("colors.accent.neon")',
                'gold': '0 0 5px theme("colors.accent.gold"), 0 0 20px theme("colors.accent.gold")',
                'premium': '0 0 50px rgba(0, 0, 0, 0.1)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.accent.silver'),
                        a: {
                            color: theme('colors.accent.neon'),
                            '&:hover': {
                                color: theme('colors.accent.neon'),
                                opacity: 0.8,
                            },
                        },
                        strong: {
                            color: theme('colors.white'),
                        },
                        em: {
                            color: theme('colors.accent.gold'),
                        },
                        h1: {
                            color: theme('colors.white'),
                        },
                        h2: {
                            color: theme('colors.white'),
                        },
                        h3: {
                            color: theme('colors.white'),
                        },
                        h4: {
                            color: theme('colors.white'),
                        },
                        code: {
                            color: theme('colors.accent.neon'),
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: theme('borderRadius.md'),
                            padding: '0.2em 0.4em',
                        },
                        'code::before': {
                            content: '""',
                        },
                        'code::after': {
                            content: '""',
                        },
                        hr: {
                            borderColor: theme('colors.accent.silver'),
                            opacity: 0.2,
                        },
                        ul: {
                            li: {
                                '&::marker': {
                                    color: theme('colors.accent.neon'),
                                },
                            },
                        },
                        ol: {
                            li: {
                                '&::marker': {
                                    color: theme('colors.accent.neon'),
                                },
                            },
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}