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
import Circuits from "@/components/Circuits";
import Gamification from "@/components/Gamification";

const SECTIONS = {
  hero: Hero,
  marquee: Marquee,
  circuits: Circuits,
  about: About,
  experience: Experience,
  projects: Projects,
  skills: Skills,
  education: Education,
  contact: Contact,
};

// strip a trailing "-2", "-3", … so the same section type can appear twice
const baseKey = (key) => key.replace(/-\d+$/, "");

// decorative sections aren't numbered; content sections get 01, 02, …
const UNNUMBERED = ["hero", "marquee", "circuits"];

export default function Home() {
  const order = site.sections.order;
  const numbered = order.filter((key) => !UNNUMBERED.includes(baseKey(key)));
  return (
    <main>
      <Preloader />
      <Nav />
      <Gamification />
      {order.map((key) => {
        const Section = SECTIONS[baseKey(key)];
        if (!Section) return null;
        const n = numbered.indexOf(key);
        return (
          <Section
            key={key}
            index={n === -1 ? undefined : String(n + 1).padStart(2, "0")}
            flip={key !== baseKey(key)}
          />
        );
      })}
    </main>
  );
}
