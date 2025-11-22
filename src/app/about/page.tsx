import AboutHero from "@/app/components/about/AboutHero";
import ProblemStatement from "@/app/components/about/ProblemStatement";
import Objectives from "@/app/components/about/Objectives";
import IndustryImportance from "@/app/components/about/IndustryImportance";
import Footer from "@/app/components/landing/Footer";
import Navbar from "@/app/components/landing/Navbar";

export default function AboutPage() {
  return (
    <div className="bg-slate-950 text-slate-50">
      <Navbar />
      <AboutHero />
      <ProblemStatement />
      <Objectives />
      <IndustryImportance />
      <Footer />
    </div>
  );
}
