import FloatingChatButton from "../components/ai/FloatingChatButton";
import SiteFooter from "../components/layout/SiteFooter";
import SiteNavbar from "../components/layout/SiteNavbar";
import ArchitectureSection from "../components/sections/ArchitectureSection";
import HeroSection from "../components/sections/HeroSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import SkillsSection from "../components/sections/SkillsSection";
import AOSProvider from "../components/ui/AOSProvider";

export default function HomePage() {
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
          <HeroSection />
          <SkillsSection />
          <ProjectsSection />
          <ArchitectureSection />
          <SiteFooter />
        </main>
        <FloatingChatButton />
      </div>
    </div>
  );
}
