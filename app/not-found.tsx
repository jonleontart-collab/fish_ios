import Link from "next/link";

import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";

const translations: TranslationMap<{
  title: string;
  description: string;
  home: string;
  map: string;
}> = {
  ru: {
    title: "Страница не найдена",
    description: "Возможно, место было удалено или ссылка устарела. Вернись к карте или на главный экран.",
    home: "Главная",
    map: "Карта",
  },
  en: {
    title: "Page not found",
    description: "The spot may have been removed or the link is outdated. Go back to the map or the home screen.",
    home: "Home",
    map: "Map",
  },
  es: {
    title: "Página no encontrada",
    description: "Puede que el lugar haya sido eliminado o que el enlace esté desactualizado. Vuelve al mapa o al inicio.",
    home: "Inicio",
    map: "Mapa",
  },
  fr: {
    title: "Page introuvable",
    description: "Le spot a peut-être été supprimé ou le lien est obsolète. Revenez à la carte ou à l'accueil.",
    home: "Accueil",
    map: "Carte",
  },
  pt: {
    title: "Página não encontrada",
    description: "O local pode ter sido removido ou o link está desatualizado. Volte ao mapa ou à tela inicial.",
    home: "Início",
    map: "Mapa",
  },
};

export default async function NotFound() {
  const lang = await getServerLanguage();
  const t = translations[lang];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="glass-panel max-w-sm rounded-[32px] border border-border-subtle p-8">
        <div className="text-sm text-text-muted">404</div>
        <h1 className="mt-3 font-display text-3xl font-semibold text-text-main">{t.title}</h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">{t.description}</p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="flex-1 rounded-[18px] bg-primary px-4 py-3 text-center font-semibold text-background">
            {t.home}
          </Link>
          <Link href="/explore" className="flex-1 rounded-[18px] border border-border-subtle px-4 py-3 text-center font-semibold text-text-main">
            {t.map}
          </Link>
        </div>
      </div>
    </div>
  );
}
