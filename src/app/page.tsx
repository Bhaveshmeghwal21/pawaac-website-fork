import Footer from "@/components/layout/Footer";
import HomeContactBand from "@/components/sections/HomeContactBand";
import HomeDeploymentsPreview from "@/components/sections/HomeDeploymentsPreview";
import HomeHero from "@/components/sections/HomeHero";
import HomeOperatingLoop from "@/components/sections/HomeOperatingLoop";
import HomePlannerCTA from "@/components/sections/HomePlannerCTA";
import HomeSpecSheet from "@/components/sections/HomeSpecSheet";

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeOperatingLoop />
      <HomeSpecSheet />
      <HomeDeploymentsPreview />
      <HomePlannerCTA />
      <HomeContactBand />
      <Footer compact />
    </>
  );
}
