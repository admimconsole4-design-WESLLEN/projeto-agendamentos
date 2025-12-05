import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Equipment } from "@/lib/supabase";
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
    startTime: string;
    endTime: string;
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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipmentId || !startTime || !endTime) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Horário de início deve ser antes do fim");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        equipmentId: selectedEquipmentId,
        name: name.trim(),
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime,
        endTime,
      });
      
      // Reset form
      setName("");
      setSelectedEquipmentId("");
      setStartTime("");
      setEndTime("");
      onClose();
      toast.success("Reserva criada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar reserva");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedEquipmentId("");
    setStartTime("");
    setEndTime("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Horário Início *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endTime">Horário Fim *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Escolha qualquer horário. Ex: 8:00 às 9:30, 14:00 às 16:45
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || equipments.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
