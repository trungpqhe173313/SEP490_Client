import Hero from "@/components/HomePage/hero";
import CallToAction from "@/components/HomePage/cta";
import Feature from "@/components/HomePage/feature";
import AboutUs from "@/components/HomePage/aboutUs";
import Statistic from "@/components/HomePage/statistic";

export const metadata = {
  title: "NutriBarn",
};

export default function Home() {
  return (
    <div>
      <Hero />
      <Feature />
      <Statistic />
      <AboutUs />
      <CallToAction />
    </div>
  );
}
