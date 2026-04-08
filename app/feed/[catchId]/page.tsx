import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CatchCard } from "@/components/CatchCard";
import { CatchComments } from "@/components/CatchComments";
import { getCatchPostData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CatchPostPage({
  params,
}: {
  params: Promise<{ catchId: string }>;
}) {
  const { catchId } = await params;
  const data = await getCatchPostData(catchId);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-[100] bg-background/80 backdrop-blur-xl border-b border-white/5 py-4 px-4 flex items-center pt-safe">
        <Link href="/feed" className="flex items-center gap-2 text-[15px] font-semibold text-text-main hover:text-primary transition-colors">
          <ArrowLeft size={20} />
          <span>Лента</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full pt-4">
        {/* We pass showActions=true so engagement bar sits below the card */}
        <CatchCard catchItem={data.catchItem} showUser={true} showActions={true} />

        <div className="mt-2">
          <CatchComments catchId={data.catchItem.id} comments={data.catchItem.comments} />
        </div>
      </div>
    </div>
  );
}
