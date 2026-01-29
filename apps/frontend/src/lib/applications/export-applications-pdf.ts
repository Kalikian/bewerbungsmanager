export type ApplicationPdfRow = {
  jobTitle: string;
  company: string;
  appliedAt: string;
};

export async function exportApplicationsPdf(rows: ApplicationPdfRow[]) {
  // English comment: Dynamic imports avoid SSR/bundler issues in Next.js
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  doc.setFontSize(14);
  doc.text("Applications", 40, 40);

  const body = rows.map((r, i) => [String(i + 1), r.jobTitle, r.company, r.appliedAt]);

  autoTable(doc, {
    startY: 60,
    head: [["#", "Job Title", "Company", "Applied"]],
    body,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 6, valign: "top", overflow: "linebreak" },
    headStyles: { fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 28, halign: "right" },
      1: { cellWidth: 240 },
      2: { cellWidth: 180 },
      3: { cellWidth: 90, halign: "right" },
    },
  });

  doc.save(`applications_${new Date().toISOString().slice(0, 10)}.pdf`);
}
