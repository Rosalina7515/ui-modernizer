@tailwind base;
@tailwind components;
@tailwind utilities;

/* ui-modernizer: design tokens (light + dark) */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --border: 240 5.9% 90%;
    --ring: 240 5% 64.9%;
    --primary: 238 84% 56%;          /* indigo-600 */
    --primary-foreground: 0 0% 100%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --border: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --primary: 234 89% 74%;          /* indigo-400 */
    --primary-foreground: 240 10% 3.9%;
  }

  html { -webkit-font-smoothing: antialiased; }
  body {
    @apply min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* nice default selection */
  ::selection { @apply bg-indigo-500/20; }

  /* focus visibility for keyboard users */
  :focus-visible {
    @apply outline-none ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950;
  }
}
