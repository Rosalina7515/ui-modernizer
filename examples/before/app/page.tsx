export default function Page() {
  const stats = [
    { label: 'Revenue', value: '$12,430' },
    { label: 'Active users', value: '1,284' },
    { label: 'Sign-ups', value: '243' },
  ];
  const tasks = [
    { id: 1, title: 'Review onboarding flow', done: true },
    { id: 2, title: 'Fix billing page bug', done: false },
    { id: 3, title: 'Ship Q3 roadmap doc', done: false },
  ];

  return (
    <div className="p-4">
      <header className="border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-base text-gray-600">Welcome back, Alex.</p>
      </header>

      <section className="grid grid-cols-3 gap-2 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-600">{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-bold mb-2">Tasks</h2>
        <ul>
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between border-b border-gray-200 py-2">
              <span>{t.title}</span>
              <span className={t.done ? 'text-green-500' : 'text-red-500'}>{t.done ? 'Done' : 'Open'}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">New task</button>
        <button className="border border-gray-300 px-4 py-2 rounded">Export</button>
      </div>
    </div>
  );
}
