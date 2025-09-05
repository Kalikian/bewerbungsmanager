// apps/frontend/app/applications/[id]/page.tsx
import ApplicationShow from "@/components/applications/application-show";

export default function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return <ApplicationShow id={id} />;
}
