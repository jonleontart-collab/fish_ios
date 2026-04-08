'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus, House, Layers3, MapPinned, MessagesSquare } from "lucide-react";

const items = [
  { href: "/", label: "Главная", icon: House },
  { href: "/feed", label: "Лента", icon: Layers3 },
  { href: "/add", label: "Улов", icon: CirclePlus, center: true },
  { href: "/explore", label: "Места", icon: MapPinned },
  { href: "/chats", label: "Чаты", icon: MessagesSquare },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/profile") || pathname.startsWith("/trips");
  }

  if (href === "/explore") {
    return pathname.startsWith("/explore") || pathname.startsWith("/places");
  }

  return pathname.startsWith(href);
}

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 pb-safe">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="glass-panel flex h-20 items-center justify-around rounded-[28px] border border-border-subtle px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item.href);

            if (item.center) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -top-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-background shadow-[0_16px_36px_rgba(103,232,178,0.34)] transition-transform active:scale-95"
                  aria-label={item.label}
                >
                  <Icon size={30} strokeWidth={2.25} />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-14 flex-col items-center gap-1 px-2 py-2 text-[11px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-text-muted"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.35 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
