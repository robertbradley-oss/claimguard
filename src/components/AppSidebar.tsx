import Image from "next/image";
import { LayoutDashboard } from "lucide-react";

export function AppSidebar() {
  return (
    <aside className="flex min-h-full w-full flex-col bg-[#020B18] px-4 py-5 text-white lg:w-52">
      <div className="px-1">
        <div className="relative h-14 w-full overflow-hidden rounded-lg bg-[#020B18]">
          <Image
            className="object-cover object-center"
            src="/claimguard-logo.png"
            alt="ClaimGuard"
            fill
            priority
            unoptimized
            sizes="180px"
          />
        </div>
        <p className="mt-2 text-xs font-medium text-[#D9ECF8]/64">Claim authenticity review</p>
      </div>

      <nav className="mt-7 space-y-1.5">
        <a
          href="#"
          className="relative flex items-center gap-3 rounded-md bg-white/[0.075] px-3 py-2.5 text-sm font-medium text-white shadow-[inset_1px_0_0_rgba(25,211,243,0.95)] before:absolute before:left-0 before:top-2 before:h-6 before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-[#19D3F3] before:to-[#41D66F]"
        >
          <LayoutDashboard className="size-4 text-[#19D3F3]" aria-hidden="true" />
          Dashboard
        </a>
      </nav>

      <div className="mt-auto h-px bg-white/10" />
    </aside>
  );
}
