import ApplicationSlimOverview from "@/components/applications/show/overview";

export default function ApplicationShowPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return <ApplicationSlimOverview id={id} />;
}
