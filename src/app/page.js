import site from "@/data/site.json";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Education from "@/components/Education";
import Contact from "@/components/Contact";

const SECTIONS = {
  hero: Hero,
  marquee: Marquee,
  about: About,
  experience: Experience,
  projects: Projects,
  skills: Skills,
  education: Education,
  contact: Contact,
};

// hero & marquee aren't numbered; content sections get 01, 02, …
const UNNUMBERED = ["hero", "marquee"];

export default function Home() {
  const order = site.sections.order;
  const numbered = order.filter((key) => !UNNUMBERED.includes(key));
  return (
    <main>
      <Preloader />
      <Nav />
      {order.map((key) => {
        const Section = SECTIONS[key];
        if (!Section) return null;
        const n = numbered.indexOf(key);
        return (
          <Section
            key={key}
            index={n === -1 ? undefined : String(n + 1).padStart(2, "0")}
          />
        );
      })}
    </main>
  );
}
