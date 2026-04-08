export default function Loading() {
  return (
    <div className="space-y-4 px-4 pb-8 pt-safe">
      <div className="h-8 w-32 animate-pulse rounded-full bg-white/6" />
      <div className="glass-panel h-56 animate-pulse rounded-[32px] border border-border-subtle" />
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel h-36 animate-pulse rounded-[28px] border border-border-subtle" />
        <div className="glass-panel h-36 animate-pulse rounded-[28px] border border-border-subtle" />
      </div>
      <div className="glass-panel h-56 animate-pulse rounded-[28px] border border-border-subtle" />
    </div>
  );
}
