import Image from "next/image";

import { withBasePath } from "@/lib/app-paths";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  notes?: string | null;
  imagePath?: string | null;
};

export function ProfileInventoryShowcase({
  title,
  subtitle,
  emptyLabel,
  items,
  action,
}: {
  title: string;
  subtitle?: string;
  emptyLabel: string;
  items: InventoryItem[];
  action?: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {subtitle ? (
            <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-text-muted">
              {subtitle}
            </div>
          ) : null}
          <div className="mt-1 text-[22px] font-semibold tracking-tight text-text-main">{title}</div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-[22px] border border-border-subtle bg-white/4 p-3.5"
            >
              {item.imagePath ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-white/8 bg-black/30">
                  <Image src={withBasePath(item.imagePath)} alt={item.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-white/8 bg-black/20 text-[11px] font-semibold text-text-muted">
                  Gear
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-text-main">{item.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="rounded-full bg-white/6 px-2.5 py-1">{item.category}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                    {item.quantity} pcs
                  </span>
                </div>
                {item.notes ? (
                  <div className="mt-2 line-clamp-2 text-sm leading-6 text-text-soft">{item.notes}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
          {emptyLabel}
        </div>
      )}
    </section>
  );
}
