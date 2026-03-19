import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
}

export const AddEquipmentModal = ({ open, onClose, onSubmit }: AddEquipmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Nome do equipamento é obrigatório");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(name.trim(), description.trim() || undefined);
      toast.success("Equipamento adicionado com sucesso!");
      setName("");
      setDescription("");
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error("Erro ao adicionar equipamento: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Equipamento</DialogTitle>
          <DialogDescription>
            Adicione um novo equipamento ao sistema
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Equipamento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Notebook Dell"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Notebook com 16GB RAM, processador i7"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
