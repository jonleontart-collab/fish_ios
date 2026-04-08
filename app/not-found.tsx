import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="glass-panel max-w-sm rounded-[32px] border border-border-subtle p-8">
        <div className="text-sm text-text-muted">404</div>
        <h1 className="mt-3 font-display text-3xl font-semibold text-text-main">
          Страница не найдена
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          Возможно, место было удалено или ссылка устарела. Вернись к карте или на главный экран.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="flex-1 rounded-[18px] bg-primary px-4 py-3 text-center font-semibold text-background"
          >
            Главная
          </Link>
          <Link
            href="/explore"
            className="flex-1 rounded-[18px] border border-border-subtle px-4 py-3 text-center font-semibold text-text-main"
          >
            Карта
          </Link>
        </div>
      </div>
    </div>
  );
}
