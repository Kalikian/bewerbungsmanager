// apps/frontend/app/applications/[id]/page.tsx
import ApplicationShow from "@/components/applications/table/application-show";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;           
  return <ApplicationShow id={Number(id)} />;
}