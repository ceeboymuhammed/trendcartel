import { MarketIntelligence } from "@/types/discovery";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  market: string;
  tag: string;
  intelligence: MarketIntelligence;
  badgeColor: string;
  topic: string;
}

export default function OpportunityCard({ market, tag, intelligence, badgeColor, topic }: Props) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className={`text-xs font-bold ${badgeColor} uppercase tracking-wider`}>
            {market}
          </span>
          <span className="text-[11px] text-slate-400">{tag}</span>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-semibold mb-2">Competing Paid Products</div>
          <div className="space-y-2">
            {intelligence.competitorProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-200">{p.title}</span>
                <span className={`font-mono font-semibold ${badgeColor}`}>{p.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-semibold mb-2">Unfiltered Pain Points & Questions</div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {intelligence.rawForumQuestions.map((q, i) => (
              <li key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800/40 text-xs">
                {q}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-slate-800/60">
          <div className="text-[11px] text-slate-500">Recommended Product Angle</div>
          <div className="text-xs text-slate-200 font-medium mt-0.5">{intelligence.winningAngle}</div>
        </div>
      </div>

      <Link
        href={`/dashboard/monetisation?topic=${encodeURIComponent(topic)}&angle=${encodeURIComponent(intelligence.winningAngle)}`}
        className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition"
      >
        Generate Product for this Angle
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}