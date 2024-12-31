/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
    theme: {
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                scrollbar: 'hsl(var(--scrollbar))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    background: 'hsl(var(--primary-background))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                'primary-container': {
                    DEFAULT: 'hsl(var(--primary-container))',
                    background: 'hsl(var(--primary-container-background))',
                    foreground: 'hsl(var(--primary-container-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    background: 'hsl(var(--secondary-background))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                'secondary-container': {
                    DEFAULT: 'hsl(var(--secondary-container))',
                    background: 'hsl(var(--secondary-container-background))',
                    foreground: 'hsl(var(--secondary-container-foreground))'
                },
                tertiary:{
                    DEFAULT: 'hsl(--var(--tertiary))',
                    background: 'hsl(--var(--tertiary-background))',
                    foreground: 'hsl(--var(--tertiary-foreground))'
                },
                info:{
                    DEFAULT: 'hsl(--var(--info))',
                    background: 'hsl(--var(--info-background))',
                    foreground: 'hsl(--var(--info-foreground))'
                },
                success:{
                    DEFAULT: 'hsl(--var(--success))',
                    background: 'hsl(--var(--success-background))',
                    foreground: 'hsl(--var(--success-foreground))'
                },
                warning:{
                    DEFAULT: 'hsl(--var(--warning))',
                    background: 'hsl(--var(--warning-background))',
                    foreground: 'hsl(--var(--warning-foreground))'
                },
                error:{
                    DEFAULT: 'hsl(--var(--error))',
                    background: 'hsl(--var(--error-background))',
                    foreground: 'hsl(--var(--error-foreground))'
                },
                muted:{
                    DEFAULT: 'hsl(--var(--muted))',
                    background: 'hsl(--var(--muted-background))',
                    foreground: 'hsl(--var(--muted-foreground))'
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
}
