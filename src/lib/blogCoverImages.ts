// Blog cover images mapping
import coverMarketingJuridicoGuia from "@/assets/blog/cover-marketing-juridico-guia.jpg";
import coverAtrairClientes from "@/assets/blog/cover-atrair-clientes.jpg";
import coverRedesSociais from "@/assets/blog/cover-redes-sociais.jpg";
import coverSeoAdvocacia from "@/assets/blog/cover-seo-advocacia.jpg";
import coverEticaMarketing from "@/assets/blog/cover-etica-marketing.jpg";
import coverCasesSucesso from "@/assets/blog/cover-cases-sucesso.jpg";
import coverTendencias2025 from "@/assets/blog/cover-tendencias-2025.jpg";

export const blogCoverImages: Record<string, string> = {
  // Slugs corretos do banco de dados
  "como-captar-clientes-advocacia-guia-completo-2025": coverAtrairClientes,
  "marketing-digital-advogados-estrategias-funcionam": coverMarketingJuridicoGuia,
  "como-usar-ia-advocacia-aumentar-produtividade": coverTendencias2025,
  "trafego-pago-advogados-vale-pena": coverSeoAdvocacia,
  "como-precificar-honorarios-advocaticios-corretamente": coverCasesSucesso,
  "instagram-advogadas-como-atrair-clientes": coverRedesSociais,
  "oab-marketing-juridico-o-que-pode-nao-pode": coverEticaMarketing,
};

export const getBlogCoverImage = (slug: string, coverImageUrl: string | null): string => {
  // First check if we have a local asset for this slug
  if (blogCoverImages[slug]) {
    return blogCoverImages[slug];
  }
  // Fall back to cover_image_url from database or placeholder
  return coverImageUrl || "/placeholder.svg";
};
