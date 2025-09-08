import ApplicationSlimOverview from "@/components/applications/show/overview";

export default async function ApplicationShowPage({ params }: { params: Promise<{ id: string }>}) {
  const{ id }= await params;
  return <ApplicationSlimOverview id={Number(id)} />;
}
