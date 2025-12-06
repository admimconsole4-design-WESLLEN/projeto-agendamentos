import { useState } from "react";
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
import { Trash2, ArrowLeft } from "lucide-react";
import { Equipment, deleteEquipment } from "@/lib/supabase";
import { toast } from "sonner";

interface DeleteEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  onEquipmentDeleted: () => void;
}

const CORRECT_PIN = "0705";

export function DeleteEquipmentModal({
  isOpen,
  onClose,
  equipments,
  onEquipmentDeleted,
}: DeleteEquipmentModalProps) {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePinComplete = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      if (value === CORRECT_PIN) {
        setIsAuthenticated(true);
        setPinError(false);
      } else {
        setPinError(true);
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  const handleClose = () => {
    setPin("");
    setIsAuthenticated(false);
    setPinError(false);
    setEquipmentToDelete(null);
    onClose();
  };

  const handleBack = () => {
    setIsAuthenticated(false);
    setPin("");
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEquipment(equipmentToDelete.id);
      toast.success(`"${equipmentToDelete.name}" excluído com sucesso`);
      onEquipmentDeleted();
      setEquipmentToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir equipamento");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {isAuthenticated ? "Gerenciar Equipamentos" : "Digite o código de acesso"}
            </DialogTitle>
          </DialogHeader>

          {!isAuthenticated ? (
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
          ) : (
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
    </>
  );
}
