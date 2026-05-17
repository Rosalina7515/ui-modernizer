export default function Page() {
  const stats = [
    { label: 'Revenue', value: '$12,430', delta: '+8.4%' },
    { label: 'Active users', value: '1,284', delta: '+2.1%' },
    { label: 'Sign-ups', value: '243', delta: '+12%' },
  ];
  const tasks = [
    { id: 1, title: 'Review onboarding flow', done: true },
    { id: 2, title: 'Fix billing page bug', done: false },
    { id: 3, title: 'Ship Q3 roadmap doc', done: false },
  ];

  return (
    <div className="relative">
      {/* ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[28rem] w-[60rem] rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl"
      />

      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" />
            <span className="text-sm font-semibold tracking-tight">Acme</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Docs
            </button>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-rose-400 to-indigo-500 ring-2 ring-white dark:ring-zinc-950" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems normal
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Welcome back, Alex.</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 shadow-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              Export
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98]">
              <span>+ New task</span>
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-shadow hover:shadow-md"
            >
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{s.delta}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-xl bg-white dark:bg-zinc-950 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-base font-semibold tracking-tight">Tasks</h2>
            <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4">View all</button>
          </div>
          <ul className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">{t.title}</span>
                <span
                  className={
                    t.done
                      ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20'
                      : 'inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800'
                  }
                >
                  {t.done ? 'Done' : 'Open'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
