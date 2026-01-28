import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				satoshi: ['var(--font-satoshi)', 'system-ui', 'sans-serif'],
				sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
				serif: ['var(--font-serif)', 'Georgia', 'serif'],
			},
			fontSize: {
				// Custom font sizes with optical sizing
				'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'heading-1': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
				'heading-2': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'heading-3': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
				'body-lg': ['1.125rem', { lineHeight: '1.6' }],
				'body': ['1rem', { lineHeight: '1.6' }],
				'small': ['0.875rem', { lineHeight: '1.5' }],
			},
			letterSpacing: {
				'tighter': '-0.02em',
				'tight': '-0.01em',
				'wide': '0.05em',
				'wider': '0.1em',
				'widest': '0.15em',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				// Subtle elevation system
				'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
				'sm': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
				'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
				'md': '0 6px 12px -2px rgb(0 0 0 / 0.06), 0 3px 6px -3px rgb(0 0 0 / 0.06)',
				'lg': '0 10px 20px -3px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
				'xl': '0 20px 40px -4px rgb(0 0 0 / 0.1), 0 8px 16px -6px rgb(0 0 0 / 0.08)',
				// Dark mode shadows
				'dark-sm': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
				'dark-md': '0 6px 12px -2px rgb(0 0 0 / 0.4), 0 3px 6px -3px rgb(0 0 0 / 0.4)',
				'dark-lg': '0 10px 20px -3px rgb(0 0 0 / 0.5), 0 4px 8px -4px rgb(0 0 0 / 0.4)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-down': {
					from: { opacity: '0', transform: 'translateY(-20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in-right': {
					from: { opacity: '0', transform: 'translateX(20px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-left': {
					from: { opacity: '0', transform: 'translateX(-20px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'fade-up': 'fade-up 0.6s ease-out forwards',
				'fade-down': 'fade-down 0.6s ease-out forwards',
				'scale-in': 'scale-in 0.5s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
				'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
				'30': '7.5rem',
				'34': '8.5rem',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
