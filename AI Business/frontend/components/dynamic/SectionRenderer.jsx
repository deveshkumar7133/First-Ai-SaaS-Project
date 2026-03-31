"use client";

import { previewCanvasStyle, themeVars } from "../../lib/siteTheme";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { ServicesSection } from "./sections/ServicesSection";
import { GallerySection } from "./sections/GallerySection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FaqSection } from "./sections/FaqSection";
import { ContactSection } from "./sections/ContactSection";
import { CtaSection } from "./sections/CtaSection";

const COMPONENTS = {
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  faq: FaqSection,
  contact: ContactSection,
  cta: CtaSection
};

function layoutStackClass(layout) {
  switch (layout) {
    case "grid":
      return "max-w-6xl mx-auto w-full space-y-10 md:space-y-12";
    case "split":
      return "max-w-6xl mx-auto w-full space-y-14 md:space-y-20 md:px-2";
    case "cards":
      return "max-w-5xl mx-auto w-full space-y-7 md:space-y-9";
    case "modern":
    default:
      return "max-w-3xl mx-auto w-full space-y-14 md:space-y-16";
  }
}

export function SectionRenderer({ website, editable = false, onChangeSection, onDeleteSection }) {
  const sections = website?.sections || [];
  const theme = website?.theme;
  const layout = website?.layout || "modern";
  const vars = themeVars(theme);
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        ...previewCanvasStyle(theme),
        ...vars,
        color: "var(--site-text)"
      }}
    >
      <div className={layoutStackClass(layout)} style={{ fontFamily: theme?.font }}>
        {sections.map((section, idx) => {
          const Comp = COMPONENTS[section.type];
          if (!Comp) return null;
          return (
            <Comp
              key={`${section.type}-${idx}`}
              content={section.content}
              theme={theme}
              editable={editable}
              onChange={(nextContent) => onChangeSection?.(idx, nextContent)}
              onDelete={() => onDeleteSection?.(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}

