import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import site from "@/data/site.json";
import SmoothScroll from "@/components/SmoothScroll";
import ParticleField from "@/components/ParticleField";
import CursorGlow from "@/components/CursorGlow";
import CursorLens from "@/components/CursorLens";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetmono",
  subsets: ["latin"],
});

export const metadata = {
  title: site.meta.title,
  description: site.meta.description,
  keywords: site.meta.keywords,
};

export const viewport = {
  themeColor: site.theme.colors.bg,
};

function themeVars() {
  const c = site.theme.colors;
  return {
    "--bg": c.bg,
    "--surface": c.surface,
    "--surface-raised": c.surfaceRaised,
    "--text": c.text,
    "--text-dim": c.textDim,
    "--text-faint": c.textFaint,
    "--accent": c.accent,
    "--accent-dim": c.accentDim,
    "--accent-faint": c.accentFaint,
    "--border": c.border,
    "--border-bright": c.borderBright,
    "--grain-opacity": site.theme.grainOpacity,
    "--marquee-duration": `${site.theme.marqueeSeconds}s`,
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      style={themeVars()}
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-bg text-text">
        <SmoothScroll />
        <ParticleField />
        <CursorGlow />
        <CursorLens />
        <div className="grain" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
