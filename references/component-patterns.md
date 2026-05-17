# Component Patterns — modern templates

Use these as the target shape when modernizing each component. Copy structure and Tailwind classes; preserve the original component's props, types, and logic.

## Button

```tsx
<button
  className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
>
  {children}
</button>
```

Secondary:
```tsx
className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 shadow-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
```

Ghost:
```tsx
className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
```

## Card

```tsx
<div className="rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-shadow hover:shadow-md">
  <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h3>
  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
</div>
```

## Input

```tsx
<input
  className="block w-full rounded-md border-0 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-shadow"
/>
```

Label + input wrapper:
```tsx
<div className="space-y-1.5">
  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</label>
  <input className="..." />
  <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
</div>
```

## Top navigation (sticky, with glass)

```tsx
<header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/60 dark:border-zinc-800/60">
  <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" />
      <span className="text-sm font-semibold tracking-tight">{appName}</span>
    </div>
    <nav className="flex items-center gap-1">
      {/* nav items with ghost-button styling */}
    </nav>
  </div>
</header>
```

## Sidebar item

```tsx
<a className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 aria-[current=page]:bg-zinc-100 dark:aria-[current=page]:bg-zinc-900 aria-[current=page]:text-zinc-900 dark:aria-[current=page]:text-zinc-100">
  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
  {label}
</a>
```

## Modal / Dialog

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
  <div className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
  <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 p-6 shadow-xl ring-1 ring-zinc-900/5 animate-in fade-in zoom-in-95 duration-200">
    {/* content */}
  </div>
</div>
```

## Badge

```tsx
<span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20">
  {label}
</span>
```

## Hero section

```tsx
<section className="relative overflow-hidden">
  <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> {pill}
    </div>
    <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
      {title}
    </h1>
    <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
      {subtitle}
    </p>
    <div className="mt-10 flex items-center justify-center gap-3">
      {/* primary + secondary button */}
    </div>
  </div>
  {/* optional ambient gradient blob */}
  <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[80rem] rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl" />
</section>
```

## Skeleton

```tsx
<div className="animate-pulse">
  <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
  <div className="mt-2 h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
</div>
```

## Empty state

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 grid place-items-center">
    <Icon className="h-5 w-5 text-zinc-500" />
  </div>
  <h3 className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">{description}</p>
</div>
```
