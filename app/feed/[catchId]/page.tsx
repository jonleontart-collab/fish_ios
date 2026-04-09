import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { CatchComments } from "@/components/CatchComments";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getCatchPostData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{ feed: string }> = {
  ru: { feed: "Лента" },
  en: { feed: "Feed" },
  es: { feed: "Feed" },
  fr: { feed: "Feed" },
  pt: { feed: "Feed" },
};

export default async function CatchPostPage({
  params,
}: {
  params: Promise<{ catchId: string }>;
}) {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const { catchId } = await params;
  const data = await getCatchPostData(catchId);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      <div className="sticky top-0 z-[100] flex items-center border-b border-white/5 bg-background/80 px-4 py-4 pt-safe backdrop-blur-xl">
        <Link href="/feed" className="flex items-center gap-2 text-[15px] font-semibold text-text-main transition-colors hover:text-primary">
          <ArrowLeft size={20} />
          <span>{t.feed}</span>
        </Link>
      </div>

      <div className="w-full max-w-2xl flex-1 pt-4">
        <CatchCard catchItem={data.catchItem} showUser showActions />

        <div className="mt-2">
          <CatchComments catchId={data.catchItem.id} comments={data.catchItem.comments} />
        </div>
      </div>
    </div>
  );
}
