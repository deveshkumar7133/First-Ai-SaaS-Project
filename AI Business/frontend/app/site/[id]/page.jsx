import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

// Force ISR caching - Revalidate every 60 seconds
export const revalidate = 60;

const SectionRenderer = dynamic(
  () => import("../../../components/dynamic/SectionRenderer").then((m) => m.SectionRenderer),
  { ssr: true }
);

const MobileAppRenderer = dynamic(
  () => import("../../../components/dynamic/MobileAppRenderer").then((m) => m.MobileAppRenderer),
  { ssr: true }
);

async function getWebsiteById(id) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  try {
    const res = await fetch(`${API_URL}/websites/public/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.website;
  } catch (error) {
    console.error("Failed to fetch website by id:", error);
    return null;
  }
}

// Generate SEO Metadata dynamically
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const website = await getWebsiteById(id);

  if (!website) {
    return {
      title: "Site Not Found | InstantSite AI",
      description: "The requested website could not be found."
    };
  }

  // Look for a hero section for description
  const heroSection = website.sections?.find(s => s.type === "hero");
  const description = heroSection?.content?.subtext || heroSection?.content?.headline || `Check out ${website.siteName}`;

  return {
    title: website.siteName,
    description: description,
    openGraph: {
      title: website.siteName,
      description: description,
      type: "website",
      siteName: website.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: website.siteName,
      description: description,
    }
  };
}

export default async function PublicSitePageById({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const website = await getWebsiteById(id);

  if (!website) {
    notFound();
  }

  if (website.type === "mobile") {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center p-4 sm:p-8">
         <div className="w-full max-w-md h-[800px] border-8 border-slate-900 rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-slate-800">
             <MobileAppRenderer appSpec={website.mobileSpec} theme={website.theme} />
         </div>
      </div>
    );
  }

  // Render website
  return (
    <SectionRenderer 
      website={website}
      editable={false}
      onChangeSection={() => {}}
      onDeleteSection={() => {}}
    />
  );
}
