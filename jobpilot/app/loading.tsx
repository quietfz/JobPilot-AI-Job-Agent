export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="shimmer h-6 w-40 rounded-md" />
          <div className="shimmer mt-2.5 h-3 w-72 rounded-md" />
        </div>
        <div className="shimmer h-9 w-32 rounded-[10px]" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="shimmer h-8 w-8 rounded-lg" />
            <div className="shimmer mt-4 h-4 w-2/3 rounded" />
            <div className="shimmer mt-2 h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="card h-72 p-5">
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer mt-4 h-12 w-full rounded-lg" />
          <div className="shimmer mt-2 h-12 w-full rounded-lg" />
          <div className="shimmer mt-2 h-12 w-full rounded-lg" />
        </div>
        <div className="card h-72 p-5">
          <div className="shimmer h-4 w-24 rounded" />
          <div className="shimmer mt-4 h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
