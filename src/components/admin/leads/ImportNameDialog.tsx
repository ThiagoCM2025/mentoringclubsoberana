import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Tag } from 'lucide-react';

interface ImportNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onConfirm: (listName: string) => void;
  onCancel: () => void;
}

export function ImportNameDialog({
  open,
  onOpenChange,
  filename,
  onConfirm,
  onCancel,
}: ImportNameDialogProps) {
  const [listName, setListName] = useState('');

  // Sugerir nome baseado no filename
  useEffect(() => {
    if (filename) {
      const suggested = filename
        .replace(/\.(xlsx|xls|csv)$/i, '')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Capitalize first letter of each word
      const capitalized = suggested
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setListName(capitalized);
    }
  }, [filename]);

  const handleConfirm = () => {
    if (listName.trim()) {
      onConfirm(listName.trim());
    }
  };

  const handleClose = () => {
    setListName('');
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Nomear Lista de Importação
          </DialogTitle>
          <DialogDescription>
            Dê um nome para identificar esta lista no disparo de campanhas
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="listName">Nome da Lista</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Lista Evento SP Janeiro"
              autoFocus
            />
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <FileSpreadsheet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{filename}</span>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!listName.trim()}>
            Iniciar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
