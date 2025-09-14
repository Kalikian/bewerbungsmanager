import type { ApplicationStatus } from "@shared";
import {
  CircleDashed,
  Send,
  Phone,
  XCircle,
  BadgeCheck,
  FileSignature,
  MinusCircle,
} from "lucide-react";

export const STATUS_META: Record<
  ApplicationStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    dotClassName: string;
  }
> = {
  open: {
    label: "Open",
    icon: CircleDashed,
    className: "bg-zinc-500/10 text-zinc-300 ring-1 ring-inset ring-zinc-500/30",
    dotClassName: "bg-zinc-400",
  },
  applied: {
    label: "Applied",
    icon: Send,
    className: "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/30",
    dotClassName: "bg-sky-400",
  },
  interview: {
    label: "Interview",
    icon: Phone,
    className: "bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/30",
    dotClassName: "bg-indigo-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/30",
    dotClassName: "bg-rose-400",
  },
  offer: {
    label: "Offer",
    icon: BadgeCheck,
    className: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
    dotClassName: "bg-emerald-400",
  },
  contract: {
    label: "Contract",
    icon: FileSignature,
    className: "bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-500/30",
    dotClassName: "bg-green-400",
  },
  withdrawn: {
    label: "Withdrawn",
    icon: MinusCircle,
    className: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
    dotClassName: "bg-amber-400",
  },
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "open",
  "applied",
  "interview",
  "offer",
  "contract",
  "withdrawn",
  "rejected",
];
