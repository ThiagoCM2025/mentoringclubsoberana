import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  Link as LinkIcon,
  Upload,
  Trash2,
  FileImage,
  FileSpreadsheet,
  File,
  ExternalLink,
  Plus,
  ChevronDown,
  Loader2,
  X
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

interface PendingFile {
  file: File;
  title: string;
}

interface PendingLink {
  title: string;
  url: string;
}

interface LessonMaterialsSectionProps {
  lessonId?: string; // undefined for new lessons
  pendingFiles: PendingFile[];
  setPendingFiles: React.Dispatch<React.SetStateAction<PendingFile[]>>;
  pendingLinks: PendingLink[];
  setPendingLinks: React.Dispatch<React.SetStateAction<PendingLink[]>>;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const getFileIcon = (type: string | null, url?: string) => {
  if (type === 'external_link' || url?.startsWith('http')) {
    if (type === 'external_link') return <ExternalLink className="w-4 h-4 text-blue-500" />;
  }
  if (!type) return <File className="w-4 h-4 text-muted-foreground" />;
  if (type.includes("pdf")) return <FileText className="w-4 h-4 text-red-500" />;
  if (type.includes("word") || type.includes("document")) return <FileText className="w-4 h-4 text-blue-600" />;
  if (type.includes("excel") || type.includes("spreadsheet")) return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
  if (type.includes("powerpoint") || type.includes("presentation")) return <FileText className="w-4 h-4 text-orange-500" />;
  if (type.includes("image")) return <FileImage className="w-4 h-4 text-purple-500" />;
  return <File className="w-4 h-4 text-muted-foreground" />;
};

const getFileExtension = (type: string | null): string => {
  if (!type) return "";
  if (type === 'external_link') return "Link";
  if (type.includes("pdf")) return "PDF";
  if (type.includes("word") || type.includes("document")) return "DOC";
  if (type.includes("excel") || type.includes("spreadsheet")) return "XLS";
  if (type.includes("powerpoint") || type.includes("presentation")) return "PPT";
  if (type.includes("image")) return "IMG";
  return "";
};

const LessonMaterialsSection = ({
  lessonId,
  pendingFiles,
  setPendingFiles,
  pendingLinks,
  setPendingLinks,
}: LessonMaterialsSectionProps) => {
  const { toast } = useToast();
  const [existingMaterials, setExistingMaterials] = useState<Material[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Load existing materials for existing lessons
  useEffect(() => {
    const loadMaterials = async () => {
      if (!lessonId) {
        setExistingMaterials([]);
        return;
      }

      const { data, error } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setExistingMaterials(data);
      }
    };

    loadMaterials();
  }, [lessonId]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: PendingFile[] = [];

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `${file.name} não é um tipo permitido`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede 50MB`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push({
        file,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
      });
    }

    if (validFiles.length > 0) {
      // For existing lessons, upload immediately
      if (lessonId) {
        setUploading(true);
        try {
          for (const { file, title } of validFiles) {
            const ext = file.name.split(".").pop();
            const filePath = `${lessonId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from("course-materials")
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: publicUrl } = supabase.storage
              .from("course-materials")
              .getPublicUrl(filePath);

            await supabase.from("lesson_materials").insert({
              lesson_id: lessonId,
              title,
              file_url: publicUrl.publicUrl,
              file_type: file.type,
            });
          }

          // Refresh materials list
          const { data } = await supabase
            .from("lesson_materials")
            .select("*")
            .eq("lesson_id", lessonId)
            .order("created_at", { ascending: true });

          if (data) setExistingMaterials(data);

          toast({ title: `${validFiles.length} material(is) enviado(s)!` });
        } catch (error) {
          console.error("Upload error:", error);
          toast({ title: "Erro ao enviar arquivo", variant: "destructive" });
        } finally {
          setUploading(false);
        }
      } else {
        // For new lessons, add to pending files
        setPendingFiles((prev) => [...prev, ...validFiles]);
      }
    }
  }, [lessonId, toast, setPendingFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const addLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast({ title: "Preencha título e URL", variant: "destructive" });
      return;
    }

    // Validate URL
    try {
      new URL(newLinkUrl);
    } catch {
      toast({ title: "URL inválida", variant: "destructive" });
      return;
    }

    if (lessonId) {
      // For existing lessons, save immediately
      try {
        await supabase.from("lesson_materials").insert({
          lesson_id: lessonId,
          title: newLinkTitle,
          file_url: newLinkUrl,
          file_type: "external_link",
        });

        // Refresh materials list
        const { data } = await supabase
          .from("lesson_materials")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("created_at", { ascending: true });

        if (data) setExistingMaterials(data);
        toast({ title: "Link adicionado!" });
      } catch (error) {
        toast({ title: "Erro ao adicionar link", variant: "destructive" });
      }
    } else {
      // For new lessons, add to pending links
      setPendingLinks((prev) => [...prev, { title: newLinkTitle, url: newLinkUrl }]);
    }

    setNewLinkTitle("");
    setNewLinkUrl("");
    setLinkOpen(false);
  };

  const removeExistingMaterial = async (material: Material) => {
    try {
      // Delete from storage if it's an uploaded file (not an external link)
      if (material.file_type !== "external_link" && material.file_url.includes("course-materials")) {
        const urlParts = material.file_url.split("/course-materials/");
        if (urlParts[1]) {
          await supabase.storage.from("course-materials").remove([urlParts[1]]);
        }
      }

      await supabase.from("lesson_materials").delete().eq("id", material.id);

      setExistingMaterials((prev) => prev.filter((m) => m.id !== material.id));
      toast({ title: "Material removido" });
    } catch (error) {
      toast({ title: "Erro ao remover material", variant: "destructive" });
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removePendingLink = (index: number) => {
    setPendingLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const totalMaterials = existingMaterials.length + pendingFiles.length + pendingLinks.length;

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-secondary" />
          <Label className="font-medium">Materiais de Apoio</Label>
          {totalMaterials > 0 && (
            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
              {totalMaterials}
            </span>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
          ${isDragOver ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"}
          ${uploading ? "opacity-50 pointer-events-none" : ""}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("material-file-input")?.click()}
      >
        <input
          id="material-file-input"
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-secondary" />
            <span className="text-sm text-muted-foreground">Enviando...</span>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste arquivos ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, XLS, PPT, Imagens (máx 50MB)
            </p>
          </>
        )}
      </div>

      {/* Add External Link */}
      <Collapsible open={linkOpen} onOpenChange={setLinkOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LinkIcon className="w-4 h-4 mr-2" />
            Adicionar Link Externo
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${linkOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Input
            placeholder="Título do link"
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
          />
          <Input
            placeholder="https://..."
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
          />
          <Button size="sm" onClick={addLink} className="w-full">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Link
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Materials List */}
      {totalMaterials > 0 && (
        <div className="space-y-2">
          {/* Existing materials */}
          {existingMaterials.map((material) => (
            <div
              key={material.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 group"
            >
              {getFileIcon(material.file_type, material.file_url)}
              <span className="flex-1 text-sm truncate">{material.title}</span>
              <span className="text-xs text-muted-foreground">
                {getFileExtension(material.file_type)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                onClick={() => removeExistingMaterial(material)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}

          {/* Pending files (for new lessons) */}
          {pendingFiles.map((pf, index) => (
            <div
              key={`pending-file-${index}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10 border border-secondary/20"
            >
              {getFileIcon(pf.file.type)}
              <span className="flex-1 text-sm truncate">{pf.title}</span>
              <span className="text-xs text-secondary">Pendente</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => removePendingFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}

          {/* Pending links (for new lessons) */}
          {pendingLinks.map((pl, index) => (
            <div
              key={`pending-link-${index}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10 border border-secondary/20"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span className="flex-1 text-sm truncate">{pl.title}</span>
              <span className="text-xs text-secondary">Pendente</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => removePendingLink(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!lessonId && (pendingFiles.length > 0 || pendingLinks.length > 0) && (
        <p className="text-xs text-muted-foreground text-center">
          Os materiais serão salvos ao criar a aula
        </p>
      )}
    </div>
  );
};

export default LessonMaterialsSection;
