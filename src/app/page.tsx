import Image from "next/image";
import { ClaimReviewWorkflow } from "@/components/ClaimReviewWorkflow";

export default function Home() {
  return (
    <main className="min-h-screen text-[#061426]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-5 rounded-2xl border border-white/80 bg-white/72 px-5 py-4 shadow-[0_18px_50px_rgba(6,20,38,0.07)] backdrop-blur sm:flex-row sm:items-center sm:px-6">
          <div className="relative h-16 w-52 shrink-0 overflow-hidden rounded-xl bg-[#020B18] shadow-[0_12px_30px_rgba(2,11,24,0.12)] ring-1 ring-white/80">
            <Image
              className="object-cover object-center"
              src="/claimguard-logo.png"
              alt="ClaimGuard"
              fill
              priority
              unoptimized
              sizes="208px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#008F91]">
              Claim evidence review
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-[#061426] sm:text-[2.15rem]">
              Check evidence authenticity
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload claim evidence and generate a support-safe authenticity review.
            </p>
          </div>
        </header>

        <div className="flex flex-1 items-start justify-center pt-6 sm:pt-8 lg:pt-9">
          <ClaimReviewWorkflow />
        </div>
      </div>
    </main>
  );
}
