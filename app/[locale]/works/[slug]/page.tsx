import FloatingChatButton from "../../../components/ai/FloatingChatButton";
import SiteFooter from "../../../components/layout/SiteFooter";
import SiteNavbar from "../../../components/layout/SiteNavbar";
import AOSProvider from "../../../components/ui/AOSProvider";
import WorksCaseDetail from "../../../components/sections/works/case-study/WorksCaseDetail";

export default async function WorkSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="ambient-root selection:bg-[#7c3aed]/30">
      <div className="ambient-glow-layer">
        <div className="ambient-glow ambient-glow--purple" />
        <div className="ambient-glow ambient-glow--blue" />
      </div>

      <div className="ambient-content">
      <AOSProvider />
        <SiteNavbar />
        <main className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-32 md:px-8">
          <WorksCaseDetail slug={slug} />
          <SiteFooter />
        </main>
        <FloatingChatButton />
      </div>
    </div>
  );
}
