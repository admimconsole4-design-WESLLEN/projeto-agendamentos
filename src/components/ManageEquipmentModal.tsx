import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, ArrowLeft, Plus, Minus, Loader2, CalendarX } from "lucide-react";
import { Equipment, Reservation, deleteEquipment, createEquipment, deleteReservation } from "@/lib/supabase";
import { toast } from "sonner";
import { format, parse, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ManageEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  reservations: Reservation[];
  onEquipmentChanged: () => void;
}

const CORRECT_PIN = "0705";

type ViewState = "pin" | "menu" | "add" | "delete" | "cancelReservation";

export function ManageEquipmentModal({
  isOpen,
  onClose,
  equipments,
  reservations,
  onEquipmentChanged,
}: ManageEquipmentModalProps) {
  const [pin, setPin] = useState("");
  const [viewState, setViewState] = useState<ViewState>("pin");
  const [pinError, setPinError] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  
  // Add equipment form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filter future reservations only
  const futureReservations = useMemo(() => {
    const now = new Date();
    return reservations.filter((reservation) => {
      const reservationDateTime = parse(
        `${reservation.date} ${reservation.startTime}`,
        "yyyy-MM-dd HH:mm:ss",
        new Date()
      );
      return isAfter(reservationDateTime, now);
    }).sort((a, b) => {
      const dateA = parse(`${a.date} ${a.startTime}`, "yyyy-MM-dd HH:mm:ss", new Date());
      const dateB = parse(`${b.date} ${b.startTime}`, "yyyy-MM-dd HH:mm:ss", new Date());
      return dateA.getTime() - dateB.getTime();
    });
  }, [reservations]);

  const getEquipmentName = (equipmentId: string) => {
    return equipments.find(e => e.id === equipmentId)?.name || "Equipamento";
  };

  const handlePinComplete = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      if (value === CORRECT_PIN) {
        setViewState("menu");
        setPinError(false);
      } else {
        setPinError(true);
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  const handleClose = () => {
    setPin("");
    setViewState("pin");
    setPinError(false);
    setEquipmentToDelete(null);
    setReservationToCancel(null);
    setNewName("");
    setNewDescription("");
    onClose();
  };

  const handleBack = () => {
    if (viewState === "menu") {
      setViewState("pin");
      setPin("");
    } else {
      setViewState("menu");
      setNewName("");
      setNewDescription("");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEquipment(equipmentToDelete.id);
      toast.success(`"${equipmentToDelete.name}" excluído com sucesso`);
      onEquipmentChanged();
      setEquipmentToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir equipamento");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return;

    setIsCanceling(true);
    try {
      await deleteReservation(reservationToCancel.id);
      toast.success("Agendamento cancelado com sucesso");
      onEquipmentChanged();
      setReservationToCancel(null);
    } catch (error) {
      toast.error("Erro ao cancelar agendamento");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleAddEquipment = async () => {
    if (!newName.trim()) {
      toast.error("Nome do equipamento é obrigatório");
      return;
    }

    setIsAdding(true);
    try {
      await createEquipment(newName.trim(), newDescription.trim() || undefined);
      toast.success(`"${newName}" adicionado com sucesso`);
      onEquipmentChanged();
      setNewName("");
      setNewDescription("");
      setViewState("menu");
    } catch (error) {
      toast.error("Erro ao adicionar equipamento");
    } finally {
      setIsAdding(false);
    }
  };

  const getTitle = () => {
    switch (viewState) {
      case "pin":
        return "Digite o código de acesso";
      case "menu":
        return "Gerenciar";
      case "add":
        return "Adicionar Equipamento";
      case "delete":
        return "Remover Equipamento";
      case "cancelReservation":
        return "Cancelar Agendamento";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewState !== "pin" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {getTitle()}
            </DialogTitle>
          </DialogHeader>

          {viewState === "pin" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-muted-foreground text-center">
                Digite o código de 4 dígitos para acessar
              </p>
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={handlePinComplete}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
              {pinError && (
                <p className="text-sm text-destructive animate-pulse">
                  Código incorreto
                </p>
              )}
            </div>
          )}

          {viewState === "menu" && (
            <div className="py-4 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14"
                onClick={() => setViewState("add")}
              >
                <Plus className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Adicionar Equipamento</p>
                  <p className="text-xs text-muted-foreground">Cadastrar novo equipamento</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14"
                onClick={() => setViewState("delete")}
              >
                <Minus className="h-5 w-5 text-destructive" />
                <div className="text-left">
                  <p className="font-medium">Remover Equipamento</p>
                  <p className="text-xs text-muted-foreground">Excluir equipamento existente</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14"
                onClick={() => setViewState("cancelReservation")}
              >
                <CalendarX className="h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Cancelar Agendamento</p>
                  <p className="text-xs text-muted-foreground">Cancelar reservas futuras</p>
                </div>
              </Button>
            </div>
          )}

          {viewState === "add" && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Equipamento *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Notebook Dell"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Para uso em sala de aula"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleAddEquipment}
                disabled={isAdding || !newName.trim()}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </>
                )}
              </Button>
            </div>
          )}

          {viewState === "delete" && (
            <div className="py-4">
              {equipments.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nenhum equipamento cadastrado
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {equipments.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="font-medium">{equipment.name}</p>
                        {equipment.description && (
                          <p className="text-sm text-muted-foreground">
                            {equipment.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setEquipmentToDelete(equipment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewState === "cancelReservation" && (
            <div className="py-4">
              {futureReservations.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nenhum agendamento futuro encontrado
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {futureReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{reservation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getEquipmentName(reservation.equipmentId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parse(reservation.date, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", { locale: ptBR })} • {reservation.startTime.slice(0, 5)} - {reservation.endTime.slice(0, 5)}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setReservationToCancel(reservation)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!equipmentToDelete}
        onOpenChange={() => setEquipmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{equipmentToDelete?.name}"?
              Esta ação não pode ser desfeita e todas as reservas deste
              equipamento serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!reservationToCancel}
        onOpenChange={() => setReservationToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento de "{reservationToCancel?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReservation}
              disabled={isCanceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling ? "Cancelando..." : "Cancelar Agendamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
