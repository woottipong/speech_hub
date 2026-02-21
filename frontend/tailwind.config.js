/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Sarabun', 'system-ui', 'sans-serif'],
            },
            colors: {
                // ให้ Tailwind รู้จัก custom CSS variables
                'bg-deep': 'var(--bg-deep)',
                'bg-card': 'var(--bg-card)',
                'bg-surface': 'var(--bg-surface)',
                'accent-cyan': 'var(--accent-cyan)',
                'accent-purple': 'var(--accent-purple)',
                'accent-pink': 'var(--accent-pink)',
                'text-primary': 'var(--text-primary)',
                'text-muted': 'var(--text-muted)',
                'border-subtle': 'var(--border-subtle)',
            },
        },
    },
    plugins: [],
};
