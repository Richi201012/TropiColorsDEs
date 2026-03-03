import type { ReactNode } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  children?: ReactNode;
}

const DEFAULT_SEO = {
  title: "Tropicolors - Colorantes Artificiales de Alta Calidad",
  description: "Colorantes artificiales para alimentos y productos de limpieza. Alta concentración, colores intensos y calidad garantizada en México.",
  image: "/og-image.jpg",
  siteName: "Tropicolors",
  twitterHandle: "@tropicolors",
};

/**
 * SEO Head component for meta tags
 * Add this to your pages for better SEO
 */
export function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  children
}: SEOProps) {
  const siteTitle = title ? `${title} | ${DEFAULT_SEO.siteName}` : DEFAULT_SEO.title;
  const metaDescription = description || DEFAULT_SEO.description;
  const metaImage = image ? `${image}` : DEFAULT_SEO.image;
  const canonicalUrl = url;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULT_SEO.siteName} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {metaImage && <meta property="og:image" content={metaImage} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:site" content={DEFAULT_SEO.twitterHandle} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={metaDescription} />
      {metaImage && <meta property="twitter:image" content={metaImage} />}

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="author" content="Tropicolors" />
      
      {/* Language */}
      <html lang="es-MX" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" href="/favicon.png" />

      {/* Children for additional head elements */}
      {children}
    </>
  );
}
