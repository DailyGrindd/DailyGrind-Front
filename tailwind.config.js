/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary))",
        "primary-foreground": "rgb(var(--color-primary-foreground))",
        destructive: "rgb(var(--color-destructive))",
        secondary: "rgb(var(--color-secondary))",
        "secondary-foreground": "rgb(var(--color-secondary-foreground))",
        accent: "rgb(var(--color-accent))",
        "accent-foreground": "rgb(var(--color-accent-foreground))",
        background: "rgb(var(--color-background))",
        foreground: "rgb(var(--color-foreground))",
        input: 'rgb(var(--color-input))',
        'input-background': 'rgb(var(--color-input-bg))',
        ring: 'rgb(var(--color-input-ring))',
        'muted-foreground': 'rgb(var(--color-muted-foreground))',
        label: 'rgb(var(--color-label))',
        card: 'rgb(var(--color-card))',
        'card-foreground': 'rgb(var(--color-card-foreground))',
        border: 'rgb(var(--color-border))',
        active: 'rgb(var(--color-active))',
      },
      ringColor: {
        primary: "rgb(var(--color-primary))",
      },
    },
  },
  plugins: [],
};