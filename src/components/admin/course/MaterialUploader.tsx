import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Presentation,
  Trash2,
  Download,
  File,
  X,
  CheckCircle
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

interface MaterialUploaderProps {
  lessonId: string;
  materials: Material[];
  onMaterialsChange: () => void;
}

const MaterialUploader = ({ lessonId, materials, onMaterialsChange }: MaterialUploaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
  ];

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return File;
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("image")) return Image;
    if (fileType.includes("sheet") || fileType.includes("excel")) return FileSpreadsheet;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return Presentation;
    if (fileType.includes("word")) return FileText;
    return File;
  };

  const getFileExtension = (fileType: string | null): string => {
    if (!fileType) return "Arquivo";
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("png")) return "PNG";
    if (fileType.includes("jpeg") || fileType.includes("jpg")) return "JPG";
    if (fileType.includes("webp")) return "WEBP";
    if (fileType.includes("word") || fileType.includes("document")) return "DOCX";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "XLSX";
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "PPTX";
    return "Arquivo";
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    let uploaded = 0;

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Tipo não permitido",
          description: `${file.name} não é um tipo de arquivo permitido.`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 50MB.`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${lessonId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("course-materials")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("course-materials")
          .getPublicUrl(fileName);

        // Save to database
        const title = newMaterialTitle || file.name.replace(/\.[^/.]+$/, "");
        await supabase.from("lesson_materials").insert({
          lesson_id: lessonId,
          title: title,
          file_url: publicUrl,
          file_type: file.type
        });

        uploaded++;
        setUploadProgress((uploaded / totalFiles) * 100);
        setNewMaterialTitle("");
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Erro no upload",
          description: `Falha ao enviar ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setUploading(false);
    onMaterialsChange();
    
    if (uploaded > 0) {
      toast({
        title: "Upload concluído",
        description: `${uploaded} arquivo(s) enviado(s) com sucesso.`
      });
    }
  }, [lessonId, newMaterialTitle, onMaterialsChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDelete = async (materialId: string, fileUrl: string) => {
    if (!confirm("Excluir este material?")) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split("/course-materials/");
      if (urlParts.length > 1) {
        await supabase.storage
          .from("course-materials")
          .remove([urlParts[1]]);
      }

      await supabase.from("lesson_materials").delete().eq("id", materialId);
      
      onMaterialsChange();
      toast({ title: "Material excluído" });
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${dragOver 
            ? "border-secondary bg-secondary/10" 
            : "border-border hover:border-secondary/50"
          }
        `}
      >
        <input
          type="file"
          id="material-upload"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        
        <Upload className={`w-12 h-12 mx-auto mb-3 ${dragOver ? "text-secondary" : "text-muted-foreground"}`} />
        
        <p className="text-sm text-muted-foreground mb-2">
          Arraste arquivos aqui ou
        </p>
        
        <label htmlFor="material-upload">
          <Button variant="outline" size="sm" className="cursor-pointer" asChild>
            <span>Selecionar arquivos</span>
          </Button>
        </label>
        
        <p className="text-xs text-muted-foreground mt-3">
          PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG (máx. 50MB)
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
            Enviando arquivos...
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Optional: Title input before upload */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">
            Título personalizado (opcional - use antes de fazer upload)
          </Label>
          <Input
            value={newMaterialTitle}
            onChange={(e) => setNewMaterialTitle(e.target.value)}
            placeholder="Ex: Planilha de Planejamento"
            className="mt-1"
          />
        </div>
      </div>

      {/* Materials List */}
      {materials.length > 0 && (
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-medium">Materiais desta aula</Label>
          <div className="space-y-2">
            {materials.map((material) => {
              const FileIcon = getFileIcon(material.file_type);
              return (
                <div
                  key={material.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{material.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getFileExtension(material.file_type)}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(material.file_url, "_blank")}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(material.id, material.file_url)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {materials.length === 0 && !uploading && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Nenhum material adicionado ainda
        </div>
      )}
    </div>
  );
};

export default MaterialUploader;
