// Blog cover images mapping
import coverMarketingJuridicoGuia from "@/assets/blog/cover-marketing-juridico-guia.jpg";
import coverAtrairClientes from "@/assets/blog/cover-atrair-clientes.jpg";
import coverRedesSociais from "@/assets/blog/cover-redes-sociais.jpg";
import coverSeoAdvocacia from "@/assets/blog/cover-seo-advocacia.jpg";
import coverEticaMarketing from "@/assets/blog/cover-etica-marketing.jpg";
import coverCasesSucesso from "@/assets/blog/cover-cases-sucesso.jpg";
import coverTendencias2025 from "@/assets/blog/cover-tendencias-2025.jpg";

export const blogCoverImages: Record<string, string> = {
  "marketing-juridico-digital-guia-completo-advogados-2024": coverMarketingJuridicoGuia,
  "como-atrair-clientes-internet-estrategias-advogados": coverAtrairClientes,
  "redes-sociais-advogados-linkedin-instagram": coverRedesSociais,
  "seo-escritorios-advocacia-aparecer-google": coverSeoAdvocacia,
  "etica-marketing-juridico-permitido-proibido": coverEticaMarketing,
  "cases-sucesso-advogadas-transformaram-carreiras": coverCasesSucesso,
  "tendencias-marketing-juridico-2025": coverTendencias2025,
};

export const getBlogCoverImage = (slug: string, coverImageUrl: string | null): string => {
  // First check if we have a local asset for this slug
  if (blogCoverImages[slug]) {
    return blogCoverImages[slug];
  }
  // Fall back to cover_image_url from database or placeholder
  return coverImageUrl || "/placeholder.svg";
};
