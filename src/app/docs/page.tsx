import DocsHero from "@/app/components/docs/DocsHero";
import DocsNav from "@/app/components/docs/DocsNav";
import SrsSummarySection from "@/app/components/docs/SrsSummarySection";
import DataModelSection from "@/app/components/docs/DataModelSection";
import WireframesSection from "@/app/components/docs/WireframesSection";
import DocsTechStackSection from "@/app/components/docs/DocsTechStackSection";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";

export default function DocsPage() {
  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen">
      <Navbar />
      <DocsHero />
      <DocsNav />
      <SrsSummarySection />
      <DataModelSection />
      <WireframesSection />
      <DocsTechStackSection />
      <Footer />
    </div>
  );
}
