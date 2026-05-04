/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./**/*.html', './js/**/*.js', '!./node_modules/**'],
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)',
                surface: 'var(--surface)',
                'surface-2': 'var(--surface-2)',
                border: 'var(--border)',
                text: 'var(--text)',
                muted: 'var(--text-muted)',
                accent: 'var(--accent)',
                'accent-2': 'var(--accent-2)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
                success: 'var(--success)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', 'Consolas', 'monospace'],
            },
            fontSize: {
                '2xs': '12px',
                xs: '13px',
                sm: '14px',
                base: '16px',
                lg: '18px',
                xl: '22px',
                '2xl': '28px',
                '3xl': '36px',
            },
            spacing: {
                1: '4px',
                2: '8px',
                3: '12px',
                4: '16px',
                6: '24px',
                8: '32px',
                12: '48px',
                16: '64px',
                24: '96px',
            },
            borderRadius: {
                sm: '6px',
                DEFAULT: '10px',
                lg: '14px',
            },
            transitionDuration: {
                DEFAULT: '150ms',
            },
        },
    },
    plugins: [],
};
