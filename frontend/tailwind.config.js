import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                primary: {
                  DEFAULT: "var(--primary)",
                  foreground: "var(--primary-foreground)",
                },
                secondary: {
                  DEFAULT: "var(--secondary)",
                  foreground: "var(--secondary-foreground)",
                },
                destructive: {
                  DEFAULT: "var(--destructive)",
                  foreground: "var(--destructive-foreground)",
                },
                muted: {
                  DEFAULT: "var(--muted)",
                  foreground: "var(--muted-foreground)",
                },
                accent: {
                  DEFAULT: "var(--accent)",
                  foreground: "var(--accent-foreground)",
                },
                popover: {
                  DEFAULT: "var(--popover)",
                  foreground: "var(--popover-foreground)",
                },
                card: {
                  DEFAULT: "var(--card)",
                  foreground: "var(--card-foreground)",
                },
                sidebar: {
                  DEFAULT: "var(--sidebar)",
                  foreground: "var(--sidebar-foreground)",
                  primary: "var(--sidebar-primary)",
                  "primary-foreground": "var(--sidebar-primary-foreground)",
                  accent: "var(--sidebar-accent)",
                  "accent-foreground": "var(--sidebar-accent-foreground)",
                  border: "var(--sidebar-border)",
                  ring: "var(--sidebar-ring)",
                },
              },
            fontFamily: {
                sans: ['Fredoka', 'Inter', ...defaultTheme.fontFamily.sans],
                fredoka: ['Fredoka', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms, require("@tailwindcss/typography")],
};
