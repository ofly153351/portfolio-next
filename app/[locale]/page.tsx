import FloatingChatButton from "../components/ai/FloatingChatButton";
import SiteFooter from "../components/layout/SiteFooter";
import SiteNavbar from "../components/layout/SiteNavbar";
import ArchitectureSection from "../components/sections/ArchitectureSection";
import LandingIntroClient from "../components/sections/LandingIntroClient";
import AOSProvider from "../components/ui/AOSProvider";

type HomePageProps = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function HomePage({ params }: HomePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale?.startsWith("th") ? "th" : "en";

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
          <LandingIntroClient locale={locale} />
          <ArchitectureSection />
          <SiteFooter />
        </main>
        <FloatingChatButton />
      </div>
    </div>
  );
}
