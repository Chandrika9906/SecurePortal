export const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border border-slate-200 p-6 animate-pulse shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-200" />
      <div className="w-16 h-5 rounded-full bg-slate-200" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
      <div className="h-3 w-16 bg-slate-100 rounded" />
      <div className="h-3 w-12 bg-slate-100 rounded" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse border-b border-slate-100">
    <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-1/5" />
    </div>
    <div className="h-4 w-16 bg-slate-100 rounded" />
    <div className="h-4 w-20 bg-slate-100 rounded" />
    <div className="flex gap-2">
      <div className="h-8 w-16 rounded-xl bg-slate-100" />
      <div className="h-8 w-16 rounded-xl bg-slate-100" />
    </div>
  </div>
);

export const SkeletonStat = () => (
  <div className="rounded-2xl bg-white border border-slate-200 p-6 animate-pulse shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 w-24 bg-slate-200 rounded" />
      <div className="w-9 h-9 rounded-xl bg-slate-200" />
    </div>
    <div className="h-8 w-16 bg-slate-200 rounded mb-1" />
    <div className="h-3 w-32 bg-slate-100 rounded" />
  </div>
);
