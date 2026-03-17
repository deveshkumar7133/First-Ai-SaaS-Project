"use client";

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

export function SectionRenderer({ website, editable = false, onChangeSection, onDeleteSection }) {
  const sections = website?.sections || [];
  return (
    <div className="space-y-10">
      {sections.map((section, idx) => {
        const Comp = COMPONENTS[section.type];
        if (!Comp) return null;
        return (
          <Comp
            key={`${section.type}-${idx}`}
            content={section.content}
            theme={website?.theme}
            editable={editable}
            onChange={(nextContent) => onChangeSection?.(idx, nextContent)}
            onDelete={() => onDeleteSection?.(idx)}
          />
        );
      })}
    </div>
  );
}

