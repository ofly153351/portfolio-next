import AOSProvider from "../../components/ui/AOSProvider";
import WorksCta from "../../components/sections/works/WorksCta";
import WorksFilterBar from "../../components/sections/works/WorksFilterBar";
import WorksFooter from "../../components/sections/works/WorksFooter";
import WorksHeader from "../../components/sections/works/WorksHeader";
import WorksProjectGrid from "../../components/sections/works/WorksProjectGrid";
import WorksTopNav from "../../components/sections/works/WorksTopNav";

export default function WorksPage() {
  return (
    <div className="ambient-root bg-[#131313] text-[#e5e2e1] selection:bg-[#d2bbff]/30">
      <div className="ambient-glow-layer">
        <div className="ambient-glow ambient-glow--purple" />
        <div className="ambient-glow ambient-glow--blue" />
      </div>

      <div className="ambient-content">
        <AOSProvider />
        <WorksTopNav />

        <main className="relative overflow-hidden pb-24 pt-32">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-full -translate-x-1/2 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed] via-transparent to-transparent blur-[120px]" />
          </div>

          <WorksHeader />
          <WorksFilterBar />
          <WorksProjectGrid />
          <WorksCta />
        </main>

        <WorksFooter />
      </div>
    </div>
  );
}
