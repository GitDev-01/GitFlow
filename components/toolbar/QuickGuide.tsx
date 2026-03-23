
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Puzzle,
  Bell,
  Settings,
  ArrowRight,
  CheckCircle2,
  Play,
  PanelRightDashedIcon,
  ArrowUpDownIcon,
  TextInitialIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GuideTab {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  steps: string[];
  cta: string;
}

const GUIDE_TABS: GuideTab[] = [
  {
    id: "start-end",
    icon: Play,
    label: "Start And End Nodes",
    badge: "",
    title: "Start and End Nodes",
    subtitle: "Starting a Flow",
    image: "/assets/full-flow.jpeg",
    description:
      "Start and End Nodes are special nodes required in every flow.",
    steps: [
      "Start Nodes can only have 1 edge connecting to any other node",
      "End Nodes can have any number of edge",
      "All flows should always begin with a start node then end with ann end node ",
    ],
    cta: "",
  },
  {
    id: "required-properties",
    icon: PanelRightDashedIcon,
    label: "Requird Properties",
    title: "Required Properties",
    subtitle: "The requried properties of nodes within a flow",
    image: "/assets/node-properties.jpeg",
    description:
      "Each node has properties. In GitLab Duo some properties are mandatory e.g. name or prompt id.",
    steps: [
      "All required properties are signified by the '(required)' symbol.",
      "Always check the properties of nodes before exporting.",
      "Assign roles: Admin, Editor, or Viewer",
    ],
    cta: "",
  },
  {
    id: "prompters",
    icon: TextInitialIcon,
    label: "Prompters",
    badge: "",
    title: "Agents and Prompters",
    subtitle: "Adding prompts to GitFlow",
    image: "/assets/prompter-flow.jpeg",
    description:
      "Prompters are special nodes with no edges. They contain information about an agents system prompt and user prompt.",
    steps: [
      "All prompters must have unique prompt id's",
      "Only AgentComponent and OneOffComponent can use prompters (linked by the same prompt id's)",
      "GitLab flow variables e.g. {{user_request}} can be used in prompters.",
      "Variables can be created from the 'inputs' properties alias e.g. alias: 'goal' => {{goal}} "
    ],
    cta: "",
  },
  {
    id: "import-and-export",
    icon: ArrowUpDownIcon,
    label: "Import and Export",
    title: "Import and Export",
    subtitle: "Importing and exporting flows into GitFlow",
    image: "/assets/export-dialog.jpeg",
    description:
      "In GitLab flows are represented in yaml, GitFlow imports yaml text, translates it to graphical nodes, then exports as yaml text.",
    steps: [
      "GitFlow is designed to follow GitLab's rules behind flows.",
      "GitLab's interface validates yaml during flow creation, use that as first contact during exporting errors.",
      "GitFlow validates all imported flows before graph translation. You will be notified of any configuration issue during this process.",
    ],
    cta: "",
  },
//   {
//     id: "settings",
//     icon: Settings,
//     label: "Settings",
//     title: "Customize everything",
//     subtitle: "Tailor the experience to fit you perfectly.",
//     image: "/images/guide-settings.jpg",
//     description:
//       "From appearance and language to security and billing, the Settings panel puts you in full control. Enable two-factor authentication, manage API keys, and configure SSO — all from one clean interface.",
//     steps: [
//       "Click your avatar → Settings",
//       "Update profile, timezone, and appearance",
//       "Enable 2FA under Security for extra protection",
//     ],
//     cta: "Open Settings",
//   },
];

interface QuickGuidesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickGuidesDialog({
  open,
  onOpenChange,
}: QuickGuidesDialogProps) {
  const [activeTab, setActiveTab] = useState(GUIDE_TABS[0].id);

  const active = GUIDE_TABS.find((t) => t.id === activeTab)!;
  const Icon = active.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="w-[900px] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] p-0 gap-0 overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
        <div className="flex h-[580px]">
          {/* ── Left sidebar ── */}
          <aside className="w-52 shrink-0 bg-guide-sidebar border-r border-border/60 flex flex-col py-5 px-3 gap-1">
            <DialogHeader className="px-2 pb-4">
              <DialogTitle className="text-sm font-semibold text-foreground tracking-wide uppercase">
                Quick Guides
              </DialogTitle>
            </DialogHeader>

            {GUIDE_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group relative",
                    isActive
                      ? "bg-guide-active text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-guide-hover hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-guide-accent rounded-r-full" />
                  )}
                  <TabIcon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive ? "text-guide-accent" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="text-sm font-medium truncate">{tab.label}</span>
                  {tab.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px] px-1.5 py-0 h-4 shrink-0 bg-guide-badge text-guide-badge-text"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}

            <div className="mt-auto px-2 pt-4 border-t border-border/40">
              {/* <p className="text-[11px] text-muted-foreground leading-relaxed">
                Need more help?{" "}
                <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  View full docs
                </a>
              </p> */}
            </div>
          </aside>

          {/* ── Right content ── */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Image */}
            <div className="relative h-56 shrink-0 overflow-hidden bg-muted">
              <Image
                src={active.image}
                alt={active.title}
                fill
                priority
                className="object-cover transition-all duration-500"
                sizes="(max-width: 900px) 100vw, 50px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-8 rounded-lg bg-guide-accent/20 backdrop-blur-sm border border-guide-accent/30">
                  <Icon className="size-4 text-guide-accent" />
                </span>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground text-balance">
                  {active.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
                  {active.subtitle}
                </p>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed text-pretty">
                {active.description}
              </p>

              {/* Steps */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  How to get started
                </p>
                <ol className="space-y-2">
                  {active.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-guide-accent" />
                      <span className="text-foreground/80 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                {GUIDE_TABS.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      tab.id === activeTab
                        ? "w-5 h-1.5 bg-guide-accent"
                        : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground"
                    )}
                    aria-label={`Go to ${tab.label} guide`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-sm"
                  onClick={() => onOpenChange(false)}
                >
                  Skip for now
                </Button>
                <Button
                  size="sm"
                  className="bg-guide-accent hover:bg-guide-accent/90 text-white gap-1.5 text-sm"
                  onClick={() => {
                    const currentIndex = GUIDE_TABS.findIndex(
                      (t) => t.id === activeTab
                    );
                    const next = GUIDE_TABS[currentIndex + 1];
                    if (next) {
                      setActiveTab(next.id);
                    } else {
                      onOpenChange(false);
                    }
                  }}
                >
                  {active.cta}
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
