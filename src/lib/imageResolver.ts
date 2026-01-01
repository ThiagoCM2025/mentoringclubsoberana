// ES6 imports for program images
import programWorkshopIA from "@/assets/programs/program-workshop-ia.jpg";
import programExperienceStart from "@/assets/programs/program-experience-start.jpg";
import programAceleracao from "@/assets/programs/program-aceleracao.jpg";
import programMentoria360 from "@/assets/programs/program-mentoria-360.jpg";
import programElite from "@/assets/programs/program-elite.jpg";

// Map static paths to ES6 imported images
const imageMap: Record<string, string> = {
  // Public assets paths (stored in database)
  "/assets/programs/program-workshop-ia.jpg": programWorkshopIA,
  "/assets/programs/program-experience-start.jpg": programExperienceStart,
  "/assets/programs/program-aceleracao.jpg": programAceleracao,
  "/assets/programs/program-mentoria-360.jpg": programMentoria360,
  "/assets/programs/program-elite.jpg": programElite,
  
  // Alternative paths without leading slash
  "assets/programs/program-workshop-ia.jpg": programWorkshopIA,
  "assets/programs/program-experience-start.jpg": programExperienceStart,
  "assets/programs/program-aceleracao.jpg": programAceleracao,
  "assets/programs/program-mentoria-360.jpg": programMentoria360,
  "assets/programs/program-elite.jpg": programElite,
};

/**
 * Resolves image URLs from database paths to ES6 imported modules.
 * This ensures images are correctly bundled by Vite regardless of path format.
 */
export const resolveImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Check if we have a mapped ES6 import for this path
  if (imageMap[url]) {
    return imageMap[url];
  }
  
  // Return original URL (for external URLs or already-processed imports)
  return url;
};
