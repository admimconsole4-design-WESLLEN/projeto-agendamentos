import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Equipment, Period } from "@/lib/supabase";
import { getPeriods } from "@/lib/supabase";
import { LessonSelector } from "./LessonSelector";
import { toast } from "sonner";

interface CalendarReservationModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  equipments: Equipment[];
  onSubmit: (data: {
    equipmentId: string;
    name: string;
    date: string;
    reservations: Array<{ periodId: string; lessonNumber: number }>;
  }) => Promise<void>;
}

export const CalendarReservationModal = ({
  open,
  onClose,
  selectedDate,
  equipments,
  onSubmit,
}: CalendarReservationModalProps) => {
  const [name, setName] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<Array<{ periodId: string; lessonNumber: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  useEffect(() => {
    if (open) {
      loadPeriods();
    }
  }, [open]);

  const loadPeriods = async () => {
    setLoadingPeriods(true);
    try {
      const data = await getPeriods();
      setPeriods(data);
    } catch (error: any) {
      toast.error("Erro ao carregar períodos: " + error.message);
    } finally {
      setLoadingPeriods(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipmentId) {
      toast.error("Selecione um equipamento");
      return;
    }

    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (selectedLessons.length === 0) {
      toast.error("Selecione pelo menos uma aula");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        equipmentId: selectedEquipmentId,
        name: name.trim(),
        date: format(selectedDate, "yyyy-MM-dd"),
        reservations: selectedLessons
      });
      
      // Reset form
      setName("");
      setSelectedEquipmentId("");
      setSelectedLessons([]);
      onClose();
      toast.success(`${selectedLessons.length} reserva(s) criada(s) com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar reserva");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedEquipmentId("");
    setSelectedLessons([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Reserva</DialogTitle>
            <DialogDescription>
              Reserva para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="equipment">Equipamento *</Label>
              <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipments.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Selecione as Aulas *</Label>
              {loadingPeriods ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <LessonSelector
                  periods={periods}
                  selectedLessons={selectedLessons}
                  onLessonChange={setSelectedLessons}
                />
              )}
              <p className="text-xs text-muted-foreground">
                {selectedLessons.length > 0 
                  ? `${selectedLessons.length} aula(s) selecionada(s)`
                  : "Selecione as aulas desejadas"}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || selectedLessons.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Reserva{selectedLessons.length > 1 ? `s (${selectedLessons.length})` : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
