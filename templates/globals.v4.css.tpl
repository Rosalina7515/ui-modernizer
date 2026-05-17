@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --radius: 0.5rem;

  /* Default accent — replaced by detect-brand.mjs output if a brand color is found */
  --color-accent-500: oklch(0.65 0.22 270);
  --color-accent-600: oklch(0.58 0.24 270);
  --color-accent-700: oklch(0.50 0.22 270);
}

@layer base {
  html { -webkit-font-smoothing: antialiased; }
  body {
    @apply min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  ::selection { @apply bg-indigo-500/20; }
  :focus-visible {
    @apply outline-none ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950;
  }
}
