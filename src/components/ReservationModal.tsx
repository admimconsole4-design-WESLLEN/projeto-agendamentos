import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Equipment, Period, Reservation } from "@/lib/supabase";
import { getPeriods, getReservations } from "@/lib/supabase";
import { LessonSelector } from "./LessonSelector";
import { toast } from "sonner";

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onSubmit: (data: {
    equipmentId: string;
    name: string;
    date: string;
    reservations: Array<{ periodId: string; lessonNumber: number }>;
  }) => Promise<void>;
}

export const ReservationModal = ({
  open,
  onClose,
  equipment,
  onSubmit,
}: ReservationModalProps) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<Array<{ periodId: string; lessonNumber: number }>>([]);
  const [existingReservations, setExistingReservations] = useState<Array<{ periodId: string; lessonNumber: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);

  useEffect(() => {
    if (open) {
      loadPeriods();
    }
  }, [open]);

  useEffect(() => {
    if (open && equipment && date) {
      loadExistingReservations();
    } else {
      setExistingReservations([]);
    }
  }, [open, equipment, date]);

  const loadPeriods = async () => {
    setLoadingPeriods(true);
    try {
      const data = await getPeriods();
      setPeriods(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error("Erro ao carregar períodos: " + errorMessage);
    } finally {
      setLoadingPeriods(false);
    }
  };

  const loadExistingReservations = async () => {
    if (!equipment || !date) return;

    setLoadingReservations(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const allReservations = await getReservations();
      
      // Filtrar reservas para este equipamento e data
      const equipmentReservations = allReservations
        .filter(r => r.equipmentId === equipment.id && r.date === dateStr)
        .map(r => ({ periodId: r.periodId, lessonNumber: r.lessonNumber }));
      
      setExistingReservations(equipmentReservations);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error("Erro ao carregar reservas existentes: " + errorMessage);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment || !date) {
      toast.error("Preencha todos os campos obrigatórios");
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
        equipmentId: equipment.id,
        name: name.trim(),
        date: format(date, "yyyy-MM-dd"),
        reservations: selectedLessons
      });
      
      // Reset form
      setName("");
      setDate(undefined);
      setSelectedLessons([]);
      setExistingReservations([]);
      onClose();
      toast.success(`${selectedLessons.length} reserva(s) criada(s) com sucesso!`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar reserva';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reservar Equipamento</DialogTitle>
            <DialogDescription>
              {equipment?.name} - Informe seu nome e selecione as aulas desejadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Selecione as Aulas *</Label>
              {loadingPeriods || loadingReservations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <LessonSelector
                  periods={periods}
                  selectedLessons={selectedLessons}
                  onLessonChange={setSelectedLessons}
                  existingReservations={existingReservations}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
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
