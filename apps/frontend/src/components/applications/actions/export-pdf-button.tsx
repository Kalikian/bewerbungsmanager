"use client";

import { Button } from "@/components/ui/button";
import {
  exportApplicationsPdf,
  type ApplicationPdfRow,
} from "@/lib/applications/export-applications-pdf";

type Props = { rows: ApplicationPdfRow[]; disabled?: boolean };

export default function ExportApplicationsPdfButton({ rows, disabled }: Props) {
  const isDisabled = disabled ?? rows.length === 0;

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isDisabled}
      onClick={async () => {
        await exportApplicationsPdf(rows);
      }}
    >
      Export PDF
    </Button>
  );
}
