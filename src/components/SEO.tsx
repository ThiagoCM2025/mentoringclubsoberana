import { Helmet } from "react-helmet-async";

const BASE_URL = "https://soberanamentoria.com.br";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  type?: "website" | "article" | "product" | "course";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  twitterCard?: "summary" | "summary_large_image";
  schema?: object;
}

const SEO = ({
  title = "Soberana Mentoring Club - Transforme sua Carreira Jurídica",
  description = "Programa de mentoria exclusivo para advogadas que desejam construir uma carreira jurídica de sucesso, com autonomia e excelência.",
  keywords = "mentoria jurídica, advogada, carreira jurídica, advocacia feminina, desenvolvimento profissional",
  image = "/assets/brand/isotipo-gold.png",
  imageWidth = 1200,
  imageHeight = 630,
  url = BASE_URL,
  type = "website",
  author = "Fabiana Soberana",
  publishedTime,
  modifiedTime,
  twitterCard = "summary_large_image",
  schema
}: SEOProps) => {
  // Garantir URLs absolutas para Open Graph (importante para Instagram/Facebook)
  const absoluteImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const absoluteUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  const structuredData = schema || {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Soberana Mentoring Club",
    "description": description,
    "url": absoluteUrl,
    "logo": `${BASE_URL}/assets/brand/isotipo-gold.png`,
    "sameAs": [
      "https://instagram.com/soberanamentoria",
      "https://linkedin.com/company/soberana"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contato@soberanamentoria.com.br"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-BR" />
      
      {/* Open Graph / Facebook / Instagram - URLs absolutas obrigatórias */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Soberana Mentoring Club" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={absoluteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Article specific */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={absoluteUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;

// Course Schema helper
export const createCourseSchema = (course: {
  title: string;
  description: string;
  instructor: string;
  price?: number;
  url: string;
  thumbnail?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": course.title,
  "description": course.description,
  "provider": {
    "@type": "Organization",
    "name": "Soberana Mentoring Club"
  },
  "instructor": {
    "@type": "Person",
    "name": course.instructor
  },
  ...(course.price && {
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "BRL"
    }
  }),
  "url": course.url,
  ...(course.thumbnail && { "image": course.thumbnail })
});

// FAQ Schema helper
export const createFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});
