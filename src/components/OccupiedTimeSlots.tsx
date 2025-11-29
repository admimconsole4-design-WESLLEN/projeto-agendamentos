import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { Reservation, Equipment } from "@/lib/supabase";
import { format } from "date-fns";

interface OccupiedTimeSlotsProps {
  reservations: Reservation[];
  equipments: Equipment[];
  selectedDate: Date;
}

export const OccupiedTimeSlots = ({ reservations, equipments, selectedDate }: OccupiedTimeSlotsProps) => {
  if (reservations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Horários Ocupados
          </CardTitle>
          <CardDescription>
            {format(selectedDate, "dd/MM/yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum horário ocupado nesta data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Horários Ocupados
        </CardTitle>
        <CardDescription>
          {format(selectedDate, "dd/MM/yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reservations.map((reservation) => {
            const equipment = equipments.find(e => e.id === reservation.equipment_id);
            return (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/10"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{equipment?.name}</p>
                  <p className="text-xs text-muted-foreground">{reservation.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">
                    {reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
