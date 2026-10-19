import { getContent } from "@/lib/content";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

// Data terstruktur schema.org untuk mesin pencari: perusahaan dan kedua tokonya.
// Jam tutup belum diketahui, jadi openingHours sengaja tidak diisi.
export async function JsonLd() {
  const { settings, locations } = await getContent();
  const { company } = settings;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: company.legalName,
        alternateName: siteName,
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        description: siteDescription,
        sameAs: [company.instagram],
      },
      ...locations.map((l) => ({
        "@type": "HomeAndConstructionBusiness",
        name: l.name,
        parentOrganization: { "@id": `${siteUrl}/#organization` },
        url: siteUrl,
        image: `${siteUrl}/opengraph-image`,
        telephone: `+${l.phone.number}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: l.address.split(", Kab.")[0],
          addressLocality: l.locality,
          addressRegion: l.region,
          postalCode: l.postalCode,
          addressCountry: "ID",
        },
        hasMap: l.maps,
      })),
    ],
  };
  return (
    <script
      type="application/ld+json"
      // Escape "<" agar isi JSON tidak bisa menutup tag script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
