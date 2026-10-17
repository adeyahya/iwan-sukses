import { company, locations } from "@/lib/data";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

// Data terstruktur schema.org untuk mesin pencari: perusahaan dan kedua tokonya.
// Jam tutup belum diketahui, jadi openingHours sengaja tidak diisi.
const regions: Record<string, { locality: string; region: string; postalCode: string }> = {
  Pusat: { locality: "Kabupaten Probolinggo", region: "Jawa Timur", postalCode: "67261" },
  "Cabang Bali": { locality: "Kabupaten Tabanan", region: "Bali", postalCode: "82121" },
};

export function JsonLd() {
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
          addressLocality: regions[l.tag].locality,
          addressRegion: regions[l.tag].region,
          postalCode: regions[l.tag].postalCode,
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
