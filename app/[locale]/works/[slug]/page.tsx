import AOSProvider from "../../../components/ui/AOSProvider";
import WorksCaseMock from "../../../components/sections/works/case-study/WorksCaseMock";

export default async function WorkSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <AOSProvider />
      <WorksCaseMock slug={slug} />
    </>
  );
}
