import Image from "next/image";
import {
  Bot,
  BriefcaseBusiness,
  ClipboardCheck,
  FileSearch,
  FolderSearch,
  Gauge,
  Settings,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const navGroups = [
  {
    label: "Investigation",
    items: [
      { label: "Review Queue", icon: ClipboardCheck, active: true, count: "6" },
      { label: "My Cases", icon: BriefcaseBusiness },
      { label: "All Cases", icon: FolderSearch },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Signal Library", icon: Gauge },
      { label: "Evidence Patterns", icon: FileSearch },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Workflows", icon: Workflow },
      { label: "Safe Replies", icon: Bot },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Policy Controls", icon: ShieldCheck },
      { label: "Settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  return (
    <aside className="border-b border-white/10 bg-[#020713] px-4 py-5 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-white/10">
      <div className="relative h-12 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#020713] lg:w-full">
        <Image
          className="object-cover object-center"
          src="/claimguard-logo.png"
          alt="ClaimGuard"
          fill
          priority
          unoptimized
          sizes="200px"
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--cg-text-muted)]">Evidence. Intelligence. Trust.</p>

      <nav className="mt-7 grid gap-5 sm:grid-cols-2 lg:block lg:space-y-6">
        {navGroups.map((group) => (
          <section key={group.label}>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cg-text-muted)]">
              {group.label}
            </p>
            <div className="mt-2 space-y-1.5">
              {group.items.map((item) => (
                <a
                  href="#"
                  className={`group flex items-center justify-between rounded-lg border px-2.5 py-2 text-sm transition ${
                    item.active
                      ? "border-[var(--cg-border-strong)] bg-[rgba(24,183,255,0.13)] text-white"
                      : "border-transparent text-[var(--cg-text-muted)] hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  }`}
                  key={item.label}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon
                      className={`size-4 ${item.active ? "text-[var(--cg-cyan)]" : "text-[var(--cg-text-muted)] group-hover:text-[var(--cg-cyan)]"}`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </span>
                  {item.count ? (
                    <span className="rounded-md bg-[var(--cg-blue)] px-1.5 py-0.5 text-xs font-bold text-[#02111f]">
                      {item.count}
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="mt-8 hidden border-t border-white/10 pt-5 lg:block">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-[rgba(24,183,255,0.14)] font-semibold text-white ring-1 ring-[var(--cg-border)]">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Jordan Davis</p>
            <p className="text-xs text-[var(--cg-text-muted)]">Support Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
