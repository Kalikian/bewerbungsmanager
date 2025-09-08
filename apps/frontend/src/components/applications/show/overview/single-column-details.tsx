// apps/frontend/components/applications/show/overview/SingleColumnDetails.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Mail, Phone, Copy, ExternalLink, Link as LinkIcon } from "lucide-react";
import { copyToClipboard } from "@/lib/browser/clipboard";

export default function SingleColumnDetails({
  address,
  contactName,
  contactEmail,
  contactPhone,
  jobUrl,
}: {
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  jobUrl?: string;
}) {
  // Render a single "Details" section with rows stacked vertically (no separate cards)
  if (!address && !contactName && !contactEmail && !contactPhone && !jobUrl) return null;

  const Row = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
    <div className="grid grid-cols-[120px_1fr] items-start gap-x-4 gap-y-1 text-sm md:text-[15px]">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 leading-relaxed">{children}</dd>
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="mb-3 text-base font-semibold">Details</h2>
      <dl className="space-y-3">
        {/* Contact */}
        {(contactName || contactEmail || contactPhone) && (
          <Row label="Contact">
            <div className="space-y-1">
              {contactName && <div className="font-medium">{contactName}</div>}
              {contactEmail && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-foreground/90">
                    <Mail className="h-4 w-4 opacity-70" />
                    <a
                      className="truncate underline-offset-2 hover:underline"
                      href={`mailto:${contactEmail}`}
                    >
                      {contactEmail}
                    </a>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(contactEmail)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-foreground/90">
                    <Phone className="h-4 w-4 opacity-70" />
                    <a
                      className="truncate underline-offset-2 hover:underline"
                      href={`tel:${contactPhone}`}
                    >
                      {contactPhone}
                    </a>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(contactPhone)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </Row>
        )}

        {/* Address */}
        {address && (
          <Row label="Address">
            <div className="flex items-start gap-2 text-foreground/90">
              <MapPin className="mt-0.5 h-4 w-4 opacity-70" />
              <span className="whitespace-pre-wrap">{address}</span>
            </div>
          </Row>
        )}

        {/* Job link */}
        {jobUrl && (
          <Row label="Job link">
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 underline-offset-2 hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="truncate">{jobUrl}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </Row>
        )}
      </dl>
    </section>
  );
}