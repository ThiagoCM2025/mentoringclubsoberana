// Blog cover images mapping
import coverCaptarClientes from "@/assets/blog/cover-captar-clientes.jpg";
import coverMarketingDigital from "@/assets/blog/cover-marketing-digital.jpg";
import coverIaAdvocacia from "@/assets/blog/cover-ia-advocacia.jpg";
import coverTrafegoPago from "@/assets/blog/cover-trafego-pago.jpg";
import coverPrecificarHonorarios from "@/assets/blog/cover-precificar-honorarios.jpg";
import coverInstagramAdvogadas from "@/assets/blog/cover-instagram-advogadas.jpg";
import coverOabEtica from "@/assets/blog/cover-oab-etica.jpg";

export const blogCoverImages: Record<string, string> = {
  "como-captar-clientes-advocacia-guia-completo-2025": coverCaptarClientes,
  "marketing-digital-advogados-estrategias-funcionam": coverMarketingDigital,
  "como-usar-ia-advocacia-aumentar-produtividade": coverIaAdvocacia,
  "trafego-pago-advogados-vale-pena": coverTrafegoPago,
  "como-precificar-honorarios-advocaticios-corretamente": coverPrecificarHonorarios,
  "instagram-advogadas-como-atrair-clientes": coverInstagramAdvogadas,
  "oab-marketing-juridico-o-que-pode-nao-pode": coverOabEtica,
};

export const getBlogCoverImage = (slug: string, coverImageUrl: string | null): string => {
  // First check if we have a local asset for this slug
  if (blogCoverImages[slug]) {
    return blogCoverImages[slug];
  }
  // Fall back to cover_image_url from database or placeholder
  return coverImageUrl || "/placeholder.svg";
};
