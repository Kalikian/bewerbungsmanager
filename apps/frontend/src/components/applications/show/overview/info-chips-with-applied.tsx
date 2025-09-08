// apps/frontend/components/applications/show/overview/InfoChipsWithApplied.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Euro, Globe, Laptop } from "lucide-react";
import { formatMoney } from "@/lib/format";

export type InfoChipsWithAppliedProps = {
  salary?: number | string;
  source?: string;
  workModel?: string;
  appliedText?: string | null;
};

export default function InfoChipsWithApplied({
  salary,
  source,
  workModel,
  appliedText,
}: InfoChipsWithAppliedProps) {
  const money = formatMoney(salary, "EUR");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {money && (
          <Badge variant="outline" className="h-8 gap-1 rounded-full px-3 text-[13px]">
            <Euro className="h-4 w-4" /> {money}
          </Badge>
        )}
        {source && (
          <Badge variant="outline" className="h-8 gap-1 rounded-full px-3 text-[13px]">
            <Globe className="h-4 w-4" /> {source}
          </Badge>
        )}
        {workModel && (
          <Badge variant="outline" className="h-8 gap-1 rounded-full px-3 text-[13px]">
            <Laptop className="h-4 w-4" /> {workModel}
          </Badge>
        )}
        {appliedText && <span className="ml-2 text-xs text-muted-foreground">{appliedText}</span>}
      </div>
      <Separator className="mt-3" />
    </div>
  );
}
