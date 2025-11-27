import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Reservation, Equipment } from "@/lib/supabase";

interface ReservationsListProps {
  reservations: Reservation[];
  equipments: Equipment[];
  onDelete: (id: string) => void;
}

export const ReservationsList = ({ reservations, equipments, onDelete }: ReservationsListProps) => {
  const getEquipmentName = (equipmentId: string) => {
    return equipments.find((e) => e.id === equipmentId)?.name || "Desconhecido";
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma reserva encontrada
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipamento</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell className="font-medium">
                {getEquipmentName(reservation.equipment_id)}
              </TableCell>
              <TableCell>{reservation.name}</TableCell>
              <TableCell>{reservation.phone}</TableCell>
              <TableCell>
                {format(new Date(reservation.date + "T00:00:00"), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(reservation.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
